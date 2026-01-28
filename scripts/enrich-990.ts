import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// ProPublica Nonprofit Explorer API - free, no key required
const PROPUBLICA_API = 'https://projects.propublica.org/nonprofits/api/v2';

interface Organization990 {
  ein: string;
  name: string;
  state: string;
  city: string;
  totalRevenue: number | null;
  totalExpenses: number | null;
  totalAssets: number | null;
  taxPeriod: string | null;
  execCompensation: number | null;
}

async function searchNonprofit(name: string, state: string): Promise<Organization990 | null> {
  try {
    // Search for organization
    const searchQuery = encodeURIComponent(name.substring(0, 50));
    const response = await fetch(`${PROPUBLICA_API}/search.json?q=${searchQuery}&state%5Bid%5D=${state}`);

    if (!response.ok) return null;

    const data = await response.json();

    if (data.organizations && data.organizations.length > 0) {
      // Find best match
      const org = data.organizations[0];

      // Get detailed filings
      const detailResponse = await fetch(`${PROPUBLICA_API}/organizations/${org.ein}.json`);
      if (!detailResponse.ok) return { ...org, totalRevenue: null, totalExpenses: null, totalAssets: null, taxPeriod: null, execCompensation: null };

      const detail = await detailResponse.json();
      const filing = detail.filings_with_data?.[0];

      return {
        ein: org.ein,
        name: org.name,
        state: org.state,
        city: org.city,
        totalRevenue: filing?.totrevenue || null,
        totalExpenses: filing?.totfuncexpns || null,
        totalAssets: filing?.totassetsend || null,
        taxPeriod: filing?.tax_prd_yr || null,
        execCompensation: filing?.compnsatncurrofcr || null
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

async function addColumns() {
  console.log('📊 Adding 990 columns to database...');
  await sql`
    ALTER TABLE hospice_providers
    ADD COLUMN IF NOT EXISTS ein VARCHAR(15),
    ADD COLUMN IF NOT EXISTS nonprofit_revenue DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS nonprofit_expenses DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS nonprofit_assets DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS nonprofit_tax_year INTEGER,
    ADD COLUMN IF NOT EXISTS exec_compensation DECIMAL(15, 2)
  `;
  console.log('✅ Columns ready\n');
}

async function main() {
  console.log('📋 Starting ProPublica 990 enrichment...\n');

  await addColumns();

  // Get nonprofit providers without 990 data
  const providers = await sql`
    SELECT ccn, provider_name, city, state
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
      AND (ownership_type_cms ILIKE '%non%profit%' OR ownership_type_cms ILIKE '%voluntary%')
      AND ein IS NULL
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
    LIMIT 300
  `;

  console.log(`Found ${providers.length} nonprofit providers to enrich\n`);

  let enriched = 0;
  let notFound = 0;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];

    // Rate limit
    if (i > 0 && i % 10 === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const result = await searchNonprofit(provider.provider_name, provider.state);

    if (result && result.ein) {
      try {
        await sql`
          UPDATE hospice_providers
          SET
            ein = ${result.ein},
            nonprofit_revenue = ${result.totalRevenue},
            nonprofit_expenses = ${result.totalExpenses},
            nonprofit_assets = ${result.totalAssets},
            nonprofit_tax_year = ${result.taxPeriod ? parseInt(result.taxPeriod) : null},
            exec_compensation = ${result.execCompensation}
          WHERE ccn = ${provider.ccn}
        `;
        enriched++;
      } catch (error) {
        console.error(`Error updating ${provider.ccn}:`, error);
      }
    } else {
      notFound++;
    }

    if ((i + 1) % 25 === 0) {
      console.log(`   Processed ${i + 1}/${providers.length} (${enriched} enriched, ${notFound} not found)`);
    }
  }

  console.log(`\n✅ 990 enrichment complete!`);
  console.log(`   Enriched: ${enriched} providers`);
  console.log(`   Not found: ${notFound} providers`);

  // Show sample
  const sample = await sql`
    SELECT provider_name, ein, nonprofit_revenue, nonprofit_assets, exec_compensation, nonprofit_tax_year
    FROM hospice_providers
    WHERE ein IS NOT NULL
    ORDER BY nonprofit_revenue DESC NULLS LAST
    LIMIT 5
  `;

  if (sample.length > 0) {
    console.log('\n📋 Top nonprofits by 990 revenue:');
    for (const row of sample) {
      const revenue = row.nonprofit_revenue ? `$${(Number(row.nonprofit_revenue) / 1000000).toFixed(1)}M` : 'N/A';
      const assets = row.nonprofit_assets ? `$${(Number(row.nonprofit_assets) / 1000000).toFixed(1)}M` : 'N/A';
      console.log(`   ${row.provider_name} (EIN: ${row.ein})`);
      console.log(`      Revenue: ${revenue} | Assets: ${assets} (${row.nonprofit_tax_year})`);
    }
  }

  // Stats
  const stats = await sql`
    SELECT
      COUNT(ein) as with_990,
      ROUND(AVG(nonprofit_revenue)) as avg_revenue,
      ROUND(AVG(nonprofit_assets)) as avg_assets
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
  `;

  console.log(`\n📊 990 Stats:`);
  console.log(`   Providers with 990 data: ${stats[0].with_990}`);
  if (stats[0].avg_revenue) {
    console.log(`   Average 990 revenue: $${(Number(stats[0].avg_revenue) / 1000000).toFixed(2)}M`);
  }
}

main().catch(console.error);
