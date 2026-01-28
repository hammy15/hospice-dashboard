import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// NPPES NPI Registry API - free, no key required
const NPI_API_BASE = 'https://npiregistry.cms.hhs.gov/api/';

interface NPIResult {
  npi: string;
  organizationName: string;
  authorizedOfficialName: string | null;
  authorizedOfficialTitle: string | null;
  authorizedOfficialPhone: string | null;
  taxonomyCode: string | null;
  taxonomyDesc: string | null;
  enumerationDate: string | null;
  lastUpdated: string | null;
}

async function searchNPI(providerName: string, state: string, city?: string): Promise<NPIResult | null> {
  try {
    // Search for organization NPIs (type 2) with hospice taxonomy
    const params = new URLSearchParams({
      version: '2.1',
      enumeration_type: 'NPI-2', // Organizations only
      organization_name: providerName.substring(0, 50), // API limit
      state: state,
      taxonomy_description: 'Hospice',
      limit: '5'
    });

    if (city) {
      params.set('city', city);
    }

    const response = await fetch(`${NPI_API_BASE}?${params}`);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.result_count > 0 && data.results) {
      const result = data.results[0];
      const basic = result.basic || {};
      const addresses = result.addresses || [];
      const taxonomies = result.taxonomies || [];

      // Get primary taxonomy
      const primaryTaxonomy = taxonomies.find((t: any) => t.primary) || taxonomies[0];

      // Get authorized official info
      const authOfficial = basic.authorized_official_first_name
        ? `${basic.authorized_official_first_name} ${basic.authorized_official_last_name}`
        : null;

      return {
        npi: result.number,
        organizationName: basic.organization_name,
        authorizedOfficialName: authOfficial,
        authorizedOfficialTitle: basic.authorized_official_title_or_position || null,
        authorizedOfficialPhone: basic.authorized_official_telephone_number || null,
        taxonomyCode: primaryTaxonomy?.code || null,
        taxonomyDesc: primaryTaxonomy?.desc || null,
        enumerationDate: basic.enumeration_date || null,
        lastUpdated: basic.last_updated || null
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function addColumns() {
  console.log('📊 Adding NPI columns to database...');
  await sql`
    ALTER TABLE hospice_providers
    ADD COLUMN IF NOT EXISTS npi VARCHAR(10),
    ADD COLUMN IF NOT EXISTS authorized_official VARCHAR(100),
    ADD COLUMN IF NOT EXISTS authorized_official_title VARCHAR(100),
    ADD COLUMN IF NOT EXISTS authorized_official_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS taxonomy_code VARCHAR(20),
    ADD COLUMN IF NOT EXISTS taxonomy_desc VARCHAR(200),
    ADD COLUMN IF NOT EXISTS npi_enumeration_date DATE,
    ADD COLUMN IF NOT EXISTS npi_last_updated DATE
  `;
  console.log('✅ Columns ready\n');
}

async function main() {
  console.log('🏥 Starting NPI Registry enrichment...\n');

  await addColumns();

  // Get providers without NPI
  const providers = await sql`
    SELECT ccn, provider_name, city, state
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
      AND npi IS NULL
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
    LIMIT 500
  `;

  console.log(`Found ${providers.length} providers to enrich\n`);

  let enriched = 0;
  let notFound = 0;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];

    // Rate limit - NPI API allows ~20 requests/second
    if (i > 0 && i % 20 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const npiResult = await searchNPI(provider.provider_name, provider.state, provider.city);

    if (npiResult) {
      try {
        await sql`
          UPDATE hospice_providers
          SET
            npi = ${npiResult.npi},
            authorized_official = ${npiResult.authorizedOfficialName},
            authorized_official_title = ${npiResult.authorizedOfficialTitle},
            authorized_official_phone = ${npiResult.authorizedOfficialPhone},
            taxonomy_code = ${npiResult.taxonomyCode},
            taxonomy_desc = ${npiResult.taxonomyDesc},
            npi_enumeration_date = ${npiResult.enumerationDate},
            npi_last_updated = ${npiResult.lastUpdated}
          WHERE ccn = ${provider.ccn}
        `;
        enriched++;
      } catch (error) {
        console.error(`Error updating ${provider.ccn}:`, error);
      }
    } else {
      notFound++;
    }

    if ((i + 1) % 50 === 0) {
      console.log(`   Processed ${i + 1}/${providers.length} (${enriched} enriched, ${notFound} not found)`);
    }
  }

  console.log(`\n✅ NPI enrichment complete!`);
  console.log(`   Enriched: ${enriched} providers`);
  console.log(`   Not found: ${notFound} providers`);

  // Show sample
  const sample = await sql`
    SELECT provider_name, npi, authorized_official, authorized_official_title
    FROM hospice_providers
    WHERE npi IS NOT NULL
    ORDER BY overall_score DESC
    LIMIT 5
  `;

  if (sample.length > 0) {
    console.log('\n📋 Sample enriched data:');
    for (const row of sample) {
      console.log(`   ${row.provider_name}`);
      console.log(`      NPI: ${row.npi}`);
      if (row.authorized_official) {
        console.log(`      Official: ${row.authorized_official} (${row.authorized_official_title || 'N/A'})`);
      }
    }
  }

  // Stats
  const stats = await sql`
    SELECT
      COUNT(npi) as with_npi,
      COUNT(authorized_official) as with_official
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
  `;

  console.log(`\n📊 NPI Stats:`);
  console.log(`   Providers with NPI: ${stats[0].with_npi}`);
  console.log(`   With authorized official: ${stats[0].with_official}`);
}

main().catch(console.error);
