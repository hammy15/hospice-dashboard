import { NextRequest, NextResponse } from 'next/server';
import { getProvidersForComparison } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ccnsParam = searchParams.get('ccns');

    if (!ccnsParam) {
      return NextResponse.json({ success: false, error: 'CCNs parameter is required' }, { status: 400 });
    }

    const ccns = ccnsParam.split(',').map(c => c.trim()).filter(Boolean);

    if (ccns.length < 2) {
      return NextResponse.json({ success: false, error: 'At least 2 CCNs are required for comparison' }, { status: 400 });
    }

    if (ccns.length > 5) {
      return NextResponse.json({ success: false, error: 'Maximum 5 providers can be compared' }, { status: 400 });
    }

    const providers = await getProvidersForComparison(ccns);
    return NextResponse.json({ success: true, data: providers });
  } catch (error) {
    console.error('Error comparing providers:', error);
    return NextResponse.json({ success: false, error: 'Failed to compare providers' }, { status: 500 });
  }
}
