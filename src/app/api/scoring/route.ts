import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Default scoring weights
const DEFAULT_WEIGHTS = {
  adc_weight: 25,       // ADC in target range (20-60)
  quality_weight: 20,   // Quality/compliance scores
  market_weight: 20,    // CON state, market density
  financial_weight: 15, // Revenue, profitability
  ownership_weight: 10, // Not PE-backed, independent
  demographics_weight: 10, // 65+ population
};

// Get scoring profiles
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  try {
    let profiles: unknown[] = [];

    if (user) {
      profiles = await sql`
        SELECT * FROM scoring_profiles
        WHERE user_id = ${user.id}
        ORDER BY is_default DESC, created_at DESC
      `;
    }

    // Always include default profile
    const defaultProfile = {
      id: 'default',
      name: 'Standard Scoring',
      weights: DEFAULT_WEIGHTS,
      is_default: true,
    };

    return NextResponse.json({
      profiles: [defaultProfile, ...profiles],
      defaultWeights: DEFAULT_WEIGHTS,
    });
  } catch (error) {
    console.error('Scoring profiles error:', error);
    return NextResponse.json({ error: 'Failed to fetch scoring profiles' }, { status: 500 });
  }
}

// Create custom scoring profile
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { name, weights, is_default } = await request.json();

    // Validate weights sum to 100
    const total = Object.values(weights as Record<string, number>).reduce((a, b) => a + b, 0);
    if (Math.abs(total - 100) > 0.01) {
      return NextResponse.json({ error: 'Weights must sum to 100' }, { status: 400 });
    }

    // If setting as default, unset others
    if (is_default) {
      await sql`UPDATE scoring_profiles SET is_default = false WHERE user_id = ${user.id}`;
    }

    const result = await sql`
      INSERT INTO scoring_profiles (user_id, name, weights, is_default)
      VALUES (${user.id}, ${name}, ${JSON.stringify(weights)}, ${is_default || false})
      RETURNING *
    `;

    return NextResponse.json({ success: true, profile: result[0] });
  } catch (error) {
    console.error('Create scoring profile error:', error);
    return NextResponse.json({ error: 'Failed to create scoring profile' }, { status: 500 });
  }
}

interface ScoredProvider {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  county: string;
  estimated_adc: number | null;
  overall_score: number | null;
  classification: string;
  con_state: boolean;
  pe_backed: boolean;
  chain_affiliated: boolean;
  quality_score: number | null;
  compliance_score: number | null;
  market_score: number | null;
  total_revenue: number | null;
  net_income: number | null;
  cost_per_day: number | null;
  county_pop_65_plus: number | null;
  county_pct_65_plus: number | null;
  cms_cahps_star: number | null;
  ownership_type_cms: string | null;
  custom_score?: number;
  score_breakdown?: Record<string, number>;
}

// Calculate custom scores for providers
export async function PUT(request: Request) {
  try {
    const { weights, filters } = await request.json();

    // Get providers with all data needed for custom scoring
    const rawProviders = await sql`
      SELECT
        ccn, provider_name, city, state, county,
        estimated_adc, overall_score, classification,
        con_state, pe_backed, chain_affiliated,
        quality_score, compliance_score, market_score,
        total_revenue, net_income, cost_per_day,
        county_pop_65_plus, county_pct_65_plus,
        cms_cahps_star, ownership_type_cms
      FROM hospice_providers
      WHERE classification IN ('GREEN', 'YELLOW')
      ORDER BY overall_score DESC
      LIMIT 500
    ` as ScoredProvider[];

    // Apply custom scoring
    const w = { ...DEFAULT_WEIGHTS, ...weights };
    const totalWeight = Object.values(w).reduce((a: number, b: unknown) => a + (b as number), 0);

    let providers: ScoredProvider[] = rawProviders.map((p) => {
      let customScore = 0;

      // ADC scoring (ideal: 20-60)
      const adc = p.estimated_adc || 0;
      if (adc >= 20 && adc <= 60) {
        customScore += w.adc_weight;
      } else if (adc > 0 && adc < 20) {
        customScore += w.adc_weight * 0.5;
      } else if (adc > 60 && adc <= 100) {
        customScore += w.adc_weight * 0.6;
      }

      // Quality scoring
      const qualityScore = p.quality_score || p.compliance_score || 50;
      customScore += (qualityScore / 100) * w.quality_weight;

      // Market scoring (CON state bonus)
      if (p.con_state) {
        customScore += w.market_weight;
      } else {
        customScore += w.market_weight * 0.5;
      }

      // Financial scoring
      if (p.net_income && p.net_income > 0) {
        customScore += w.financial_weight;
      } else if (p.total_revenue) {
        customScore += w.financial_weight * 0.5;
      }

      // Ownership scoring (independent = better)
      if (!p.pe_backed && !p.chain_affiliated) {
        customScore += w.ownership_weight;
      } else if (!p.pe_backed) {
        customScore += w.ownership_weight * 0.5;
      }

      // Demographics scoring
      const pct65 = p.county_pct_65_plus || 0;
      if (pct65 >= 20) {
        customScore += w.demographics_weight;
      } else if (pct65 >= 15) {
        customScore += w.demographics_weight * 0.7;
      } else {
        customScore += w.demographics_weight * 0.3;
      }

      // Normalize to 0-100
      const normalizedScore = (customScore / totalWeight) * 100;

      return {
        ...p,
        custom_score: Math.round(normalizedScore * 10) / 10,
        score_breakdown: {
          adc: Math.round((adc >= 20 && adc <= 60 ? w.adc_weight : w.adc_weight * 0.5) * 10) / 10,
          quality: Math.round((qualityScore / 100) * w.quality_weight * 10) / 10,
          market: p.con_state ? w.market_weight : w.market_weight * 0.5,
          financial: p.net_income && p.net_income > 0 ? w.financial_weight : (p.total_revenue ? w.financial_weight * 0.5 : 0),
          ownership: !p.pe_backed && !p.chain_affiliated ? w.ownership_weight : (!p.pe_backed ? w.ownership_weight * 0.5 : 0),
          demographics: pct65 >= 20 ? w.demographics_weight : (pct65 >= 15 ? w.demographics_weight * 0.7 : w.demographics_weight * 0.3),
        },
      };
    });

    // Sort by custom score
    providers.sort((a, b) => (b.custom_score || 0) - (a.custom_score || 0));

    // Apply filters if provided
    if (filters?.state) {
      providers = providers.filter((p) => p.state === filters.state.toUpperCase());
    }
    if (filters?.minScore) {
      providers = providers.filter((p) => (p.custom_score || 0) >= filters.minScore);
    }
    if (filters?.conOnly) {
      providers = providers.filter((p) => p.con_state);
    }

    return NextResponse.json({
      providers: providers.slice(0, 100),
      weights: w,
      totalProviders: providers.length,
    });
  } catch (error) {
    console.error('Custom scoring error:', error);
    return NextResponse.json({ error: 'Failed to calculate custom scores' }, { status: 500 });
  }
}
