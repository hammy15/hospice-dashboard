import { NextRequest, NextResponse } from 'next/server';
import FiveStarDataset, {
  queryKnowledge,
  searchKnowledge,
  getActionPlan,
  calculateProjectedQMStars,
  getImprovementRecommendations
} from '@/lib/knowledge';

/**
 * CMS Five-Star Knowledge Base API
 *
 * Endpoints:
 * GET /api/knowledge?topic=falls - Query specific topic
 * GET /api/knowledge?search=pressure ulcer - Search knowledge base
 * GET /api/knowledge?section=overview - Get entire section
 * GET /api/knowledge?action=actionPlan&measure=falls - Get action plan
 * GET /api/knowledge?action=recommendations&stars=2 - Get improvement recommendations
 * GET /api/knowledge?action=calculate - Calculate projected stars (POST with measures)
 */

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const topic = searchParams.get('topic');
  const search = searchParams.get('search');
  const section = searchParams.get('section');
  const action = searchParams.get('action');
  const measure = searchParams.get('measure');
  const stars = searchParams.get('stars');

  try {
    // Query specific topic
    if (topic) {
      const result = queryKnowledge(topic);
      if (result) {
        return NextResponse.json({
          success: true,
          data: result,
          message: `Knowledge retrieved for topic: ${topic}`
        });
      }
      return NextResponse.json({
        success: false,
        error: 'Topic not found',
        suggestion: 'Try topics like: falls, pressure ulcers, staffing, health inspections, quality measures, improvement strategies'
      }, { status: 404 });
    }

    // Search knowledge base
    if (search) {
      const results = searchKnowledge(search);
      return NextResponse.json({
        success: true,
        data: results,
        count: results.length,
        message: `Found ${results.length} results for: ${search}`
      });
    }

    // Get entire section
    if (section) {
      const sectionMap: Record<string, any> = {
        overview: FiveStarDataset.Overview,
        healthInspections: FiveStarDataset.Domains.HealthInspections,
        staffing: FiveStarDataset.Domains.Staffing,
        qualityMeasures: FiveStarDataset.Domains.QualityMeasures,
        overall: FiveStarDataset.Domains.Overall,
        improvementStrategies: FiveStarDataset.ImprovementStrategies,
        resources: FiveStarDataset.Resources,
        references: FiveStarDataset.References,
        all: FiveStarDataset
      };

      const sectionData = sectionMap[section];
      if (sectionData) {
        return NextResponse.json({
          success: true,
          data: sectionData,
          section,
          message: `Complete ${section} data retrieved`
        });
      }
      return NextResponse.json({
        success: false,
        error: 'Section not found',
        availableSections: Object.keys(sectionMap)
      }, { status: 404 });
    }

    // Get action plan
    if (action === 'actionPlan' && measure) {
      const plan = getActionPlan(measure);
      return NextResponse.json({
        success: true,
        data: {
          measure,
          actionPlan: plan
        },
        message: `Action plan for ${measure}`
      });
    }

    // Get improvement recommendations
    if (action === 'recommendations' && stars) {
      const currentStars = parseInt(stars);
      if (isNaN(currentStars) || currentStars < 1 || currentStars > 5) {
        return NextResponse.json({
          success: false,
          error: 'Invalid star rating. Must be 1-5.'
        }, { status: 400 });
      }
      const recommendations = getImprovementRecommendations(currentStars);
      return NextResponse.json({
        success: true,
        data: recommendations,
        message: `Improvement recommendations from ${currentStars} stars`
      });
    }

    // Default: return overview and available endpoints
    return NextResponse.json({
      success: true,
      message: 'CMS Five-Star Knowledge Base API',
      description: FiveStarDataset.Overview.Description,
      facilitiesRated: FiveStarDataset.Overview.FacilitiesRated,
      lastUpdated: '2024',
      endpoints: {
        'GET ?topic=<topic>': 'Query specific topic (falls, staffing, quality measures, etc.)',
        'GET ?search=<query>': 'Search entire knowledge base',
        'GET ?section=<section>': 'Get complete section (overview, healthInspections, staffing, qualityMeasures, overall, improvementStrategies, resources, all)',
        'GET ?action=actionPlan&measure=<measure>': 'Get action plan for measure (falls, pressure, uti, antipsychotic, catheter, restraint)',
        'GET ?action=recommendations&stars=<1-5>': 'Get improvement recommendations for current star level',
        'POST ?action=calculate': 'Calculate projected QM stars from measure data'
      },
      availableTopics: [
        'falls', 'pressure ulcers', 'uti', 'antipsychotics', 'restraints', 'catheter',
        'staffing', 'health inspections', 'quality measures', 'overall rating',
        'improvement strategies', 'cost-effective', 'resources'
      ]
    });

  } catch (error) {
    console.error('Knowledge API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  try {
    if (action === 'calculate') {
      const body = await request.json();
      const measures = body.measures;

      if (!measures || typeof measures !== 'object') {
        return NextResponse.json({
          success: false,
          error: 'Invalid request. Provide measures object with QM values.',
          example: {
            measures: {
              fallsLongStay: 1.5,
              pressureUlcers: 4.0,
              uti: 3.0,
              antipsychotics: 12,
              restraints: 0.3,
              catheter: 2.0,
              adlDecline: 15,
              depression: 5
            }
          }
        }, { status: 400 });
      }

      const result = calculateProjectedQMStars(measures);
      return NextResponse.json({
        success: true,
        data: result,
        message: `Projected QM star rating: ${result.starRating} stars (${result.totalPoints} points)`
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action for POST request. Use action=calculate'
    }, { status: 400 });

  } catch (error) {
    console.error('Knowledge API POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Invalid JSON or server error'
    }, { status: 500 });
  }
}
