import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Get comprehensive analytics data
    const [
      overviewStats,
      classificationTrend,
      stateBreakdown,
      ownershipBreakdown,
      adcBuckets,
      scoreBuckets,
      revenueDistribution,
      demographicsCorrelation,
      conVsNonCon,
      qualityMetrics,
      financialHealth,
      topCounties,
      marketDensity,
    ] = await Promise.all([
      // Overview stats
      sql`
        SELECT
          COUNT(*) as total_providers,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
          COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc,
          ROUND(SUM(total_revenue)::numeric, 0) as total_revenue,
          COUNT(*) FILTER (WHERE total_revenue IS NOT NULL) as with_financials,
          COUNT(*) FILTER (WHERE npi IS NOT NULL) as with_npi,
          COUNT(*) FILTER (WHERE cms_cahps_star IS NOT NULL) as with_star_rating,
          COUNT(*) FILTER (WHERE latitude IS NOT NULL) as geocoded,
          COUNT(DISTINCT state) as total_states,
          COUNT(DISTINCT county) as total_counties
        FROM hospice_providers
      `,

      // Classification by score ranges
      sql`
        SELECT
          CASE
            WHEN overall_score >= 80 THEN '80-100 (Excellent)'
            WHEN overall_score >= 70 THEN '70-80 (Good)'
            WHEN overall_score >= 60 THEN '60-70 (Average)'
            WHEN overall_score >= 50 THEN '50-60 (Below Avg)'
            ELSE 'Under 50 (Poor)'
          END as score_range,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
          COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc
        FROM hospice_providers
        WHERE overall_score IS NOT NULL
        GROUP BY 1
        ORDER BY MIN(overall_score) DESC
      `,

      // State breakdown with all metrics
      sql`
        SELECT
          state,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
          COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc,
          ROUND(SUM(total_revenue)::numeric, 0) as total_revenue,
          ROUND(AVG(county_pop_65_plus)::numeric, 0) as avg_pop_65,
          BOOL_OR(con_state) as is_con_state
        FROM hospice_providers
        GROUP BY state
        ORDER BY green_count DESC
      `,

      // Ownership breakdown
      sql`
        SELECT
          COALESCE(ownership_type_cms, 'Unknown') as ownership_type,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc,
          ROUND(AVG(total_revenue)::numeric, 0) as avg_revenue,
          COUNT(*) FILTER (WHERE pe_backed = true) as pe_backed_count
        FROM hospice_providers
        GROUP BY ownership_type_cms
        ORDER BY total DESC
      `,

      // ADC distribution
      sql`
        SELECT
          CASE
            WHEN estimated_adc < 20 THEN '0-20 (Small)'
            WHEN estimated_adc < 40 THEN '20-40 (Target)'
            WHEN estimated_adc < 60 THEN '40-60 (Target)'
            WHEN estimated_adc < 100 THEN '60-100 (Medium)'
            WHEN estimated_adc < 200 THEN '100-200 (Large)'
            ELSE '200+ (Enterprise)'
          END as adc_range,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(total_revenue)::numeric, 0) as avg_revenue
        FROM hospice_providers
        WHERE estimated_adc IS NOT NULL
        GROUP BY 1
        ORDER BY MIN(estimated_adc)
      `,

      // Score distribution
      sql`
        SELECT
          CASE
            WHEN overall_score >= 80 THEN '80+'
            WHEN overall_score >= 70 THEN '70-80'
            WHEN overall_score >= 60 THEN '60-70'
            WHEN overall_score >= 50 THEN '50-60'
            WHEN overall_score >= 40 THEN '40-50'
            ELSE 'Under 40'
          END as score_range,
          COUNT(*) as total
        FROM hospice_providers
        WHERE overall_score IS NOT NULL
        GROUP BY 1
        ORDER BY MIN(overall_score) DESC
      `,

      // Revenue distribution (for providers with financials)
      sql`
        SELECT
          CASE
            WHEN total_revenue < 1000000 THEN 'Under $1M'
            WHEN total_revenue < 3000000 THEN '$1-3M'
            WHEN total_revenue < 5000000 THEN '$3-5M'
            WHEN total_revenue < 10000000 THEN '$5-10M'
            WHEN total_revenue < 20000000 THEN '$10-20M'
            ELSE '$20M+'
          END as revenue_range,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          COUNT(*) FILTER (WHERE net_income > 0) as profitable_count,
          ROUND(AVG(net_income)::numeric, 0) as avg_net_income
        FROM hospice_providers
        WHERE total_revenue IS NOT NULL
        GROUP BY 1
        ORDER BY MIN(total_revenue)
      `,

      // Demographics correlation
      sql`
        SELECT
          CASE
            WHEN county_pct_65_plus >= 25 THEN '25%+ (High Aging)'
            WHEN county_pct_65_plus >= 20 THEN '20-25%'
            WHEN county_pct_65_plus >= 15 THEN '15-20%'
            ELSE 'Under 15%'
          END as aging_pct_range,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc
        FROM hospice_providers
        WHERE county_pct_65_plus IS NOT NULL
        GROUP BY 1
        ORDER BY MIN(county_pct_65_plus) DESC
      `,

      // CON vs Non-CON comparison
      sql`
        SELECT
          CASE WHEN con_state THEN 'CON States' ELSE 'Non-CON States' END as category,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc,
          ROUND(AVG(total_revenue)::numeric, 0) as avg_revenue,
          ROUND((COUNT(*) FILTER (WHERE classification = 'GREEN')::numeric / COUNT(*)::numeric * 100), 1) as green_rate
        FROM hospice_providers
        GROUP BY con_state
      `,

      // Quality metrics
      sql`
        SELECT
          cms_cahps_star as star_rating,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc
        FROM hospice_providers
        WHERE cms_cahps_star IS NOT NULL
        GROUP BY cms_cahps_star
        ORDER BY cms_cahps_star DESC
      `,

      // Financial health summary
      sql`
        SELECT
          CASE
            WHEN net_income > 1000000 THEN 'Highly Profitable (>$1M)'
            WHEN net_income > 500000 THEN 'Profitable ($500K-$1M)'
            WHEN net_income > 0 THEN 'Marginally Profitable'
            WHEN net_income > -500000 THEN 'Small Loss'
            ELSE 'Significant Loss'
          END as profit_category,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          ROUND(AVG(total_revenue)::numeric, 0) as avg_revenue,
          ROUND(AVG(cost_per_day)::numeric, 2) as avg_cost_per_day
        FROM hospice_providers
        WHERE net_income IS NOT NULL
        GROUP BY 1
        ORDER BY MIN(net_income) DESC
      `,

      // Top counties by 65+ population
      sql`
        SELECT DISTINCT ON (county, state)
          county,
          state,
          county_pop_65_plus,
          county_pct_65_plus,
          county_median_income,
          (SELECT COUNT(*) FROM hospice_providers hp2 WHERE hp2.county = hp.county AND hp2.state = hp.state) as provider_count,
          (SELECT COUNT(*) FROM hospice_providers hp2 WHERE hp2.county = hp.county AND hp2.state = hp.state AND hp2.classification = 'GREEN') as green_count
        FROM hospice_providers hp
        WHERE county_pop_65_plus IS NOT NULL
        ORDER BY county, state, county_pop_65_plus DESC
        LIMIT 20
      `,

      // Market density (providers per 100k 65+ population)
      sql`
        SELECT
          state,
          SUM(county_pop_65_plus) as total_65_plus,
          COUNT(*) as provider_count,
          ROUND((COUNT(*)::numeric / NULLIF(SUM(county_pop_65_plus), 0) * 100000)::numeric, 1) as providers_per_100k
        FROM hospice_providers
        WHERE county_pop_65_plus IS NOT NULL
        GROUP BY state
        HAVING SUM(county_pop_65_plus) > 0
        ORDER BY providers_per_100k DESC
        LIMIT 15
      `,
    ]);

    return NextResponse.json({
      overview: overviewStats[0],
      classificationTrend,
      stateBreakdown,
      ownershipBreakdown,
      adcBuckets,
      scoreBuckets,
      revenueDistribution,
      demographicsCorrelation,
      conVsNonCon,
      qualityMetrics,
      financialHealth,
      topCounties,
      marketDensity,
    });
  } catch (error) {
    console.error('Insights API error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}
