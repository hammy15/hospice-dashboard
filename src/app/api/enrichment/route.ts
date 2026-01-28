import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Get enrichment data for a provider
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ccn = searchParams.get('ccn');

  if (!ccn) {
    return NextResponse.json({ error: 'CCN required' }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT * FROM provider_enrichment WHERE ccn = ${ccn}
    `;

    // Also get M&A history for this provider
    const transactions = await sql`
      SELECT * FROM ma_transactions WHERE ccn = ${ccn} ORDER BY transaction_date DESC
    `;

    return NextResponse.json({
      enrichment: result[0] || null,
      transactions,
    });
  } catch (error) {
    console.error('Enrichment API error:', error);
    return NextResponse.json({ error: 'Failed to fetch enrichment data' }, { status: 500 });
  }
}

// Update enrichment data
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ccn,
      linkedin_url,
      owner_name,
      owner_linkedin,
      estimated_owner_age,
      years_in_business,
      facility_owned,
      facility_lease_expires,
      license_deficiencies,
      last_inspection_date,
      complaints_last_year,
    } = body;

    if (!ccn) {
      return NextResponse.json({ error: 'CCN required' }, { status: 400 });
    }

    await sql`
      INSERT INTO provider_enrichment (
        ccn, linkedin_url, owner_name, owner_linkedin,
        estimated_owner_age, years_in_business, facility_owned,
        facility_lease_expires, license_deficiencies,
        last_inspection_date, complaints_last_year, updated_at
      ) VALUES (
        ${ccn}, ${linkedin_url || null}, ${owner_name || null}, ${owner_linkedin || null},
        ${estimated_owner_age || null}, ${years_in_business || null}, ${facility_owned || null},
        ${facility_lease_expires || null}, ${license_deficiencies || 0},
        ${last_inspection_date || null}, ${complaints_last_year || 0}, NOW()
      )
      ON CONFLICT (ccn) DO UPDATE SET
        linkedin_url = COALESCE(${linkedin_url}, provider_enrichment.linkedin_url),
        owner_name = COALESCE(${owner_name}, provider_enrichment.owner_name),
        owner_linkedin = COALESCE(${owner_linkedin}, provider_enrichment.owner_linkedin),
        estimated_owner_age = COALESCE(${estimated_owner_age}, provider_enrichment.estimated_owner_age),
        years_in_business = COALESCE(${years_in_business}, provider_enrichment.years_in_business),
        facility_owned = COALESCE(${facility_owned}, provider_enrichment.facility_owned),
        facility_lease_expires = COALESCE(${facility_lease_expires}, provider_enrichment.facility_lease_expires),
        license_deficiencies = COALESCE(${license_deficiencies}, provider_enrichment.license_deficiencies),
        last_inspection_date = COALESCE(${last_inspection_date}, provider_enrichment.last_inspection_date),
        complaints_last_year = COALESCE(${complaints_last_year}, provider_enrichment.complaints_last_year),
        updated_at = NOW()
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Enrichment update error:', error);
    return NextResponse.json({ error: 'Failed to update enrichment data' }, { status: 500 });
  }
}

// Bulk enrichment status
export async function PUT() {
  try {
    const stats = await sql`
      SELECT
        (SELECT COUNT(*) FROM hospice_providers) as total_providers,
        (SELECT COUNT(*) FROM provider_enrichment) as enriched_count,
        (SELECT COUNT(*) FROM provider_enrichment WHERE linkedin_url IS NOT NULL) as with_linkedin,
        (SELECT COUNT(*) FROM provider_enrichment WHERE owner_name IS NOT NULL) as with_owner_info,
        (SELECT COUNT(*) FROM provider_enrichment WHERE facility_owned IS NOT NULL) as with_facility_info,
        (SELECT COUNT(*) FROM provider_enrichment WHERE license_deficiencies > 0) as with_deficiencies,
        (SELECT AVG(years_in_business) FROM provider_enrichment WHERE years_in_business IS NOT NULL) as avg_years_business,
        (SELECT AVG(estimated_owner_age) FROM provider_enrichment WHERE estimated_owner_age IS NOT NULL) as avg_owner_age
    `;

    return NextResponse.json({
      stats: stats[0],
    });
  } catch (error) {
    console.error('Enrichment stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch enrichment stats' }, { status: 500 });
  }
}
