/**
 * Hospice Owner/Administrator Enrichment Script
 *
 * Fetches owner/administrator data from CMS PECOS datasets:
 * - Hospice Enrollments: Maps CCN to ENROLLMENT_ID
 * - Hospice All Owners: Contains owner names and titles
 *
 * Sources:
 * - https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/hospice-enrollments
 * - https://data.cms.gov/provider-characteristics/medicare-provider-supplier-enrollment/hospice-all-owners
 */

import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL!;
const sql = neon(DATABASE_URL);

// CMS PECOS Data URLs
const HOSPICE_ENROLLMENTS_URL = 'https://data.cms.gov/sites/default/files/2025-10/8a3ac547-fe30-4cf7-80aa-d623734a6675/Hospice_Enrollments_2025.10.01.csv';
const HOSPICE_ALL_OWNERS_URL = 'https://data.cms.gov/sites/default/files/2025-07/b407d980-37ae-48f8-aff1-1a9faa1cbfcf/Hospice_All_Owners_2025.07.01.csv';

interface Enrollment {
  ccn: string;
  enrollmentId: string;
  providerName: string;
}

interface Owner {
  enrollmentId: string;
  firstName: string;
  middleName: string;
  lastName: string;
  title: string;
  role: string;
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

async function fetchEnrollments(): Promise<Map<string, Enrollment>> {
  console.log('Fetching Hospice Enrollments data...');

  const response = await fetch(HOSPICE_ENROLLMENTS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch enrollments: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["\s]/g, '_'));

  console.log('Enrollment CSV Headers:', headers.slice(0, 10));

  // Find column indices
  const ccnIdx = headers.findIndex(h => h.includes('ccn') || h.includes('certification'));
  const enrollmentIdIdx = headers.findIndex(h => h.includes('enrollment_id'));
  const nameIdx = headers.findIndex(h => h.includes('organization_name') || h.includes('provider_name'));

  console.log(`Column indices - CCN: ${ccnIdx}, Enrollment ID: ${enrollmentIdIdx}, Name: ${nameIdx}`);

  const enrollmentMap = new Map<string, Enrollment>();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);

    if (values.length > Math.max(ccnIdx, enrollmentIdIdx)) {
      const ccn = values[ccnIdx]?.replace(/"/g, '').trim();
      const enrollmentId = values[enrollmentIdIdx]?.replace(/"/g, '').trim();
      const providerName = values[nameIdx]?.replace(/"/g, '').trim() || '';

      if (ccn && enrollmentId) {
        enrollmentMap.set(enrollmentId, { ccn, enrollmentId, providerName });
      }
    }
  }

  console.log(`Parsed ${enrollmentMap.size} enrollment records`);
  return enrollmentMap;
}

async function fetchOwners(): Promise<Map<string, Owner[]>> {
  console.log('\nFetching Hospice All Owners data...');

  const response = await fetch(HOSPICE_ALL_OWNERS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch owners: ${response.status}`);
  }

  const csvText = await response.text();
  const lines = csvText.split('\n');
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["\s]/g, '_'));

  console.log('Owner CSV Headers:', headers);

  // Find column indices based on known CMS format
  const enrollmentIdIdx = headers.findIndex(h => h.includes('enrollment_id'));
  const firstNameIdx = headers.findIndex(h => h.includes('first_name') && h.includes('owner'));
  const middleNameIdx = headers.findIndex(h => h.includes('middle_name') && h.includes('owner'));
  const lastNameIdx = headers.findIndex(h => h.includes('last_name') && h.includes('owner'));
  const titleIdx = headers.findIndex(h => h.includes('title') && h.includes('owner'));
  const roleIdx = headers.findIndex(h => h.includes('role'));

  console.log(`Owner column indices - EnrollmentID: ${enrollmentIdIdx}, First: ${firstNameIdx}, Last: ${lastNameIdx}, Title: ${titleIdx}, Role: ${roleIdx}`);

  const ownerMap = new Map<string, Owner[]>();

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);

    if (values.length > enrollmentIdIdx) {
      const enrollmentId = values[enrollmentIdIdx]?.replace(/"/g, '').trim();
      const firstName = firstNameIdx >= 0 ? values[firstNameIdx]?.replace(/"/g, '').trim() || '' : '';
      const middleName = middleNameIdx >= 0 ? values[middleNameIdx]?.replace(/"/g, '').trim() || '' : '';
      const lastName = lastNameIdx >= 0 ? values[lastNameIdx]?.replace(/"/g, '').trim() || '' : '';
      const title = titleIdx >= 0 ? values[titleIdx]?.replace(/"/g, '').trim() || '' : '';
      const role = roleIdx >= 0 ? values[roleIdx]?.replace(/"/g, '').trim() || '' : '';

      if (enrollmentId && (firstName || lastName)) {
        const owner: Owner = { enrollmentId, firstName, middleName, lastName, title, role };

        if (!ownerMap.has(enrollmentId)) {
          ownerMap.set(enrollmentId, []);
        }
        ownerMap.get(enrollmentId)!.push(owner);
      }
    }
  }

  console.log(`Parsed owners for ${ownerMap.size} enrollments`);
  return ownerMap;
}

function formatName(owner: Owner): string {
  const parts = [owner.firstName, owner.middleName, owner.lastName].filter(Boolean);
  let name = parts.join(' ');

  if (owner.title) {
    name += `, ${owner.title}`;
  }

  return name;
}

function findBestContact(owners: Owner[]): Owner | null {
  // Priority: Managing Employee > Director > Officer > Owner
  const priorities = [
    'MANAGING EMPLOYEE',
    'W-2 MANAGING EMPLOYEE',
    'ADMINISTRATOR',
    'EXECUTIVE DIRECTOR',
    'DIRECTOR',
    'CEO',
    'PRESIDENT',
    'OFFICER',
    'OWNER',
  ];

  for (const priority of priorities) {
    const match = owners.find(o =>
      o.role.toUpperCase().includes(priority) ||
      o.title.toUpperCase().includes(priority)
    );
    if (match) return match;
  }

  // Return first owner if no priority match
  return owners[0] || null;
}

async function enrichOwners(enrollmentMap: Map<string, Enrollment>, ownerMap: Map<string, Owner[]>) {
  console.log('\nEnriching provider data with owner information...');

  // Get all GREEN and YELLOW providers
  const providers = await sql`
    SELECT ccn, provider_name
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
      AND administrator_name IS NULL
  `;

  console.log(`Found ${providers.length} providers to enrich`);

  let updated = 0;
  let notFound = 0;

  // Create CCN to enrollment ID lookup
  const ccnToEnrollment = new Map<string, string>();
  for (const [enrollmentId, enrollment] of enrollmentMap) {
    ccnToEnrollment.set(enrollment.ccn, enrollmentId);
  }

  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i] as { ccn: string; provider_name: string };
    const enrollmentId = ccnToEnrollment.get(provider.ccn);

    if (enrollmentId) {
      const owners = ownerMap.get(enrollmentId);

      if (owners && owners.length > 0) {
        const bestContact = findBestContact(owners);

        if (bestContact) {
          const adminName = formatName(bestContact);

          await sql`
            UPDATE hospice_providers
            SET administrator_name = ${adminName}
            WHERE ccn = ${provider.ccn}
          `;

          updated++;

          if (updated % 100 === 0) {
            console.log(`Updated ${updated} providers...`);
          }
        }
      } else {
        notFound++;
      }
    } else {
      notFound++;
    }
  }

  console.log('\n=== Owner Enrichment Complete ===');
  console.log(`Updated with admin names: ${updated}`);
  console.log(`No owner data found: ${notFound}`);
}

async function main() {
  console.log('=== Hospice Owner/Administrator Enrichment ===\n');

  try {
    // Fetch both datasets
    const enrollmentMap = await fetchEnrollments();
    const ownerMap = await fetchOwners();

    // Enrich our database
    await enrichOwners(enrollmentMap, ownerMap);

    // Show final stats
    const stats = await sql`
      SELECT
        COUNT(*) as total,
        COUNT(administrator_name) as has_admin,
        COUNT(CASE WHEN classification = 'GREEN' AND administrator_name IS NOT NULL THEN 1 END) as green_with_admin,
        COUNT(CASE WHEN classification = 'GREEN' THEN 1 END) as green_total,
        COUNT(CASE WHEN classification = 'YELLOW' AND administrator_name IS NOT NULL THEN 1 END) as yellow_with_admin,
        COUNT(CASE WHEN classification = 'YELLOW' THEN 1 END) as yellow_total
      FROM hospice_providers
    `;

    const s = stats[0] as Record<string, string>;
    console.log('\n=== Final Stats ===');
    console.log(`GREEN with admin: ${s.green_with_admin}/${s.green_total}`);
    console.log(`YELLOW with admin: ${s.yellow_with_admin}/${s.yellow_total}`);
    console.log(`Total with admin: ${s.has_admin}/${s.total}`);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
