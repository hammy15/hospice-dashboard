import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get PE firm activity
    const peFirms = await sql`
      SELECT
        pf.id,
        pf.name,
        pf.website,
        pf.portfolio_count,
        pf.notes,
        (SELECT COUNT(*) FROM ma_transactions mt WHERE mt.buyer_name ILIKE '%' || pf.name || '%') as recent_deals
      FROM pe_firms pf
      WHERE pf.active_in_hospice = true
      ORDER BY portfolio_count DESC
    `;

    // Get M&A transaction history
    const recentDeals = await sql`
      SELECT
        mt.*,
        hp.classification,
        hp.overall_score,
        hp.estimated_adc
      FROM ma_transactions mt
      LEFT JOIN hospice_providers hp ON hp.ccn = mt.ccn
      ORDER BY mt.transaction_date DESC
      LIMIT 50
    `;

    // Market share by state (based on PE-backed flag)
    const marketShare = await sql`
      SELECT
        state,
        COUNT(*) as total_providers,
        COUNT(*) FILTER (WHERE pe_backed = true) as pe_backed_count,
        ROUND((COUNT(*) FILTER (WHERE pe_backed = true)::numeric / COUNT(*)::numeric * 100), 1) as pe_penetration,
        COUNT(*) FILTER (WHERE classification = 'GREEN') as green_targets,
        COUNT(*) FILTER (WHERE classification = 'GREEN' AND pe_backed = false) as independent_green
      FROM hospice_providers
      GROUP BY state
      ORDER BY pe_penetration DESC
    `;

    // Roll-up activity (providers with chain_affiliated)
    const rollupActivity = await sql`
      SELECT
        state,
        COUNT(*) FILTER (WHERE chain_affiliated = true) as chain_count,
        COUNT(*) FILTER (WHERE chain_affiliated = false) as independent_count,
        ROUND(AVG(estimated_adc) FILTER (WHERE chain_affiliated = true)::numeric, 1) as avg_chain_adc,
        ROUND(AVG(estimated_adc) FILTER (WHERE chain_affiliated = false)::numeric, 1) as avg_independent_adc
      FROM hospice_providers
      GROUP BY state
      HAVING COUNT(*) > 10
      ORDER BY chain_count DESC
      LIMIT 20
    `;

    // County-level market density
    const countyDensity = await sql`
      SELECT
        county,
        state,
        COUNT(*) as provider_count,
        COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
        COUNT(*) FILTER (WHERE pe_backed = true) as pe_backed,
        MAX(county_pop_65_plus) as pop_65_plus,
        ROUND((COUNT(*)::numeric / NULLIF(MAX(county_pop_65_plus), 0) * 100000)::numeric, 1) as providers_per_100k
      FROM hospice_providers
      WHERE county IS NOT NULL
      GROUP BY county, state
      HAVING COUNT(*) >= 3
      ORDER BY providers_per_100k DESC
      LIMIT 30
    `;

    // Ownership concentration
    const ownershipConcentration = await sql`
      SELECT
        COALESCE(ownership_type_cms, 'Unknown') as ownership_type,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE pe_backed = true) as pe_backed,
        COUNT(*) FILTER (WHERE chain_affiliated = true) as chain_affiliated,
        ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc,
        ROUND(AVG(total_revenue)::numeric, 0) as avg_revenue,
        COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count
      FROM hospice_providers
      GROUP BY ownership_type_cms
      ORDER BY total DESC
    `;

    return NextResponse.json({
      peFirms,
      recentDeals,
      marketShare,
      rollupActivity,
      countyDensity,
      ownershipConcentration,
    });
  } catch (error) {
    console.error('Competitors API error:', error);
    return NextResponse.json({ error: 'Failed to fetch competitor data' }, { status: 500 });
  }
}

// Add new PE firm
export async function POST(request: Request) {
  try {
    const { name, website, portfolio_count, notes } = await request.json();

    await sql`
      INSERT INTO pe_firms (name, website, portfolio_count, notes)
      VALUES (${name}, ${website || null}, ${portfolio_count || 0}, ${notes || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add PE firm error:', error);
    return NextResponse.json({ error: 'Failed to add PE firm' }, { status: 500 });
  }
}
