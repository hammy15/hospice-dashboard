import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const year = searchParams.get('year');
  const buyerType = searchParams.get('buyerType');

  try {
    let query = sql`
      SELECT
        mt.*,
        hp.classification,
        hp.overall_score,
        hp.estimated_adc,
        hp.city,
        hp.state as provider_state
      FROM ma_transactions mt
      LEFT JOIN hospice_providers hp ON hp.ccn = mt.ccn
      WHERE 1=1
    `;

    if (state) {
      query = sql`${query} AND (hp.state = ${state.toUpperCase()} OR mt.ccn IS NULL)`;
    }

    if (year) {
      query = sql`${query} AND EXTRACT(YEAR FROM mt.transaction_date) = ${parseInt(year)}`;
    }

    if (buyerType) {
      query = sql`${query} AND mt.buyer_type = ${buyerType}`;
    }

    query = sql`${query} ORDER BY mt.transaction_date DESC LIMIT 100`;

    const transactions = await query;

    // Get summary stats
    const summary = await sql`
      SELECT
        COUNT(*) as total_transactions,
        SUM(estimated_value) as total_value,
        ROUND(AVG(estimated_value)::numeric, 0) as avg_value,
        COUNT(DISTINCT buyer_name) as unique_buyers,
        COUNT(*) FILTER (WHERE buyer_type = 'PE') as pe_deals,
        COUNT(*) FILTER (WHERE buyer_type = 'Strategic') as strategic_deals,
        COUNT(*) FILTER (WHERE EXTRACT(YEAR FROM transaction_date) = EXTRACT(YEAR FROM NOW())) as ytd_deals
      FROM ma_transactions
    `;

    // Get by year breakdown
    const byYear = await sql`
      SELECT
        EXTRACT(YEAR FROM transaction_date) as year,
        COUNT(*) as deals,
        SUM(estimated_value) as total_value,
        ROUND(AVG(estimated_value)::numeric, 0) as avg_value
      FROM ma_transactions
      WHERE transaction_date IS NOT NULL
      GROUP BY EXTRACT(YEAR FROM transaction_date)
      ORDER BY year DESC
      LIMIT 10
    `;

    // Top buyers
    const topBuyers = await sql`
      SELECT
        buyer_name,
        buyer_type,
        COUNT(*) as deal_count,
        SUM(estimated_value) as total_spent,
        MAX(transaction_date) as last_deal
      FROM ma_transactions
      WHERE buyer_name IS NOT NULL
      GROUP BY buyer_name, buyer_type
      ORDER BY deal_count DESC
      LIMIT 15
    `;

    return NextResponse.json({
      transactions,
      summary: summary[0],
      byYear,
      topBuyers,
    });
  } catch (error) {
    console.error('Transactions API error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// Add transaction
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ccn,
      provider_name,
      buyer_name,
      buyer_type,
      transaction_date,
      estimated_value,
      deal_type,
      source,
      notes,
    } = body;

    await sql`
      INSERT INTO ma_transactions (
        ccn, provider_name, buyer_name, buyer_type,
        transaction_date, estimated_value, deal_type, source, notes
      ) VALUES (
        ${ccn || null}, ${provider_name}, ${buyer_name}, ${buyer_type || null},
        ${transaction_date || null}, ${estimated_value || null},
        ${deal_type || null}, ${source || null}, ${notes || null}
      )
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Add transaction error:', error);
    return NextResponse.json({ error: 'Failed to add transaction' }, { status: 500 });
  }
}
