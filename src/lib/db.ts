import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL!);

export interface HospiceProvider {
  id: number;
  ccn: string;
  provider_name: string;
  state: string;
  city: string;
  county: string;
  con_state: boolean;
  market_type: string;
  competitive_density: string;
  estimated_adc: number | null;
  adc_fit: string;
  service_area_zip_count: number;
  ownership_type_cms: string;
  pe_backed: boolean;
  chain_affiliated: boolean;
  recent_ownership_change: boolean;
  ownership_complexity: string;
  owner_count: number | null;
  quality_score: number | null;
  compliance_score: number | null;
  operational_score: number | null;
  market_score: number | null;
  overall_score: number | null;
  classification: 'GREEN' | 'YELLOW' | 'RED';
  confidence_level: string;
  confidence_score: number | null;
  classification_reasons: string;
  outreach_readiness: string;
  platform_vs_tuckin: string;
  sell_side_hypothesis: string;
  upgrade_triggers: string;
  downgrade_triggers: string;
  data_quality: string;
  missing_data: string;
  certification_date: string;
  data_source: string;
  analysis_date: string;
  // Contact information
  address_line_1: string | null;
  address_line_2: string | null;
  zip_code: string | null;
  phone_number: string | null;
  website: string | null;
  administrator_name: string | null;
  administrator_phone: string | null;
  // Census demographics
  county_population: number | null;
  county_pop_65_plus: number | null;
  county_pct_65_plus: number | null;
  county_median_income: number | null;
  county_fips: string | null;
  census_data_year: number | null;
  // Star ratings
  cms_quality_star: number | null;
  cms_cahps_star: number | null;
  star_rating_date: string | null;
  // Geolocation
  latitude: number | null;
  longitude: number | null;
  geocode_quality: string | null;
  // Cost Report financials
  cost_report_year: number | null;
  total_revenue: number | null;
  total_expenses: number | null;
  net_income: number | null;
  total_patient_days: number | null;
  cost_per_day: number | null;
  // NPI Registry
  npi: string | null;
  authorized_official: string | null;
  authorized_official_title: string | null;
  authorized_official_phone: string | null;
  taxonomy_code: string | null;
  // Nonprofit 990
  ein: string | null;
  nonprofit_revenue: number | null;
  nonprofit_assets: number | null;
  exec_compensation: number | null;
  nonprofit_tax_year: number | null;
}

export async function getStats() {
  const result = await sql`
    SELECT
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
      COUNT(*) as total_count,
      COUNT(*) FILTER (WHERE con_state = true AND classification = 'GREEN') as green_con_count,
      ROUND(AVG(estimated_adc) FILTER (WHERE classification = 'GREEN'), 1) as avg_green_adc,
      ROUND(AVG(overall_score) FILTER (WHERE classification = 'GREEN'), 1) as avg_green_score
    FROM hospice_providers
  `;
  return result[0];
}

export async function getStateStats() {
  return await sql`
    SELECT
      state,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
      COUNT(*) as total,
      BOOL_OR(con_state) as is_con_state
    FROM hospice_providers
    GROUP BY state
    ORDER BY green_count DESC
    LIMIT 20
  `;
}

export async function getProvider(ccn: string) {
  const result = await sql`
    SELECT * FROM hospice_providers WHERE ccn = ${ccn}
  `;
  return result[0] as HospiceProvider | undefined;
}

export async function getWashingtonTargets() {
  return await sql`
    SELECT * FROM hospice_providers
    WHERE state = 'WA' AND classification IN ('GREEN', 'YELLOW')
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
  `;
}

export async function getTopTargets(limit = 25) {
  return await sql`
    SELECT * FROM hospice_providers
    WHERE classification = 'GREEN'
    ORDER BY overall_score DESC
    LIMIT ${limit}
  `;
}

export async function getStates() {
  return await sql`
    SELECT DISTINCT state FROM hospice_providers ORDER BY state
  `;
}

export async function getOwnershipStats() {
  return await sql`
    SELECT
      ownership_type_cms as type,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count
    FROM hospice_providers
    WHERE ownership_type_cms IS NOT NULL AND ownership_type_cms != ''
    GROUP BY ownership_type_cms
    ORDER BY total DESC
    LIMIT 10
  `;
}

export async function getAdcDistribution() {
  return await sql`
    SELECT
      CASE
        WHEN estimated_adc < 20 THEN '0-20'
        WHEN estimated_adc < 40 THEN '20-40'
        WHEN estimated_adc < 60 THEN '40-60'
        WHEN estimated_adc < 80 THEN '60-80'
        WHEN estimated_adc < 100 THEN '80-100'
        ELSE '100+'
      END as range,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count
    FROM hospice_providers
    WHERE estimated_adc IS NOT NULL
    GROUP BY 1
    ORDER BY MIN(estimated_adc)
  `;
}

export async function getScoreDistribution() {
  return await sql`
    SELECT
      CASE
        WHEN overall_score < 30 THEN '0-30'
        WHEN overall_score < 50 THEN '30-50'
        WHEN overall_score < 70 THEN '50-70'
        WHEN overall_score < 85 THEN '70-85'
        ELSE '85-100'
      END as range,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count
    FROM hospice_providers
    WHERE overall_score IS NOT NULL
    GROUP BY 1
    ORDER BY MIN(overall_score)
  `;
}

export async function getMapData() {
  return await sql`
    SELECT
      state,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
      BOOL_OR(con_state) as is_con_state,
      ROUND(AVG(overall_score), 1) as avg_score
    FROM hospice_providers
    GROUP BY state
    ORDER BY state
  `;
}

export async function getConStateComparison() {
  return await sql`
    SELECT
      CASE WHEN con_state THEN 'CON States' ELSE 'Non-CON States' END as category,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
      ROUND(AVG(overall_score), 1) as avg_score,
      ROUND(AVG(estimated_adc), 1) as avg_adc
    FROM hospice_providers
    GROUP BY con_state
  `;
}

export async function getMarketTargets(state: string) {
  return await sql`
    SELECT * FROM hospice_providers
    WHERE UPPER(state) = ${state.toUpperCase()} AND classification IN ('GREEN', 'YELLOW')
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
  `;
}

export async function getMarketStats(state: string) {
  const result = await sql`
    SELECT
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
      COUNT(*) as total_count,
      ROUND(AVG(estimated_adc) FILTER (WHERE classification = 'GREEN'), 1) as avg_green_adc,
      ROUND(AVG(overall_score) FILTER (WHERE classification = 'GREEN'), 1) as avg_green_score,
      BOOL_OR(con_state) as is_con_state,
      COUNT(DISTINCT city) as city_count,
      COUNT(*) FILTER (WHERE website IS NOT NULL) as with_website,
      COUNT(*) FILTER (WHERE phone_number IS NOT NULL) as with_phone,
      ROUND(AVG(cms_cahps_star)::numeric, 2) as avg_cahps_star,
      COUNT(cms_cahps_star) as with_cahps_star
    FROM hospice_providers
    WHERE UPPER(state) = ${state.toUpperCase()}
  `;
  return result[0];
}

export async function getMarketCityBreakdown(state: string) {
  return await sql`
    SELECT
      city,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) as total
    FROM hospice_providers
    WHERE UPPER(state) = ${state.toUpperCase()} AND classification IN ('GREEN', 'YELLOW')
    GROUP BY city
    ORDER BY green_count DESC, total DESC
    LIMIT 15
  `;
}

export async function getRelatedProviders(ccn: string, state: string, city: string, limit = 5) {
  return await sql`
    SELECT ccn, provider_name, city, state, classification, overall_score, estimated_adc
    FROM hospice_providers
    WHERE ccn != ${ccn}
      AND state = ${state}
      AND classification IN ('GREEN', 'YELLOW')
    ORDER BY
      CASE WHEN city = ${city} THEN 0 ELSE 1 END,
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
    LIMIT ${limit}
  `;
}

export async function getMarketDemographics(state: string) {
  const result = await sql`
    SELECT
      ROUND(AVG(county_pop_65_plus)::numeric, 0) as avg_pop_65_plus,
      ROUND(AVG(county_pct_65_plus)::numeric, 1) as avg_pct_65_plus,
      ROUND(AVG(county_median_income)::numeric, 0) as avg_median_income,
      SUM(county_pop_65_plus) as total_pop_65_plus,
      COUNT(DISTINCT county) as counties_covered
    FROM hospice_providers
    WHERE UPPER(state) = ${state.toUpperCase()}
      AND county_pop_65_plus IS NOT NULL
  `;
  return result[0];
}

export async function getTopCountiesByDemographics(state: string, limit = 10) {
  return await sql`
    SELECT
      county,
      county_population,
      county_pop_65_plus,
      county_pct_65_plus,
      county_median_income,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) as provider_count
    FROM hospice_providers
    WHERE UPPER(state) = ${state.toUpperCase()}
      AND county_pop_65_plus IS NOT NULL
    GROUP BY county, county_population, county_pop_65_plus, county_pct_65_plus, county_median_income
    ORDER BY county_pop_65_plus DESC
    LIMIT ${limit}
  `;
}

export async function getGeocodedProviders(classification?: string) {
  if (classification) {
    return await sql`
      SELECT
        ccn, provider_name, city, state, county, classification,
        overall_score, estimated_adc, latitude, longitude,
        county_pop_65_plus, county_pct_65_plus
      FROM hospice_providers
      WHERE latitude IS NOT NULL
        AND longitude IS NOT NULL
        AND classification = ${classification}
      ORDER BY overall_score DESC
    `;
  }

  return await sql`
    SELECT
      ccn, provider_name, city, state, county, classification,
      overall_score, estimated_adc, latitude, longitude,
      county_pop_65_plus, county_pct_65_plus
    FROM hospice_providers
    WHERE latitude IS NOT NULL
      AND longitude IS NOT NULL
      AND classification IN ('GREEN', 'YELLOW')
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
  `;
}

export async function getCountyHeatmapData() {
  return await sql`
    SELECT DISTINCT
      county,
      state,
      county_fips,
      county_pop_65_plus,
      county_pct_65_plus,
      county_median_income,
      AVG(latitude) as lat,
      AVG(longitude) as lng,
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count
    FROM hospice_providers
    WHERE latitude IS NOT NULL
      AND county_pop_65_plus IS NOT NULL
    GROUP BY county, state, county_fips, county_pop_65_plus, county_pct_65_plus, county_median_income
    ORDER BY county_pop_65_plus DESC
  `;
}

export async function getProvidersByFilter(filters: {
  state?: string;
  city?: string;
  classification?: string;
  minAdc?: number;
  maxAdc?: number;
  conStateOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  const {
    state,
    city,
    classification,
    minAdc,
    maxAdc,
    conStateOnly,
    limit = 50,
    offset = 0,
  } = filters;

  // Build dynamic query
  let query = sql`
    SELECT * FROM hospice_providers
    WHERE 1=1
  `;

  if (state) {
    query = sql`${query} AND UPPER(state) = ${state.toUpperCase()}`;
  }
  if (city) {
    query = sql`${query} AND LOWER(city) = ${city.toLowerCase()}`;
  }
  if (classification) {
    query = sql`${query} AND classification = ${classification}`;
  }
  if (minAdc !== undefined) {
    query = sql`${query} AND estimated_adc >= ${minAdc}`;
  }
  if (maxAdc !== undefined) {
    query = sql`${query} AND estimated_adc <= ${maxAdc}`;
  }
  if (conStateOnly) {
    query = sql`${query} AND con_state = true`;
  }

  query = sql`${query}
    ORDER BY
      CASE classification WHEN 'GREEN' THEN 1 WHEN 'YELLOW' THEN 2 ELSE 3 END,
      overall_score DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  return await query;
}

// ============================================
// OWNER CARRY-BACK & ENDEMIC COMPANY ANALYSIS
// ============================================

// Calculate Owner Carry-Back likelihood score
// Endemic companies = single owner, not PE-backed, not chain, smaller ADC
export function calculateOwnerCarryBackScore(provider: HospiceProvider): {
  score: number;
  factors: { name: string; score: number; reason: string }[];
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
} {
  const factors: { name: string; score: number; reason: string }[] = [];
  let totalScore = 0;

  // 1. Not PE-backed (30 points max)
  if (!provider.pe_backed) {
    factors.push({ name: 'Independent Ownership', score: 30, reason: 'Not backed by private equity - more likely to consider creative financing' });
    totalScore += 30;
  } else {
    factors.push({ name: 'PE Ownership', score: 0, reason: 'PE-backed companies typically require institutional-style exits' });
  }

  // 2. Not chain affiliated (20 points max)
  if (!provider.chain_affiliated) {
    factors.push({ name: 'Standalone Operation', score: 20, reason: 'Not part of larger chain - owner has full decision authority' });
    totalScore += 20;
  } else {
    factors.push({ name: 'Chain Affiliated', score: 5, reason: 'Part of chain - may have corporate constraints on deal structure' });
    totalScore += 5;
  }

  // 3. Single owner or simple ownership (20 points max)
  const ownerCount = provider.owner_count || 1;
  if (ownerCount === 1) {
    factors.push({ name: 'Single Owner', score: 20, reason: 'Sole owner can make quick decisions on seller financing' });
    totalScore += 20;
  } else if (ownerCount <= 3) {
    factors.push({ name: 'Small Ownership Group', score: 12, reason: 'Small partnership - consensus easier to reach' });
    totalScore += 12;
  } else {
    factors.push({ name: 'Multiple Owners', score: 5, reason: 'Multiple stakeholders may complicate carry-back terms' });
    totalScore += 5;
  }

  // 4. ADC Sweet Spot 20-60 (15 points max) - ideal size for owner carry-back
  const adc = provider.estimated_adc || 0;
  if (adc >= 20 && adc <= 60) {
    factors.push({ name: 'Ideal Size', score: 15, reason: 'ADC 20-60 is perfect for owner carry-back - established but manageable' });
    totalScore += 15;
  } else if (adc > 0 && adc < 20) {
    factors.push({ name: 'Small Operation', score: 10, reason: 'Smaller ADC - owner may need carry-back for viable purchase price' });
    totalScore += 10;
  } else if (adc > 60 && adc <= 100) {
    factors.push({ name: 'Medium Operation', score: 8, reason: 'Larger ADC - may attract institutional buyers but still viable' });
    totalScore += 8;
  } else {
    factors.push({ name: 'Large Operation', score: 3, reason: 'Large ADC typically attracts PE/strategic buyers' });
    totalScore += 3;
  }

  // 5. No recent ownership change (10 points max)
  if (!provider.recent_ownership_change) {
    factors.push({ name: 'Stable Ownership', score: 10, reason: 'Long-term owner more likely to have emotional investment and consider flexible terms' });
    totalScore += 10;
  } else {
    factors.push({ name: 'Recent Change', score: 2, reason: 'Recent ownership change - may indicate PE flip or distressed situation' });
    totalScore += 2;
  }

  // 6. For-profit structure bonus (5 points max)
  if (provider.ownership_type_cms?.toLowerCase().includes('for-profit') ||
      provider.ownership_type_cms?.toLowerCase().includes('proprietary')) {
    factors.push({ name: 'For-Profit', score: 5, reason: 'For-profit structure - owner seeks return, more receptive to deal structures' });
    totalScore += 5;
  }

  // Determine likelihood
  let likelihood: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (totalScore >= 70) likelihood = 'HIGH';
  else if (totalScore >= 45) likelihood = 'MEDIUM';

  return { score: totalScore, factors, likelihood };
}

// Get Owner Carry-Back Candidates
export async function getOwnerCarryBackCandidates(limit = 50) {
  return await sql`
    SELECT
      *,
      CASE
        WHEN pe_backed = false AND chain_affiliated = false AND COALESCE(owner_count, 1) <= 2
             AND estimated_adc BETWEEN 20 AND 60 AND recent_ownership_change = false
        THEN 'HIGH'
        WHEN pe_backed = false AND (chain_affiliated = false OR COALESCE(owner_count, 1) <= 3)
        THEN 'MEDIUM'
        ELSE 'LOW'
      END as carry_back_likelihood
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
      AND pe_backed = false
    ORDER BY
      CASE
        WHEN pe_backed = false AND chain_affiliated = false AND COALESCE(owner_count, 1) <= 2
             AND estimated_adc BETWEEN 20 AND 60 AND recent_ownership_change = false
        THEN 1
        WHEN pe_backed = false AND (chain_affiliated = false OR COALESCE(owner_count, 1) <= 3)
        THEN 2
        ELSE 3
      END,
      CASE classification WHEN 'GREEN' THEN 1 ELSE 2 END,
      overall_score DESC
    LIMIT ${limit}
  `;
}

// Get Endemic Company Statistics
export async function getEndemicStats() {
  const result = await sql`
    SELECT
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false) as endemic_count,
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND classification = 'GREEN') as endemic_green,
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND classification = 'YELLOW') as endemic_yellow,
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND COALESCE(owner_count, 1) = 1) as single_owner_endemic,
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND estimated_adc BETWEEN 20 AND 60) as ideal_size_endemic,
      COUNT(*) FILTER (
        WHERE pe_backed = false
          AND chain_affiliated = false
          AND COALESCE(owner_count, 1) <= 2
          AND estimated_adc BETWEEN 20 AND 60
          AND recent_ownership_change = false
          AND classification = 'GREEN'
      ) as prime_carry_back_targets,
      ROUND(AVG(estimated_adc) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND classification = 'GREEN'), 1) as avg_endemic_adc,
      ROUND(AVG(overall_score) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND classification = 'GREEN'), 1) as avg_endemic_score
    FROM hospice_providers
  `;
  return result[0];
}

// Get Endemic Companies by State
export async function getEndemicByState() {
  return await sql`
    SELECT
      state,
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false) as endemic_count,
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND classification = 'GREEN') as endemic_green,
      COUNT(*) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND classification = 'YELLOW') as endemic_yellow,
      BOOL_OR(con_state) as is_con_state,
      ROUND(AVG(overall_score) FILTER (WHERE pe_backed = false AND chain_affiliated = false AND classification = 'GREEN'), 1) as avg_score
    FROM hospice_providers
    WHERE pe_backed = false AND chain_affiliated = false
    GROUP BY state
    ORDER BY endemic_green DESC
    LIMIT 20
  `;
}

// Get Acquisition Deal Pipeline Stats
export async function getDealPipelineStats() {
  const result = await sql`
    SELECT
      -- Platform candidates (larger, GREEN, ideal for building)
      COUNT(*) FILTER (
        WHERE classification = 'GREEN'
          AND estimated_adc >= 40
          AND overall_score >= 70
      ) as platform_candidates,

      -- Tuck-in candidates (smaller, can be added to existing platform)
      COUNT(*) FILTER (
        WHERE classification IN ('GREEN', 'YELLOW')
          AND estimated_adc < 40
          AND pe_backed = false
      ) as tuckin_candidates,

      -- Owner carry-back prime targets
      COUNT(*) FILTER (
        WHERE pe_backed = false
          AND chain_affiliated = false
          AND COALESCE(owner_count, 1) <= 2
          AND classification = 'GREEN'
      ) as owner_finance_targets,

      -- Outreach ready
      COUNT(*) FILTER (
        WHERE outreach_readiness = 'Ready'
          AND classification = 'GREEN'
      ) as outreach_ready,

      -- With contact info
      COUNT(*) FILTER (
        WHERE (phone_number IS NOT NULL OR administrator_phone IS NOT NULL)
          AND classification = 'GREEN'
      ) as contactable_green,

      -- CON protected premium
      COUNT(*) FILTER (
        WHERE con_state = true
          AND classification = 'GREEN'
          AND pe_backed = false
      ) as con_protected_independent,

      -- Financial data available
      COUNT(*) FILTER (
        WHERE total_revenue IS NOT NULL
          AND classification = 'GREEN'
      ) as with_financials,

      -- Total estimated market value (rough: $10K per ADC patient)
      ROUND(SUM(estimated_adc * 10000) FILTER (WHERE classification = 'GREEN') / 1000000, 1) as total_market_value_mm
    FROM hospice_providers
  `;
  return result[0];
}

// Get Top Owner Carry-Back Opportunities (detailed)
export async function getTopOwnerCarryBackOpportunities(limit = 25) {
  return await sql`
    SELECT
      *,
      -- Calculate a composite carry-back score
      (
        CASE WHEN pe_backed = false THEN 30 ELSE 0 END +
        CASE WHEN chain_affiliated = false THEN 20 ELSE 5 END +
        CASE
          WHEN COALESCE(owner_count, 1) = 1 THEN 20
          WHEN COALESCE(owner_count, 1) <= 3 THEN 12
          ELSE 5
        END +
        CASE
          WHEN estimated_adc BETWEEN 20 AND 60 THEN 15
          WHEN estimated_adc < 20 THEN 10
          WHEN estimated_adc BETWEEN 61 AND 100 THEN 8
          ELSE 3
        END +
        CASE WHEN recent_ownership_change = false THEN 10 ELSE 2 END +
        CASE WHEN ownership_type_cms ILIKE '%for-profit%' OR ownership_type_cms ILIKE '%proprietary%' THEN 5 ELSE 0 END
      ) as carry_back_score
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
      AND pe_backed = false
      AND chain_affiliated = false
    ORDER BY
      (
        CASE WHEN pe_backed = false THEN 30 ELSE 0 END +
        CASE WHEN chain_affiliated = false THEN 20 ELSE 5 END +
        CASE
          WHEN COALESCE(owner_count, 1) = 1 THEN 20
          WHEN COALESCE(owner_count, 1) <= 3 THEN 12
          ELSE 5
        END +
        CASE
          WHEN estimated_adc BETWEEN 20 AND 60 THEN 15
          WHEN estimated_adc < 20 THEN 10
          WHEN estimated_adc BETWEEN 61 AND 100 THEN 8
          ELSE 3
        END +
        CASE WHEN recent_ownership_change = false THEN 10 ELSE 2 END +
        CASE WHEN ownership_type_cms ILIKE '%for-profit%' OR ownership_type_cms ILIKE '%proprietary%' THEN 5 ELSE 0 END
      ) DESC,
      overall_score DESC
    LIMIT ${limit}
  `;
}
