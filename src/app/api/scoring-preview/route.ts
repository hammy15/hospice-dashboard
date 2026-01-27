import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Parse criteria from query params
  const adcMax = Number(searchParams.get('adcMax')) || 60;
  const minQualityScore = Number(searchParams.get('minQualityScore')) || 70;
  const minComplianceScore = Number(searchParams.get('minComplianceScore')) || 70;
  const minOperationalScore = Number(searchParams.get('minOperationalScore')) || 50;
  const minMarketScore = Number(searchParams.get('minMarketScore')) || 50;
  const minOverallScore = Number(searchParams.get('minOverallScore')) || 65;

  // Weights (for potential weighted score calculation)
  const qualityWeight = Number(searchParams.get('qualityWeight')) || 30;
  const complianceWeight = Number(searchParams.get('complianceWeight')) || 30;
  const operationalWeight = Number(searchParams.get('operationalWeight')) || 20;
  const marketWeight = Number(searchParams.get('marketWeight')) || 20;

  // Modifiers
  const conStateBonus = Number(searchParams.get('conStateBonus')) || 10;
  const peBakedPenalty = Number(searchParams.get('peBakedPenalty')) || 15;
  const chainPenalty = Number(searchParams.get('chainPenalty')) || 5;
  const ownershipComplexityPenalty = Number(searchParams.get('ownershipComplexityPenalty')) || 10;

  // Get current baseline counts
  const baselineCounts = await sql`
    SELECT
      COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE classification = 'RED') as red_count
    FROM hospice_providers
  `;

  // Calculate derived values
  const adcMaxYellow = adcMax * 1.5;
  const minOverallYellow = minOverallScore * 0.7;
  const totalWeight = qualityWeight + complianceWeight + operationalWeight + marketWeight;

  // Calculate new counts based on criteria
  // This uses a scoring algorithm that considers the user's criteria
  const newCounts = await sql`
    WITH scored_providers AS (
      SELECT
        ccn,
        classification as original_classification,
        estimated_adc,
        quality_score,
        compliance_score,
        operational_score,
        market_score,
        overall_score,
        con_state,
        pe_backed,
        chain_affiliated,
        ownership_complexity,
        -- Calculate weighted score
        CASE
          WHEN quality_score IS NOT NULL AND compliance_score IS NOT NULL
            AND operational_score IS NOT NULL AND market_score IS NOT NULL
          THEN (
            (COALESCE(quality_score, 0) * ${qualityWeight} +
             COALESCE(compliance_score, 0) * ${complianceWeight} +
             COALESCE(operational_score, 0) * ${operationalWeight} +
             COALESCE(market_score, 0) * ${marketWeight}) /
            ${totalWeight}
          )
          ELSE overall_score
        END as weighted_score,
        -- Calculate modifiers
        CASE WHEN con_state THEN ${conStateBonus} ELSE 0 END as con_bonus,
        CASE WHEN pe_backed THEN ${peBakedPenalty} ELSE 0 END as pe_penalty,
        CASE WHEN chain_affiliated THEN ${chainPenalty} ELSE 0 END as chain_pen,
        CASE WHEN ownership_complexity = 'Complex' THEN ${ownershipComplexityPenalty} ELSE 0 END as ownership_pen
      FROM hospice_providers
    ),
    classified AS (
      SELECT
        ccn,
        original_classification,
        weighted_score,
        con_bonus,
        pe_penalty,
        chain_pen,
        ownership_pen,
        estimated_adc,
        quality_score,
        compliance_score,
        operational_score,
        market_score,
        -- Apply new classification rules
        CASE
          -- GREEN criteria: ADC in range, all scores meet minimums, positive modifiers outweigh penalties
          WHEN (estimated_adc IS NULL OR estimated_adc <= ${adcMax})
            AND (quality_score IS NULL OR quality_score >= ${minQualityScore})
            AND (compliance_score IS NULL OR compliance_score >= ${minComplianceScore})
            AND (operational_score IS NULL OR operational_score >= ${minOperationalScore})
            AND (market_score IS NULL OR market_score >= ${minMarketScore})
            AND (weighted_score IS NULL OR weighted_score + con_bonus - pe_penalty - chain_pen - ownership_pen >= ${minOverallScore})
          THEN 'GREEN'
          -- YELLOW criteria: Some criteria met but not all
          WHEN (estimated_adc IS NULL OR estimated_adc <= ${adcMaxYellow})
            AND (weighted_score IS NULL OR weighted_score + con_bonus - pe_penalty - chain_pen - ownership_pen >= ${minOverallYellow})
          THEN 'YELLOW'
          -- RED: Does not meet minimum criteria
          ELSE 'RED'
        END as new_classification
      FROM scored_providers
    )
    SELECT
      COUNT(*) FILTER (WHERE new_classification = 'GREEN') as green_count,
      COUNT(*) FILTER (WHERE new_classification = 'YELLOW') as yellow_count,
      COUNT(*) FILTER (WHERE new_classification = 'RED') as red_count
    FROM classified
  `;

  const baseline = baselineCounts[0];
  const newResults = newCounts[0];

  return NextResponse.json({
    greenCount: Number(newResults.green_count),
    yellowCount: Number(newResults.yellow_count),
    redCount: Number(newResults.red_count),
    greenChange: Number(newResults.green_count) - Number(baseline.green_count),
    yellowChange: Number(newResults.yellow_count) - Number(baseline.yellow_count),
    redChange: Number(newResults.red_count) - Number(baseline.red_count),
    baseline: {
      greenCount: Number(baseline.green_count),
      yellowCount: Number(baseline.yellow_count),
      redCount: Number(baseline.red_count),
    },
  });
}
