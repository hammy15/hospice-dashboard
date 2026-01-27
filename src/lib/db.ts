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
      COUNT(*) FILTER (WHERE phone_number IS NOT NULL) as with_phone
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
