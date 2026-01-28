import { NextRequest, NextResponse } from 'next/server';
import { getProviderFinancials, getComparableTransactions, getIndustryMultiples } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ccn = searchParams.get('ccn');
    const type = searchParams.get('type') || 'full';

    if (type === 'multiples') {
      const multiples = await getIndustryMultiples();
      return NextResponse.json({ success: true, data: multiples });
    }

    if (type === 'comparables') {
      const state = searchParams.get('state') || undefined;
      const adcMin = searchParams.get('adcMin') ? parseFloat(searchParams.get('adcMin')!) : undefined;
      const adcMax = searchParams.get('adcMax') ? parseFloat(searchParams.get('adcMax')!) : undefined;
      const comparables = await getComparableTransactions(state, adcMin, adcMax);
      return NextResponse.json({ success: true, data: comparables });
    }

    if (!ccn) {
      return NextResponse.json({ success: false, error: 'CCN is required' }, { status: 400 });
    }

    const financials = await getProviderFinancials(ccn);
    if (!financials) {
      return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
    }

    const multiples = await getIndustryMultiples();

    // Calculate valuations
    const revenue = financials.total_revenue || financials.nonprofit_revenue || 0;
    const adc = financials.estimated_adc || 0;

    const valuations = {
      provider: financials,
      multiples,
      calculated: {
        revenue_based: {
          low: revenue * multiples.revenue_multiple.low,
          median: revenue * multiples.revenue_multiple.median,
          high: revenue * multiples.revenue_multiple.high,
        },
        adc_based: {
          low: adc * multiples.per_adc_value.low,
          median: adc * multiples.per_adc_value.median,
          high: adc * multiples.per_adc_value.high,
        },
      },
    };

    return NextResponse.json({ success: true, data: valuations });
  } catch (error) {
    console.error('Error calculating valuation:', error);
    return NextResponse.json({ success: false, error: 'Failed to calculate valuation' }, { status: 500 });
  }
}
