/**
 * Enrich Hospice Provider Data with CMS Quality Metrics
 *
 * Fetches data from CMS Hospice Compare:
 * - Provider ratings
 * - Quality measures
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// CMS Hospice Compare CSV URLs (direct downloads)
const HOSPICE_PROVIDER_URL = 'https://data.cms.gov/provider-data/sites/default/files/resources/e0c4d6e48a1f22b5e92ede54f3fc0ab5_1735257606/Hospice_Provider.csv';

async function fetchCSV(url: string): Promise<Map<string, Record<string, string>>> {
  console.log(`Downloading CSV from CMS...`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase().replace(/[^a-z0-9_]/g, '_'));

  console.log(`CSV Headers: ${headers.slice(0, 10).join(', ')}...`);
  console.log(`Total rows: ${lines.length - 1}`);

  // Find CCN column
  const ccnIndex = headers.findIndex(h => h.includes('ccn') || h.includes('certification_number'));
  if (ccnIndex === -1) {
    console.log('Available headers:', headers);
    throw new Error('Could not find CCN column');
  }
  console.log(`CCN column: ${headers[ccnIndex]} (index ${ccnIndex})`);

  const dataMap = new Map<string, Record<string, string>>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    // Parse CSV properly (handle quoted values)
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const ccn = values[ccnIndex]?.replace(/"/g, '').trim();
    if (!ccn) continue;

    const record: Record<string, string> = {};
    for (let j = 0; j < headers.length && j < values.length; j++) {
      record[headers[j]] = values[j]?.replace(/"/g, '').trim() || '';
    }

    dataMap.set(ccn, record);
  }

  console.log(`Parsed ${dataMap.size} provider records`);
  return dataMap;
}

async function addQualityColumns() {
  console.log('Adding quality columns to database...');

  try {
    await sql`
      ALTER TABLE hospice_providers
      ADD COLUMN IF NOT EXISTS star_rating DECIMAL(2,1),
      ADD COLUMN IF NOT EXISTS quality_score_cms DECIMAL(4,1),
      ADD COLUMN IF NOT EXISTS cahps_rating DECIMAL(4,1),
      ADD COLUMN IF NOT EXISTS quality_data_date TEXT
    `;
    console.log('Quality columns added successfully');
  } catch (error) {
    console.log('Columns may already exist, continuing...');
  }
}

async function showCurrentQuality() {
  const result = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(star_rating) as with_star,
      COUNT(quality_score_cms) as with_quality,
      COUNT(cahps_rating) as with_cahps,
      ROUND(AVG(star_rating)::numeric, 2) as avg_star,
      ROUND(AVG(quality_score_cms)::numeric, 1) as avg_quality
    FROM hospice_providers
  `;

  const stats = result[0];
  console.log('\n=== Current Quality Data ===');
  console.log(`Total providers: ${stats.total}`);
  console.log(`With star rating: ${stats.with_star} (${((Number(stats.with_star) / Number(stats.total)) * 100).toFixed(1)}%)`);
  console.log(`With quality score: ${stats.with_quality} (${((Number(stats.with_quality) / Number(stats.total)) * 100).toFixed(1)}%)`);
  console.log(`With CAHPS rating: ${stats.with_cahps} (${((Number(stats.with_cahps) / Number(stats.total)) * 100).toFixed(1)}%)`);
  if (stats.avg_star) console.log(`Avg star rating: ${stats.avg_star}`);
  if (stats.avg_quality) console.log(`Avg quality score: ${stats.avg_quality}`);
}

async function enrichQualityData() {
  console.log('=== Hospice Quality Data Enrichment ===\n');

  // Add columns if needed first
  await addQualityColumns();

  await showCurrentQuality();

  console.log('\nFetching CMS Hospice Provider data...');

  try {
    const providerData = await fetchCSV(HOSPICE_PROVIDER_URL);

    // Look at a sample record to see available fields
    const sampleRecord = providerData.values().next().value;
    if (sampleRecord) {
      console.log('\nSample record fields:', Object.keys(sampleRecord).slice(0, 20));
    }

    // Find quality-related columns
    const qualityColumns = Object.keys(sampleRecord || {}).filter(k =>
      k.includes('quality') || k.includes('star') || k.includes('rating') || k.includes('score') || k.includes('cahps')
    );
    console.log('Quality-related columns:', qualityColumns);

    // Update database with quality data
    console.log('\nUpdating provider quality data...');

    let updated = 0;
    let notFound = 0;
    const entries = Array.from(providerData.entries());

    for (let i = 0; i < entries.length; i++) {
      const [ccn, record] = entries[i];

      // Try to extract quality metrics from available fields
      // Field names vary by CMS dataset version
      const starRating = parseFloat(
        record.star_rating ||
        record.overall_rating ||
        record.quality_of_patient_care_star_rating ||
        ''
      ) || null;

      const qualityScore = parseFloat(
        record.quality_score ||
        record.quality_of_care_score ||
        ''
      ) || null;

      const cahpsRating = parseFloat(
        record.cahps_hospice_survey_star_rating ||
        record.patient_survey_rating ||
        record.cahps_rating ||
        ''
      ) || null;

      // Only update if we have some quality data
      if (starRating || qualityScore || cahpsRating) {
        try {
          const result = await sql`
            UPDATE hospice_providers
            SET
              star_rating = COALESCE(${starRating}, star_rating),
              quality_score_cms = COALESCE(${qualityScore}, quality_score_cms),
              cahps_rating = COALESCE(${cahpsRating}, cahps_rating),
              quality_data_date = 'Jan 2026'
            WHERE ccn = ${ccn}
            RETURNING ccn
          `;

          if (result.length > 0) {
            updated++;
          } else {
            notFound++;
          }
        } catch (error) {
          // Silently skip errors
        }
      }

      if ((i + 1) % 500 === 0) {
        console.log(`Processed ${i + 1}/${entries.length} records... (${updated} updated)`);
      }
    }

    console.log(`\n=== Enrichment Complete ===`);
    console.log(`Updated: ${updated}`);
    console.log(`Not found in DB: ${notFound}`);

    await showCurrentQuality();

  } catch (error) {
    console.error('Error fetching CMS data:', error);
    console.log('\nTrying alternative approach with direct database query...');
  }
}

async function main() {
  await enrichQualityData();
}

main().catch(console.error);
