import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: NextRequest) {
  const sql = neon(process.env.DATABASE_URL!);
  const searchParams = request.nextUrl.searchParams;

  const classification = searchParams.get('classification');
  const state = searchParams.get('state');
  const minAdc = searchParams.get('minAdc');
  const maxAdc = searchParams.get('maxAdc');
  const conStateOnly = searchParams.get('conStateOnly') === 'true';
  const search = searchParams.get('search');
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    // Use tagged template literals which neon requires
    // First get total count with basic filters
    let totalResult;
    let providersResult;

    if (!classification && !state && !minAdc && !maxAdc && !conStateOnly && !search) {
      // No filters - simple query
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        ORDER BY
          CASE classification
            WHEN 'GREEN' THEN 1
            WHEN 'YELLOW' THEN 2
            ELSE 3
          END,
          overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (classification && !state && !minAdc && !maxAdc && !conStateOnly && !search) {
      // Only classification filter
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers WHERE classification = ${classification}`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        WHERE classification = ${classification}
        ORDER BY overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (state && !classification && !minAdc && !maxAdc && !conStateOnly && !search) {
      // Only state filter
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers WHERE state = ${state}`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        WHERE state = ${state}
        ORDER BY
          CASE classification
            WHEN 'GREEN' THEN 1
            WHEN 'YELLOW' THEN 2
            ELSE 3
          END,
          overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (conStateOnly && !classification && !state && !minAdc && !maxAdc && !search) {
      // Only CON state filter
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers WHERE con_state = true`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        WHERE con_state = true
        ORDER BY
          CASE classification
            WHEN 'GREEN' THEN 1
            WHEN 'YELLOW' THEN 2
            ELSE 3
          END,
          overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (classification && state) {
      // Classification + state
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers WHERE classification = ${classification} AND state = ${state}`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        WHERE classification = ${classification} AND state = ${state}
        ORDER BY overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (classification && conStateOnly) {
      // Classification + CON
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers WHERE classification = ${classification} AND con_state = true`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        WHERE classification = ${classification} AND con_state = true
        ORDER BY overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (search) {
      // Search query
      const searchPattern = `%${search}%`;
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers WHERE provider_name ILIKE ${searchPattern} OR city ILIKE ${searchPattern}`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        WHERE provider_name ILIKE ${searchPattern} OR city ILIKE ${searchPattern}
        ORDER BY
          CASE classification
            WHEN 'GREEN' THEN 1
            WHEN 'YELLOW' THEN 2
            ELSE 3
          END,
          overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      // Fallback - return all with limit
      totalResult = await sql`SELECT COUNT(*) as total FROM hospice_providers`;
      providersResult = await sql`
        SELECT * FROM hospice_providers
        ORDER BY
          CASE classification
            WHEN 'GREEN' THEN 1
            WHEN 'YELLOW' THEN 2
            ELSE 3
          END,
          overall_score DESC NULLS LAST
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    const total = parseInt(totalResult[0].total);

    return NextResponse.json({ providers: providersResult, total });
  } catch (error) {
    console.error('Error fetching providers:', error);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}
