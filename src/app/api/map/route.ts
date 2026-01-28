import { NextRequest, NextResponse } from 'next/server';
import { getGeocodedProviders, getCountyHeatmapData, sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classification = searchParams.get('classification') || undefined;
    const state = searchParams.get('state') || undefined;
    const includeHeatmap = searchParams.get('heatmap') === 'true';

    let providers;

    if (state) {
      // Fetch providers for a specific state with geocodes
      const stateUpper = state.toUpperCase();
      const result = await sql.query(`
        SELECT
          ccn, provider_name, city, state, county,
          classification, overall_score, estimated_adc,
          latitude, longitude,
          county_pop_65_plus, county_pct_65_plus
        FROM hospice_providers
        WHERE state = $1
          AND latitude IS NOT NULL
          AND longitude IS NOT NULL
          AND classification IN ('GREEN', 'YELLOW')
        ORDER BY overall_score DESC NULLS LAST
      `, [stateUpper]);
      providers = result;
    } else {
      providers = await getGeocodedProviders(classification);
    }

    let heatmapData = null;
    if (includeHeatmap) {
      heatmapData = await getCountyHeatmapData();
    }

    return NextResponse.json({
      providers,
      heatmapData,
      count: providers.length
    });
  } catch (error) {
    console.error('Map API error:', error);
    return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 });
  }
}
