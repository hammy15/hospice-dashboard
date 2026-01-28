import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

interface Provider {
  ccn: string;
  provider_name: string;
  address_line_1: string | null;
  city: string;
  state: string;
  zip_code: string | null;
}

interface GeocodeResult {
  latitude: number;
  longitude: number;
  quality: string;
}

// Census Geocoder API - free, no key needed
async function geocodeAddress(address: string, city: string, state: string, zip: string): Promise<GeocodeResult | null> {
  try {
    const fullAddress = `${address}, ${city}, ${state} ${zip}`;
    const encodedAddress = encodeURIComponent(fullAddress);

    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodedAddress}&benchmark=Public_AR_Current&format=json`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.result?.addressMatches?.length > 0) {
      const match = data.result.addressMatches[0];
      return {
        latitude: match.coordinates.y,
        longitude: match.coordinates.x,
        quality: match.matchedAddress ? 'exact' : 'approximate'
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Fallback: Use city/state centroid from Census
async function geocodeCityState(city: string, state: string): Promise<GeocodeResult | null> {
  try {
    const query = `${city}, ${state}`;
    const encodedQuery = encodeURIComponent(query);

    const url = `https://geocoding.geo.census.gov/geocoder/locations/onelineaddress?address=${encodedQuery}&benchmark=Public_AR_Current&format=json`;

    const response = await fetch(url);
    if (!response.ok) return null;

    const data = await response.json();

    if (data.result?.addressMatches?.length > 0) {
      const match = data.result.addressMatches[0];
      return {
        latitude: match.coordinates.y,
        longitude: match.coordinates.x,
        quality: 'city_centroid'
      };
    }

    return null;
  } catch (error) {
    return null;
  }
}

// Batch geocode using Census Batch Geocoder for efficiency
async function batchGeocode(providers: Provider[]): Promise<Map<string, GeocodeResult>> {
  const results = new Map<string, GeocodeResult>();

  // Process in smaller batches with delays to avoid rate limiting
  const batchSize = 50;

  for (let i = 0; i < providers.length; i += batchSize) {
    const batch = providers.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(providers.length / batchSize)}...`);

    const promises = batch.map(async (provider) => {
      // Try full address first
      if (provider.address_line_1 && provider.zip_code) {
        const result = await geocodeAddress(
          provider.address_line_1,
          provider.city,
          provider.state,
          provider.zip_code
        );
        if (result) {
          results.set(provider.ccn, result);
          return;
        }
      }

      // Fallback to city/state
      const cityResult = await geocodeCityState(provider.city, provider.state);
      if (cityResult) {
        results.set(provider.ccn, cityResult);
      }
    });

    await Promise.all(promises);

    // Small delay between batches
    if (i + batchSize < providers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

async function main() {
  console.log('🌍 Starting geocoding process...\n');

  // Get providers without coordinates
  const providers = await sql`
    SELECT ccn, provider_name, address_line_1, city, state, zip_code
    FROM hospice_providers
    WHERE latitude IS NULL AND classification IN ('GREEN', 'YELLOW')
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
  ` as Provider[];

  console.log(`Found ${providers.length} providers to geocode\n`);

  if (providers.length === 0) {
    console.log('All providers already geocoded!');
    return;
  }

  // Geocode in batches
  const geocodeResults = await batchGeocode(providers);

  console.log(`\nSuccessfully geocoded ${geocodeResults.size} providers`);

  // Update database
  let updated = 0;
  for (const [ccn, result] of geocodeResults) {
    try {
      await sql`
        UPDATE hospice_providers
        SET
          latitude = ${result.latitude},
          longitude = ${result.longitude},
          geocode_source = 'census',
          geocode_quality = ${result.quality}
        WHERE ccn = ${ccn}
      `;
      updated++;

      if (updated % 100 === 0) {
        console.log(`Updated ${updated} records...`);
      }
    } catch (error) {
      console.error(`Error updating ${ccn}:`, error);
    }
  }

  console.log(`\n✅ Geocoding complete! Updated ${updated} providers`);

  // Stats
  const stats = await sql`
    SELECT
      COUNT(*) FILTER (WHERE latitude IS NOT NULL) as geocoded,
      COUNT(*) FILTER (WHERE latitude IS NULL AND classification IN ('GREEN', 'YELLOW')) as remaining,
      COUNT(*) FILTER (WHERE geocode_quality = 'exact') as exact_matches,
      COUNT(*) FILTER (WHERE geocode_quality = 'city_centroid') as city_matches
    FROM hospice_providers
  `;

  console.log('\n📊 Geocoding Stats:');
  console.log(`   Geocoded: ${stats[0].geocoded}`);
  console.log(`   Remaining: ${stats[0].remaining}`);
  console.log(`   Exact matches: ${stats[0].exact_matches}`);
  console.log(`   City centroids: ${stats[0].city_matches}`);
}

main().catch(console.error);
