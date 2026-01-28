import { NextResponse } from 'next/server';
import {
  getEndemicStats,
  getEndemicByState,
  getDealPipelineStats,
  getTopOwnerCarryBackOpportunities,
  getOwnerCarryBackCandidates,
  calculateOwnerCarryBackScore,
  HospiceProvider,
} from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'overview';
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (type) {
      case 'overview': {
        // Get comprehensive overview data
        const [endemicStats, endemicByState, pipelineStats, topOpportunities] = await Promise.all([
          getEndemicStats(),
          getEndemicByState(),
          getDealPipelineStats(),
          getTopOwnerCarryBackOpportunities(10),
        ]);

        // Add carry-back scores to top opportunities
        const scoredOpportunities = (topOpportunities as HospiceProvider[]).map((p) => ({
          ...p,
          carryBackAnalysis: calculateOwnerCarryBackScore(p),
        }));

        return NextResponse.json({
          success: true,
          data: {
            endemicStats,
            endemicByState,
            pipelineStats,
            topOpportunities: scoredOpportunities,
          },
        });
      }

      case 'candidates': {
        const candidates = await getOwnerCarryBackCandidates(limit);

        // Add detailed carry-back analysis to each
        const scoredCandidates = (candidates as HospiceProvider[]).map((p) => ({
          ...p,
          carryBackAnalysis: calculateOwnerCarryBackScore(p),
        }));

        return NextResponse.json({
          success: true,
          data: {
            candidates: scoredCandidates,
            total: scoredCandidates.length,
          },
        });
      }

      case 'top': {
        const topOpportunities = await getTopOwnerCarryBackOpportunities(limit);

        const scoredOpportunities = (topOpportunities as HospiceProvider[]).map((p) => ({
          ...p,
          carryBackAnalysis: calculateOwnerCarryBackScore(p),
        }));

        return NextResponse.json({
          success: true,
          data: {
            opportunities: scoredOpportunities,
            total: scoredOpportunities.length,
          },
        });
      }

      case 'pipeline': {
        const pipelineStats = await getDealPipelineStats();
        return NextResponse.json({
          success: true,
          data: pipelineStats,
        });
      }

      case 'endemic-states': {
        const endemicByState = await getEndemicByState();
        return NextResponse.json({
          success: true,
          data: endemicByState,
        });
      }

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid type parameter',
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Owner carry-back API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch owner carry-back data',
    }, { status: 500 });
  }
}
