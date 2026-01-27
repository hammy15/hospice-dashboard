/**
 * Enrich Hospice Provider Data with Census Demographics
 *
 * Fetches county-level demographic data from Census Bureau API:
 * - Population 65+ (target market)
 * - Total population
 * - Median household income
 * - Percentage 65+
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// Census API base URL (no API key needed for basic queries)
const CENSUS_API_BASE = 'https://api.census.gov/data';

// State FIPS codes
const STATE_FIPS: Record<string, string> = {
  'AL': '01', 'AK': '02', 'AZ': '04', 'AR': '05', 'CA': '06',
  'CO': '08', 'CT': '09', 'DE': '10', 'DC': '11', 'FL': '12',
  'GA': '13', 'HI': '15', 'ID': '16', 'IL': '17', 'IN': '18',
  'IA': '19', 'KS': '20', 'KY': '21', 'LA': '22', 'ME': '23',
  'MD': '24', 'MA': '25', 'MI': '26', 'MN': '27', 'MS': '28',
  'MO': '29', 'MT': '30', 'NE': '31', 'NV': '32', 'NH': '33',
  'NJ': '34', 'NM': '35', 'NY': '36', 'NC': '37', 'ND': '38',
  'OH': '39', 'OK': '40', 'OR': '41', 'PA': '42', 'RI': '44',
  'SC': '45', 'SD': '46', 'TN': '47', 'TX': '48', 'UT': '49',
  'VT': '50', 'VA': '51', 'WA': '53', 'WV': '54', 'WI': '55',
  'WY': '56', 'PR': '72',
};

// Reverse lookup
const FIPS_TO_STATE: Record<string, string> = Object.fromEntries(
  Object.entries(STATE_FIPS).map(([k, v]) => [v, k])
);

interface CountyDemographics {
  stateFips: string;
  countyFips: string;
  countyName: string;
  totalPopulation: number;
  population65Plus: number;
  percent65Plus: number;
  medianIncome: number | null;
}

async function addDemographicColumns() {
  console.log('Adding demographic columns to database...');

  try {
    await sql`
      ALTER TABLE hospice_providers
      ADD COLUMN IF NOT EXISTS county_population INTEGER,
      ADD COLUMN IF NOT EXISTS county_pop_65_plus INTEGER,
      ADD COLUMN IF NOT EXISTS county_pct_65_plus DECIMAL(4,1),
      ADD COLUMN IF NOT EXISTS county_median_income INTEGER,
      ADD COLUMN IF NOT EXISTS county_fips TEXT,
      ADD COLUMN IF NOT EXISTS census_data_year INTEGER
    `;
    console.log('Demographic columns added successfully');
  } catch (error) {
    console.log('Columns may already exist, continuing...');
  }
}

async function fetchCensusData(): Promise<Map<string, CountyDemographics>> {
  console.log('Fetching Census ACS 5-year data...\n');

  const demographicsMap = new Map<string, CountyDemographics>();

  // Census ACS 5-year variables:
  // B01001_001E = Total population
  // B01001_020E through B01001_025E = Males 65+ (6 age groups)
  // B01001_044E through B01001_049E = Females 65+ (6 age groups)
  // B19013_001E = Median household income

  const maleVars = ['B01001_020E', 'B01001_021E', 'B01001_022E', 'B01001_023E', 'B01001_024E', 'B01001_025E'];
  const femaleVars = ['B01001_044E', 'B01001_044E', 'B01001_045E', 'B01001_046E', 'B01001_047E', 'B01001_048E', 'B01001_049E'];

  const variables = [
    'NAME',
    'B01001_001E', // Total population
    ...maleVars,
    ...femaleVars,
    'B19013_001E', // Median income
  ].join(',');

  // Use ACS 5-year 2022 data (most recent complete dataset)
  const url = `${CENSUS_API_BASE}/2022/acs/acs5?get=${variables}&for=county:*`;

  console.log('Fetching from Census API...');

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }

    const data = await response.json();
    const headers = data[0];

    console.log(`Received ${data.length - 1} county records`);

    // Find column indices
    const nameIdx = headers.indexOf('NAME');
    const totalPopIdx = headers.indexOf('B01001_001E');
    const incomeIdx = headers.indexOf('B19013_001E');
    const stateIdx = headers.indexOf('state');
    const countyIdx = headers.indexOf('county');

    // Calculate indices for 65+ population columns
    const pop65Indices: number[] = [];
    for (const v of [...maleVars, ...femaleVars]) {
      const idx = headers.indexOf(v);
      if (idx !== -1) pop65Indices.push(idx);
    }

    // Process each county
    for (let i = 1; i < data.length; i++) {
      const row = data[i];

      const stateFips = row[stateIdx];
      const countyFips = row[countyIdx];
      const countyName = row[nameIdx]?.split(',')[0] || '';
      const totalPop = parseInt(row[totalPopIdx]) || 0;
      const medianIncome = parseInt(row[incomeIdx]) || null;

      // Sum 65+ population
      let pop65Plus = 0;
      for (const idx of pop65Indices) {
        pop65Plus += parseInt(row[idx]) || 0;
      }

      const pct65Plus = totalPop > 0 ? (pop65Plus / totalPop) * 100 : 0;

      // Key by state+county FIPS
      const key = `${stateFips}${countyFips}`;

      demographicsMap.set(key, {
        stateFips,
        countyFips,
        countyName,
        totalPopulation: totalPop,
        population65Plus: pop65Plus,
        percent65Plus: pct65Plus,
        medianIncome,
      });
    }

    console.log(`Parsed demographics for ${demographicsMap.size} counties`);

  } catch (error) {
    console.error('Error fetching Census data:', error);
    throw error;
  }

  return demographicsMap;
}

// Normalize county names for matching
function normalizeCountyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+county$/i, '')
    .replace(/\s+parish$/i, '')
    .replace(/\s+borough$/i, '')
    .replace(/\s+census area$/i, '')
    .replace(/\s+municipality$/i, '')
    .replace(/[^a-z0-9]/g, '');
}

async function enrichDemographics() {
  console.log('=== Census Demographic Data Enrichment ===\n');

  // Add columns first
  await addDemographicColumns();

  // Fetch Census data
  const demographicsMap = await fetchCensusData();

  // Build county name lookup (for matching without FIPS)
  const countyNameLookup = new Map<string, CountyDemographics>();
  for (const [_, demo] of demographicsMap) {
    const state = FIPS_TO_STATE[demo.stateFips];
    if (state) {
      const key = `${state}-${normalizeCountyName(demo.countyName)}`;
      countyNameLookup.set(key, demo);
    }
  }

  // Get all providers with county info
  console.log('\nFetching providers from database...');
  const providers = await sql`
    SELECT ccn, state, county
    FROM hospice_providers
    WHERE county IS NOT NULL AND county != ''
  `;

  console.log(`Found ${providers.length} providers with county data`);

  // Update providers with demographics
  let updated = 0;
  let notFound = 0;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    const state = provider.state as string;
    const county = provider.county as string;

    // Try to find matching county
    const normalizedKey = `${state}-${normalizeCountyName(county)}`;
    const demo = countyNameLookup.get(normalizedKey);

    if (demo) {
      try {
        await sql`
          UPDATE hospice_providers
          SET
            county_population = ${demo.totalPopulation},
            county_pop_65_plus = ${demo.population65Plus},
            county_pct_65_plus = ${Math.round(demo.percent65Plus * 10) / 10},
            county_median_income = ${demo.medianIncome},
            county_fips = ${demo.stateFips + demo.countyFips},
            census_data_year = 2022
          WHERE ccn = ${provider.ccn}
        `;
        updated++;
      } catch (error) {
        // Skip errors silently
      }
    } else {
      notFound++;
    }

    if ((i + 1) % 500 === 0) {
      console.log(`Processed ${i + 1}/${providers.length} providers... (${updated} updated)`);
    }
  }

  console.log(`\n=== Enrichment Complete ===`);
  console.log(`Updated: ${updated}`);
  console.log(`County not found: ${notFound}`);

  // Show summary
  const stats = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(county_pop_65_plus) as with_demographics,
      ROUND(AVG(county_pct_65_plus)::numeric, 1) as avg_pct_65_plus,
      ROUND(AVG(county_median_income)::numeric, 0) as avg_income
    FROM hospice_providers
  `;

  console.log('\n=== Demographics Summary ===');
  console.log(`Total providers: ${stats[0].total}`);
  console.log(`With demographics: ${stats[0].with_demographics} (${((Number(stats[0].with_demographics) / Number(stats[0].total)) * 100).toFixed(1)}%)`);
  console.log(`Avg county % 65+: ${stats[0].avg_pct_65_plus}%`);
  console.log(`Avg county median income: $${Number(stats[0].avg_income).toLocaleString()}`);

  // Show hot markets summary
  console.log('\n=== Hot Markets Demographics ===');
  const hotMarkets = await sql`
    SELECT
      state,
      COUNT(*) as providers,
      ROUND(AVG(county_pct_65_plus)::numeric, 1) as avg_pct_65,
      ROUND(AVG(county_median_income)::numeric, 0) as avg_income
    FROM hospice_providers
    WHERE state IN ('WA', 'OR', 'CA', 'MT', 'NV')
      AND county_pop_65_plus IS NOT NULL
    GROUP BY state
    ORDER BY avg_pct_65 DESC
  `;

  for (const market of hotMarkets) {
    console.log(`${market.state}: ${market.avg_pct_65}% 65+, $${Number(market.avg_income).toLocaleString()} median income (${market.providers} providers)`);
  }
}

async function main() {
  await enrichDemographics();
}

main().catch(console.error);
