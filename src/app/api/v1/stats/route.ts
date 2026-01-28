import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateApiKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key required. Include X-API-Key header.' },
      { status: 401 }
    );
  }

  const keyData = await validateApiKey(apiKey);

  if (!keyData) {
    return NextResponse.json(
      { error: 'Invalid API key or rate limit exceeded' },
      { status: 401 }
    );
  }

  try {
    const [overview, byState, byClassification] = await Promise.all([
      sql`
        SELECT
          COUNT(*) as total_providers,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
          COUNT(*) FILTER (WHERE classification = 'RED') as red_count,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc,
          COUNT(DISTINCT state) as total_states,
          COUNT(*) FILTER (WHERE con_state = true) as con_state_providers
        FROM hospice_providers
      `,
      sql`
        SELECT
          state,
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
          BOOL_OR(con_state) as is_con_state,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score
        FROM hospice_providers
        GROUP BY state
        ORDER BY total DESC
      `,
      sql`
        SELECT
          classification,
          COUNT(*) as total,
          ROUND(AVG(overall_score)::numeric, 1) as avg_score,
          ROUND(AVG(estimated_adc)::numeric, 1) as avg_adc
        FROM hospice_providers
        GROUP BY classification
      `,
    ]);

    return NextResponse.json({
      success: true,
      data: {
        overview: overview[0],
        byState,
        byClassification,
      },
    });
  } catch (error) {
    console.error('API v1 stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
