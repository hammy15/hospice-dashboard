import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { validateApiKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Public API endpoint for external integrations
export async function GET(request: Request) {
  // Check for API key
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

  if (!keyData.permissions.read) {
    return NextResponse.json(
      { error: 'API key does not have read permission' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const classification = searchParams.get('classification');
  const minScore = searchParams.get('minScore');
  const maxAdc = searchParams.get('maxAdc');
  const conOnly = searchParams.get('conOnly');
  const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    let baseQuery = sql`
      SELECT
        ccn, provider_name, city, state, county,
        classification, overall_score, estimated_adc,
        con_state, ownership_type_cms, pe_backed,
        address_line_1, zip_code, phone_number,
        latitude, longitude,
        cms_cahps_star, total_revenue, net_income
      FROM hospice_providers
      WHERE 1=1
    `;

    if (state) {
      baseQuery = sql`${baseQuery} AND state = ${state.toUpperCase()}`;
    }
    if (classification) {
      baseQuery = sql`${baseQuery} AND classification = ${classification.toUpperCase()}`;
    }
    if (minScore) {
      baseQuery = sql`${baseQuery} AND overall_score >= ${parseFloat(minScore)}`;
    }
    if (maxAdc) {
      baseQuery = sql`${baseQuery} AND estimated_adc <= ${parseFloat(maxAdc)}`;
    }
    if (conOnly === 'true') {
      baseQuery = sql`${baseQuery} AND con_state = true`;
    }

    baseQuery = sql`${baseQuery}
      ORDER BY overall_score DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const providers = await baseQuery;

    // Get total count for pagination
    const countQuery = await sql`SELECT COUNT(*) as total FROM hospice_providers`;

    return NextResponse.json({
      success: true,
      data: providers,
      pagination: {
        limit,
        offset,
        total: Number(countQuery[0].total),
        hasMore: offset + providers.length < Number(countQuery[0].total),
      },
    });
  } catch (error) {
    console.error('API v1 providers error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
