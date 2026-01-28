import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const filters = await request.json();

    // Build dynamic WHERE clauses
    const conditions: string[] = ['1=1'];
    const params: any[] = [];
    let paramIndex = 1;

    // Basic filters
    if (filters.state) {
      conditions.push(`UPPER(state) = $${paramIndex++}`);
      params.push(filters.state.toUpperCase());
    }
    if (filters.city) {
      conditions.push(`LOWER(city) LIKE $${paramIndex++}`);
      params.push(`%${filters.city.toLowerCase()}%`);
    }
    if (filters.county) {
      conditions.push(`LOWER(county) LIKE $${paramIndex++}`);
      params.push(`%${filters.county.toLowerCase()}%`);
    }
    if (filters.classification && filters.classification !== 'ALL') {
      conditions.push(`classification = $${paramIndex++}`);
      params.push(filters.classification);
    }
    if (filters.providerName) {
      conditions.push(`LOWER(provider_name) LIKE $${paramIndex++}`);
      params.push(`%${filters.providerName.toLowerCase()}%`);
    }

    // ADC filters
    if (filters.minAdc !== undefined && filters.minAdc !== '') {
      conditions.push(`estimated_adc >= $${paramIndex++}`);
      params.push(Number(filters.minAdc));
    }
    if (filters.maxAdc !== undefined && filters.maxAdc !== '') {
      conditions.push(`estimated_adc <= $${paramIndex++}`);
      params.push(Number(filters.maxAdc));
    }

    // Score filters
    if (filters.minScore !== undefined && filters.minScore !== '') {
      conditions.push(`overall_score >= $${paramIndex++}`);
      params.push(Number(filters.minScore));
    }
    if (filters.maxScore !== undefined && filters.maxScore !== '') {
      conditions.push(`overall_score <= $${paramIndex++}`);
      params.push(Number(filters.maxScore));
    }

    // Financial filters
    if (filters.minRevenue !== undefined && filters.minRevenue !== '') {
      conditions.push(`total_revenue >= $${paramIndex++}`);
      params.push(Number(filters.minRevenue) * 1000000); // Convert millions
    }
    if (filters.maxRevenue !== undefined && filters.maxRevenue !== '') {
      conditions.push(`total_revenue <= $${paramIndex++}`);
      params.push(Number(filters.maxRevenue) * 1000000);
    }
    if (filters.minNetIncome !== undefined && filters.minNetIncome !== '') {
      conditions.push(`net_income >= $${paramIndex++}`);
      params.push(Number(filters.minNetIncome) * 1000000);
    }
    if (filters.profitableOnly) {
      conditions.push(`net_income > 0`);
    }
    if (filters.hasFinancials) {
      conditions.push(`total_revenue IS NOT NULL`);
    }

    // Demographics filters
    if (filters.minPop65 !== undefined && filters.minPop65 !== '') {
      conditions.push(`county_pop_65_plus >= $${paramIndex++}`);
      params.push(Number(filters.minPop65));
    }
    if (filters.minPct65 !== undefined && filters.minPct65 !== '') {
      conditions.push(`county_pct_65_plus >= $${paramIndex++}`);
      params.push(Number(filters.minPct65));
    }
    if (filters.minMedianIncome !== undefined && filters.minMedianIncome !== '') {
      conditions.push(`county_median_income >= $${paramIndex++}`);
      params.push(Number(filters.minMedianIncome));
    }
    if (filters.maxMedianIncome !== undefined && filters.maxMedianIncome !== '') {
      conditions.push(`county_median_income <= $${paramIndex++}`);
      params.push(Number(filters.maxMedianIncome));
    }

    // Star rating filters
    if (filters.minCahpsStar !== undefined && filters.minCahpsStar !== '') {
      conditions.push(`cms_cahps_star >= $${paramIndex++}`);
      params.push(Number(filters.minCahpsStar));
    }
    if (filters.hasStarRating) {
      conditions.push(`cms_cahps_star IS NOT NULL`);
    }

    // Ownership filters
    if (filters.ownershipType) {
      conditions.push(`LOWER(ownership_type_cms) LIKE $${paramIndex++}`);
      params.push(`%${filters.ownershipType.toLowerCase()}%`);
    }
    if (filters.peBacked === 'yes') {
      conditions.push(`pe_backed = true`);
    } else if (filters.peBacked === 'no') {
      conditions.push(`pe_backed = false`);
    }
    if (filters.chainAffiliated === 'yes') {
      conditions.push(`chain_affiliated = true`);
    } else if (filters.chainAffiliated === 'no') {
      conditions.push(`chain_affiliated = false`);
    }
    if (filters.recentOwnershipChange === 'yes') {
      conditions.push(`recent_ownership_change = true`);
    }

    // CON state filter
    if (filters.conStateOnly) {
      conditions.push(`con_state = true`);
    }

    // Registry filters
    if (filters.hasNpi) {
      conditions.push(`npi IS NOT NULL`);
    }
    if (filters.hasEin) {
      conditions.push(`ein IS NOT NULL`);
    }
    if (filters.hasAuthorizedOfficial) {
      conditions.push(`authorized_official IS NOT NULL`);
    }

    // Contact filters
    if (filters.hasPhone) {
      conditions.push(`phone_number IS NOT NULL`);
    }
    if (filters.hasWebsite) {
      conditions.push(`website IS NOT NULL`);
    }
    if (filters.hasAddress) {
      conditions.push(`address_line_1 IS NOT NULL`);
    }

    // Geolocation filter
    if (filters.hasCoordinates) {
      conditions.push(`latitude IS NOT NULL AND longitude IS NOT NULL`);
    }

    // Build ORDER BY
    let orderBy = 'overall_score DESC NULLS LAST';
    if (filters.sortBy) {
      const sortDir = filters.sortDir === 'asc' ? 'ASC' : 'DESC';
      const nullsPos = filters.sortDir === 'asc' ? 'NULLS FIRST' : 'NULLS LAST';

      const sortColumns: Record<string, string> = {
        score: 'overall_score',
        adc: 'estimated_adc',
        revenue: 'total_revenue',
        expenses: 'total_expenses',
        netIncome: 'net_income',
        pop65: 'county_pop_65_plus',
        pct65: 'county_pct_65_plus',
        star: 'cms_cahps_star',
        name: 'provider_name',
        state: 'state',
        city: 'city',
      };

      if (sortColumns[filters.sortBy]) {
        orderBy = `${sortColumns[filters.sortBy]} ${sortDir} ${nullsPos}`;
      }
    }

    // Pagination
    const limit = Math.min(filters.limit || 100, 500);
    const offset = filters.offset || 0;

    // Build the query
    const whereClause = conditions.join(' AND ');

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM hospice_providers WHERE ${whereClause}`;
    const countResult = await sql.apply(null, [countQuery, ...params] as any);
    const total = Number(countResult[0]?.total || 0);

    // Get results
    const query = `
      SELECT
        ccn, provider_name, city, state, county, classification,
        overall_score, quality_score, compliance_score, operational_score, market_score,
        estimated_adc, adc_fit, ownership_type_cms, pe_backed, chain_affiliated,
        con_state, market_type, competitive_density,
        total_revenue, total_expenses, net_income, cost_per_day, cost_report_year,
        county_pop_65_plus, county_pct_65_plus, county_median_income,
        cms_cahps_star, cms_quality_star,
        npi, authorized_official, authorized_official_title,
        ein, nonprofit_revenue, nonprofit_assets,
        phone_number, website, address_line_1,
        latitude, longitude,
        outreach_readiness, platform_vs_tuckin, confidence_level
      FROM hospice_providers
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const results = await sql.apply(null, [query, ...params] as any);

    // Get aggregates for the filtered results
    const aggregateQuery = `
      SELECT
        COUNT(*) as count,
        COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
        COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
        ROUND(AVG(overall_score)::numeric, 1) as avg_score,
        ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc,
        ROUND(AVG(total_revenue)::numeric, 0) as avg_revenue,
        ROUND(SUM(total_revenue)::numeric, 0) as total_revenue,
        COUNT(DISTINCT state) as states,
        COUNT(DISTINCT city) as cities
      FROM hospice_providers
      WHERE ${whereClause}
    `;
    const aggregates = await sql.apply(null, [aggregateQuery, ...params] as any);

    return NextResponse.json({
      results,
      total,
      aggregates: aggregates[0],
      limit,
      offset,
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
