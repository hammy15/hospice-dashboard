import { NextRequest, NextResponse } from 'next/server';
import { getGeocodedProviders, getCountyHeatmapData } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classification = searchParams.get('classification') || undefined;
    const includeHeatmap = searchParams.get('heatmap') === 'true';

    const providers = await getGeocodedProviders(classification);

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
