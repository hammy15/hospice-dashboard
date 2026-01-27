/**
 * Find Hospice Provider Websites
 *
 * Uses DuckDuckGo search to find official websites for GREEN/YELLOW targets
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

interface Provider {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
}

async function searchWebsite(provider: Provider): Promise<string | null> {
  const query = encodeURIComponent(`"${provider.provider_name}" hospice ${provider.city} ${provider.state} official website`);

  try {
    // Use DuckDuckGo HTML search (no API key needed)
    const response = await fetch(`https://html.duckduckgo.com/html/?q=${query}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    });

    if (!response.ok) return null;

    const html = await response.text();

    // Extract URLs from search results
    const urlMatches = html.match(/href="(https?:\/\/[^"]+)"/g) || [];

    // Skip list for non-hospice sites
    const skipDomains = [
      'duckduckgo.com', 'google.com', 'facebook.com', 'linkedin.com',
      'yelp.com', 'yellowpages.com', 'healthgrades.com', 'medicare.gov',
      'cms.gov', 'wikipedia.org', 'twitter.com', 'instagram.com',
      'youtube.com', 'indeed.com', 'glassdoor.com', 'bbb.org',
      'mapquest.com', 'caring.com', 'senioradvisor.com', 'agingcare.com'
    ];

    const providerWords = provider.provider_name.toLowerCase()
      .replace(/hospice|home health|healthcare|health care|services?|inc\.?|llc|of|the|and|&/gi, '')
      .split(/\s+/)
      .filter(w => w.length > 2);

    // First pass: look for strong matches (name in domain)
    for (const match of urlMatches) {
      const url = match.replace('href="', '').replace('"', '');
      const lowerUrl = url.toLowerCase();

      if (skipDomains.some(d => lowerUrl.includes(d))) continue;

      // Check for provider name words in domain
      const matchCount = providerWords.filter(word => lowerUrl.includes(word)).length;

      if (matchCount >= 1) {
        try {
          const parsedUrl = new URL(url);
          return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
        } catch {
          continue;
        }
      }
    }

    // Second pass: any hospice-related domain
    for (const match of urlMatches) {
      const url = match.replace('href="', '').replace('"', '');
      const lowerUrl = url.toLowerCase();

      if (skipDomains.some(d => lowerUrl.includes(d))) continue;

      if (lowerUrl.includes('hospice') || lowerUrl.includes('palliative')) {
        try {
          const parsedUrl = new URL(url);
          // Skip if it's a generic directory
          if (!parsedUrl.hostname.includes('list') && !parsedUrl.hostname.includes('directory')) {
            return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
          }
        } catch {
          continue;
        }
      }
    }

    return null;
  } catch (error) {
    console.error(`Search failed for ${provider.provider_name}:`, error);
    return null;
  }
}

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function findWebsites() {
  console.log('=== Finding Hospice Provider Websites ===\n');

  // Get GREEN and YELLOW targets without websites
  const providers = await sql`
    SELECT ccn, provider_name, city, state
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
      AND website IS NULL
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC NULLS LAST
    LIMIT 100
  ` as Provider[];

  console.log(`Found ${providers.length} providers without websites\n`);

  let found = 0;
  let notFound = 0;

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    console.log(`[${i + 1}/${providers.length}] Searching: ${provider.provider_name}...`);

    const website = await searchWebsite(provider);

    if (website) {
      console.log(`  ✓ Found: ${website}`);

      // Update database
      await sql`
        UPDATE hospice_providers
        SET website = ${website}
        WHERE ccn = ${provider.ccn}
      `;

      found++;
    } else {
      console.log(`  ✗ Not found`);
      notFound++;
    }

    // Rate limit: wait 2 seconds between searches
    await delay(2000);
  }

  console.log('\n=== Summary ===');
  console.log(`Found websites: ${found}`);
  console.log(`Not found: ${notFound}`);
  console.log(`Success rate: ${((found / providers.length) * 100).toFixed(1)}%`);
}

findWebsites().catch(console.error);
