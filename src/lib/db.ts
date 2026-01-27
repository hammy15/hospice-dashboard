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
