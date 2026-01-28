import { NextRequest, NextResponse } from 'next/server';
import { getDeals, createDeal, getDealPipelineSummary } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') || undefined;
    const status = searchParams.get('status') || undefined;
    const summary = searchParams.get('summary');

    if (summary === 'true') {
      const pipelineSummary = await getDealPipelineSummary();
      return NextResponse.json({ success: true, data: pipelineSummary });
    }

    const deals = await getDeals({ stage, status });
    return NextResponse.json({ success: true, data: deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch deals' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const deal = await createDeal(body);
    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    console.error('Error creating deal:', error);
    return NextResponse.json({ success: false, error: 'Failed to create deal' }, { status: 500 });
  }
}
