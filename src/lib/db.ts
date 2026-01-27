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
