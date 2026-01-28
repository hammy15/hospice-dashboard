import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get top 10 opportunities with comprehensive data
    const topOpportunities = await sql`
      SELECT
        ccn, provider_name, city, state, county,
        overall_score, quality_score, compliance_score, operational_score, market_score,
        estimated_adc, classification,
        total_revenue, total_expenses, net_income, cost_per_day,
        county_pop_65_plus, county_pct_65_plus, county_median_income,
        con_state, ownership_type_cms, pe_backed, chain_affiliated,
        cms_cahps_star, cms_quality_star,
        npi, ein, authorized_official,
        phone_number, website, address_line_1,
        latitude, longitude,
        outreach_readiness, platform_vs_tuckin, confidence_level,
        sell_side_hypothesis, classification_reasons
      FROM hospice_providers
      WHERE classification = 'GREEN'
        AND overall_score IS NOT NULL
      ORDER BY overall_score DESC, estimated_adc DESC NULLS LAST
      LIMIT 10
    `;

    // Get market summary stats
    const marketStats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE classification = 'GREEN') as total_green,
        COUNT(*) FILTER (WHERE classification = 'GREEN' AND con_state = true) as green_in_con,
        ROUND(AVG(overall_score) FILTER (WHERE classification = 'GREEN'), 1) as avg_green_score,
        ROUND(AVG(estimated_adc) FILTER (WHERE classification = 'GREEN'), 1) as avg_green_adc,
        ROUND(SUM(total_revenue) FILTER (WHERE classification = 'GREEN'), 0) as total_green_revenue,
        ROUND(AVG(total_revenue) FILTER (WHERE classification = 'GREEN' AND total_revenue IS NOT NULL), 0) as avg_green_revenue,
        COUNT(*) FILTER (WHERE classification = 'GREEN' AND total_revenue IS NOT NULL) as green_with_financials
      FROM hospice_providers
    `;

    // Get state distribution of top opportunities
    const stateDistribution = await sql`
      SELECT
        state,
        COUNT(*) as count,
        ROUND(AVG(overall_score), 1) as avg_score,
        BOOL_OR(con_state) as is_con_state
      FROM hospice_providers
      WHERE classification = 'GREEN'
      GROUP BY state
      ORDER BY count DESC
      LIMIT 10
    `;

    return NextResponse.json({
      opportunities: topOpportunities,
      marketStats: marketStats[0],
      stateDistribution,
    });
  } catch (error) {
    console.error('Top opportunities API error:', error);
    return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 });
  }
}
