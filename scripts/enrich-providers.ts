/**
 * Hospice Provider Data Enrichment Script
 *
 * Fetches data from CMS public datasets and enriches our database:
 * - Hospice General Information: Address, phone, ownership
 * - Hospice Quality Measures: Quality scores, survey results
 *
 * Sources:
 * - https://data.cms.gov/provider-data/dataset/yc9t-dgbk (General Info)
 * - https://data.cms.gov/provider-data/dataset/252m-zfp9 (Provider Data)
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// CMS Data URLs - these are the direct CSV download links
const CMS_GENERAL_INFO_URL = 'https://data.cms.gov/provider-data/sites/default/files/resources/e49674eb0b3c2dd749563637f3b79a15_1763064336/Hospice_General-Information_Nov2025.csv';
const CMS_PROVIDER_DATA_URL = 'https://data.cms.gov/provider-data/api/1/datastore/query/252m-zfp9/0?limit=10000&offset=0';

interface CMSGeneralInfo {
  ccn: string;
  facility_name: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  zip_code: string;
  county: string;
  phone: string;
  cms_region: string;
  ownership_type: string;
  certification_date: string;
}

interface CMSProviderData {
  ccn: string;
  measure_code: string;
  score: string;
}

async function fetchCMSGeneralInfo(): Promise<CMSGeneralInfo[]> {
  console.log('Fetching CMS General Information data...');

  try {
    const response = await fetch(CMS_GENERAL_INFO_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const csvText = await response.text();
    const lines = csvText.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["\s]/g, '_'));

    console.log('CSV Headers:', headers);

    const data: CMSGeneralInfo[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      // Handle CSV with quoted fields
      const values = parseCSVLine(lines[i]);

      if (values.length >= 12) {
        data.push({
          ccn: values[0]?.replace(/"/g, '').trim() || '',
          facility_name: values[1]?.replace(/"/g, '').trim() || '',
          address_line_1: values[2]?.replace(/"/g, '').trim() || '',
          address_line_2: values[3]?.replace(/"/g, '').trim() || '',
          city: values[4]?.replace(/"/g, '').trim() || '',
          state: values[5]?.replace(/"/g, '').trim() || '',
          zip_code: values[6]?.replace(/"/g, '').trim() || '',
          county: values[7]?.replace(/"/g, '').trim() || '',
          phone: values[8]?.replace(/"/g, '').trim() || '',
          cms_region: values[9]?.replace(/"/g, '').trim() || '',
          ownership_type: values[10]?.replace(/"/g, '').trim() || '',
          certification_date: values[11]?.replace(/"/g, '').trim() || '',
        });
      }
    }

    console.log(`Parsed ${data.length} records from CMS General Info`);
    return data;
  } catch (error) {
    console.error('Error fetching CMS data:', error);
    return [];
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

function formatPhoneNumber(phone: string): string | null {
  if (!phone) return null;

  // Remove all non-numeric characters
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits[0] === '1') {
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }

  return phone; // Return original if can't format
}

async function enrichProviders(data: CMSGeneralInfo[]) {
  console.log('\nEnriching provider data in database...');

  let updated = 0;
  let notFound = 0;
  let errors = 0;

  // Process in batches of 100
  const batchSize = 100;

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    for (const provider of batch) {
      if (!provider.ccn) continue;

      try {
        const phone = formatPhoneNumber(provider.phone);

        const result = await sql`
          UPDATE hospice_providers
          SET
            address_line_1 = COALESCE(${provider.address_line_1 || null}, address_line_1),
            address_line_2 = COALESCE(${provider.address_line_2 || null}, address_line_2),
            zip_code = COALESCE(${provider.zip_code || null}, zip_code),
            phone_number = COALESCE(${phone}, phone_number)
          WHERE ccn = ${provider.ccn}
          RETURNING ccn
        `;

        if (result.length > 0) {
          updated++;
        } else {
          notFound++;
        }
      } catch (error) {
        errors++;
        console.error(`Error updating ${provider.ccn}:`, error);
      }
    }

    // Progress update
    console.log(`Processed ${Math.min(i + batchSize, data.length)}/${data.length} records...`);
  }

  console.log('\n=== Enrichment Complete ===');
  console.log(`Updated: ${updated}`);
  console.log(`Not found in DB: ${notFound}`);
  console.log(`Errors: ${errors}`);
}

async function getEnrichmentStats() {
  console.log('\n=== Current Data Quality ===');

  const stats = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(address_line_1) as has_address,
      COUNT(phone_number) as has_phone,
      COUNT(website) as has_website,
      COUNT(CASE WHEN classification = 'GREEN' THEN 1 END) as green_count,
      COUNT(CASE WHEN classification = 'YELLOW' THEN 1 END) as yellow_count
    FROM hospice_providers
  `;

  const s = stats[0];
  console.log(`Total providers: ${s.total}`);
  console.log(`With address: ${s.has_address} (${((s.has_address / s.total) * 100).toFixed(1)}%)`);
  console.log(`With phone: ${s.has_phone} (${((s.has_phone / s.total) * 100).toFixed(1)}%)`);
  console.log(`With website: ${s.has_website} (${((s.has_website / s.total) * 100).toFixed(1)}%)`);
  console.log(`GREEN targets: ${s.green_count}`);
  console.log(`YELLOW targets: ${s.yellow_count}`);
}

async function main() {
  console.log('=== Hospice Provider Data Enrichment ===\n');

  // Show current stats
  await getEnrichmentStats();

  // Fetch CMS data
  const cmsData = await fetchCMSGeneralInfo();

  if (cmsData.length > 0) {
    // Enrich our database
    await enrichProviders(cmsData);

    // Show updated stats
    await getEnrichmentStats();
  } else {
    console.log('No CMS data fetched, skipping enrichment.');
  }
}

main().catch(console.error);
