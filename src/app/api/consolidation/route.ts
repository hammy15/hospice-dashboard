import { NextRequest, NextResponse } from 'next/server';
import { getMarketConsolidation, getPEPortfolios } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'states';

    if (type === 'portfolios') {
      const portfolios = await getPEPortfolios();
      return NextResponse.json({ success: true, data: portfolios });
    }

    const consolidation = await getMarketConsolidation();
    return NextResponse.json({ success: true, data: consolidation });
  } catch (error) {
    console.error('Error fetching consolidation data:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch consolidation data' }, { status: 500 });
  }
}
