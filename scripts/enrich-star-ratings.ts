/**
 * Enrich Hospice Provider Data with CMS Star Ratings
 *
 * Fetches data from CMS Hospice Compare (November 2025 release):
 * - Quality of Patient Care Star Rating (from General Information)
 * - CAHPS Hospice Survey Star Rating (Family Caregiver Survey)
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// CMS Hospice Data URLs - November 2025 release
const HOSPICE_GENERAL_URL = 'https://data.cms.gov/provider-data/sites/default/files/resources/e49674eb0b3c2dd749563637f3b79a15_1763064336/Hospice_General-Information_Nov2025.csv';
const HOSPICE_CAHPS_URL = 'https://data.cms.gov/provider-data/sites/default/files/resources/3813eafd69c5e41b82815d79a063671b_1763064342/Provider_CAHPS_Hospice_Survey_Data_Nov2025.csv';

interface StarRatingRecord {
  ccn: string;
  qualityStarRating: number | null;
  cahpsStarRating: number | null;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim().replace(/^"|"$/g, ''));

  return values;
}

function parseRating(val: string | undefined): number | null {
  if (!val) return null;
  const cleaned = val.trim();
  if (cleaned === '' ||
      cleaned.toLowerCase().includes('not available') ||
      cleaned.toLowerCase().includes('not applicable') ||
      cleaned === 'N/A' ||
      cleaned === '-') {
    return null;
  }
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

async function fetchGeneralInfo(): Promise<Map<string, { qualityStarRating: number | null }>> {
  console.log('Downloading Hospice General Information...');

  const response = await fetch(HOSPICE_GENERAL_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch General Info CSV: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]).map(h =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '_')
  );

  console.log('General Info Headers:', headers.slice(0, 15));

  // Find column indices
  const ccnIdx = headers.findIndex(h => h.includes('ccn') || h.includes('certification_number'));
  const qualityStarIdx = headers.findIndex(h =>
    h.includes('quality') && h.includes('star')
  );

  console.log(`CCN index: ${ccnIdx}, Quality Star index: ${qualityStarIdx}`);

  // Show all columns with 'star' or 'rating'
  const ratingCols = headers.filter(h => h.includes('star') || h.includes('rating'));
  if (ratingCols.length > 0) {
    console.log('Rating columns found:', ratingCols);
  }

  const dataMap = new Map<string, { qualityStarRating: number | null }>();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const ccn = values[ccnIdx]?.trim();
    if (!ccn) continue;

    const qualityStarRating = qualityStarIdx !== -1 ? parseRating(values[qualityStarIdx]) : null;
    dataMap.set(ccn, { qualityStarRating });
  }

  let withRating = 0;
  for (const record of dataMap.values()) {
    if (record.qualityStarRating !== null) withRating++;
  }

  console.log(`General Info: ${dataMap.size} providers, ${withRating} with quality star rating`);
  return dataMap;
}

async function fetchCAHPSData(): Promise<Map<string, { cahpsStarRating: number | null }>> {
  console.log('\nDownloading CAHPS Hospice Survey Data...');

  const response = await fetch(HOSPICE_CAHPS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch CAHPS CSV: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.split('\n');
  const headers = parseCSVLine(lines[0]).map(h =>
    h.toLowerCase().replace(/[^a-z0-9]/g, '_')
  );

  console.log('CAHPS Headers:', headers.slice(0, 20));

  // Find column indices
  const ccnIdx = headers.findIndex(h => h.includes('ccn') || h.includes('certification_number'));

  // Look for the Family Caregiver Survey Star Rating or similar
  const cahpsStarIdx = headers.findIndex(h =>
    (h.includes('star') && (h.includes('rating') || h.includes('summary'))) ||
    h.includes('family_caregiver_survey_rating')
  );

  // Show all columns with 'star' or 'rating'
  const ratingCols = headers.filter(h => h.includes('star') || h.includes('rating'));
  if (ratingCols.length > 0) {
    console.log('Rating columns found:', ratingCols);
  }

  console.log(`CCN index: ${ccnIdx}, CAHPS Star index: ${cahpsStarIdx}`);

  // If we found rating columns, show sample values
  if (cahpsStarIdx !== -1 && lines.length > 1) {
    const sampleValues = parseCSVLine(lines[1]);
    console.log(`Sample CAHPS rating value: "${sampleValues[cahpsStarIdx]}"`);
  }

  const dataMap = new Map<string, { cahpsStarRating: number | null }>();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = parseCSVLine(lines[i]);
    const ccn = values[ccnIdx]?.trim();
    if (!ccn) continue;

    const cahpsStarRating = cahpsStarIdx !== -1 ? parseRating(values[cahpsStarIdx]) : null;

    // Only update if this CCN doesn't exist or if we have a rating
    const existing = dataMap.get(ccn);
    if (!existing || cahpsStarRating !== null) {
      dataMap.set(ccn, { cahpsStarRating });
    }
  }

  let withRating = 0;
  for (const record of dataMap.values()) {
    if (record.cahpsStarRating !== null) withRating++;
  }

  console.log(`CAHPS Data: ${dataMap.size} providers, ${withRating} with CAHPS star rating`);
  return dataMap;
}

async function addStarRatingColumns() {
  console.log('\nAdding star rating columns to database...');

  try {
    await sql`
      ALTER TABLE hospice_providers
      ADD COLUMN IF NOT EXISTS cms_quality_star DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS cms_cahps_star DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS star_rating_date TEXT
    `;
    console.log('Star rating columns added successfully');
  } catch (error) {
    console.log('Columns may already exist, continuing...');
  }
}

async function showCurrentRatings() {
  const result = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(cms_quality_star) as with_quality_star,
      COUNT(cms_cahps_star) as with_cahps_star,
      ROUND(AVG(cms_quality_star)::numeric, 2) as avg_quality_star,
      ROUND(AVG(cms_cahps_star)::numeric, 2) as avg_cahps_star
    FROM hospice_providers
  `;

  const stats = result[0];
  console.log('\n=== Current Star Rating Data ===');
  console.log(`Total providers: ${stats.total}`);
  console.log(`With Quality Star: ${stats.with_quality_star} (${((Number(stats.with_quality_star) / Number(stats.total)) * 100).toFixed(1)}%)`);
  console.log(`With CAHPS Star: ${stats.with_cahps_star} (${((Number(stats.with_cahps_star) / Number(stats.total)) * 100).toFixed(1)}%)`);
  if (stats.avg_quality_star) console.log(`Avg Quality Star: ${stats.avg_quality_star}`);
  if (stats.avg_cahps_star) console.log(`Avg CAHPS Star: ${stats.avg_cahps_star}`);
}

async function enrichStarRatings() {
  console.log('=== CMS Star Ratings Enrichment ===\n');

  // Add columns first
  await addStarRatingColumns();
  await showCurrentRatings();

  // Fetch both datasets
  const generalInfo = await fetchGeneralInfo();
  const cahpsData = await fetchCAHPSData();

  // Merge data
  const ratingsMap = new Map<string, StarRatingRecord>();

  for (const [ccn, data] of generalInfo) {
    ratingsMap.set(ccn, {
      ccn,
      qualityStarRating: data.qualityStarRating,
      cahpsStarRating: null,
    });
  }

  for (const [ccn, data] of cahpsData) {
    const existing = ratingsMap.get(ccn);
    if (existing) {
      existing.cahpsStarRating = data.cahpsStarRating;
    } else {
      ratingsMap.set(ccn, {
        ccn,
        qualityStarRating: null,
        cahpsStarRating: data.cahpsStarRating,
      });
    }
  }

  // Update database
  console.log('\nUpdating provider star ratings...');

  let updated = 0;
  let notFound = 0;
  let noRating = 0;

  const entries = Array.from(ratingsMap.entries());

  for (let i = 0; i < entries.length; i++) {
    const [ccn, record] = entries[i];

    if (record.qualityStarRating !== null || record.cahpsStarRating !== null) {
      try {
        const result = await sql`
          UPDATE hospice_providers
          SET
            cms_quality_star = COALESCE(${record.qualityStarRating}, cms_quality_star),
            cms_cahps_star = COALESCE(${record.cahpsStarRating}, cms_cahps_star),
            star_rating_date = 'Nov 2025'
          WHERE ccn = ${ccn}
          RETURNING ccn
        `;

        if (result.length > 0) {
          updated++;
        } else {
          notFound++;
        }
      } catch (error) {
        // Skip errors silently
      }
    } else {
      noRating++;
    }

    if ((i + 1) % 1000 === 0) {
      console.log(`Processed ${i + 1}/${entries.length} records... (${updated} updated)`);
    }
  }

  console.log(`\n=== Enrichment Complete ===`);
  console.log(`Updated: ${updated}`);
  console.log(`Not found in DB: ${notFound}`);
  console.log(`No rating available: ${noRating}`);

  await showCurrentRatings();

  // Show star rating distribution
  console.log('\n=== Star Rating Distribution ===');
  const distribution = await sql`
    SELECT
      cms_quality_star as stars,
      COUNT(*) as count
    FROM hospice_providers
    WHERE cms_quality_star IS NOT NULL
    GROUP BY cms_quality_star
    ORDER BY cms_quality_star DESC
  `;
  for (const row of distribution) {
    console.log(`${row.stars}★: ${row.count} providers`);
  }

  // Show hot markets summary
  console.log('\n=== Hot Markets Star Ratings ===');
  const hotMarkets = await sql`
    SELECT
      state,
      COUNT(*) as providers,
      COUNT(cms_quality_star) as with_rating,
      ROUND(AVG(cms_quality_star)::numeric, 2) as avg_quality_star,
      ROUND(AVG(cms_cahps_star)::numeric, 2) as avg_cahps_star
    FROM hospice_providers
    WHERE state IN ('WA', 'OR', 'CA', 'MT', 'NV')
    GROUP BY state
    ORDER BY avg_quality_star DESC NULLS LAST
  `;

  for (const market of hotMarkets) {
    const rating = market.avg_quality_star ? `${market.avg_quality_star}★` : 'N/A';
    const cahps = market.avg_cahps_star ? `${market.avg_cahps_star}★ CAHPS` : '';
    console.log(`${market.state}: ${rating} quality ${cahps} (${market.with_rating}/${market.providers} with ratings)`);
  }
}

async function main() {
  await enrichStarRatings();
}

main().catch(console.error);
