import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

// GET - Fetch all watchlist items with provider details
export async function GET() {
  try {
    const result = await sql`
      SELECT
        w.id,
        w.ccn,
        w.added_at,
        w.notes,
        w.priority,
        p.provider_name,
        p.city,
        p.state,
        p.classification,
        p.overall_score,
        p.estimated_adc,
        p.con_state,
        p.phone_number
      FROM watchlist w
      JOIN hospice_providers p ON w.ccn = p.ccn
      ORDER BY
        CASE w.priority
          WHEN 'high' THEN 1
          WHEN 'medium' THEN 2
          WHEN 'low' THEN 3
        END,
        w.added_at DESC
    `;
    return NextResponse.json({ watchlist: result });
  } catch (error) {
    console.error('Watchlist fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch watchlist' }, { status: 500 });
  }
}

// POST - Add item to watchlist
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ccn, notes, priority = 'medium' } = body;

    if (!ccn) {
      return NextResponse.json({ error: 'CCN is required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO watchlist (ccn, notes, priority)
      VALUES (${ccn}, ${notes || null}, ${priority})
      ON CONFLICT (ccn) DO UPDATE SET
        notes = COALESCE(EXCLUDED.notes, watchlist.notes),
        priority = EXCLUDED.priority
      RETURNING *
    `;

    return NextResponse.json({ item: result[0] });
  } catch (error) {
    console.error('Watchlist add error:', error);
    return NextResponse.json({ error: 'Failed to add to watchlist' }, { status: 500 });
  }
}

// DELETE - Remove item from watchlist
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ccn = searchParams.get('ccn');

    if (!ccn) {
      return NextResponse.json({ error: 'CCN is required' }, { status: 400 });
    }

    await sql`DELETE FROM watchlist WHERE ccn = ${ccn}`;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Watchlist delete error:', error);
    return NextResponse.json({ error: 'Failed to remove from watchlist' }, { status: 500 });
  }
}

// PATCH - Update watchlist item
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { ccn, notes, priority } = body;

    if (!ccn) {
      return NextResponse.json({ error: 'CCN is required' }, { status: 400 });
    }

    const result = await sql`
      UPDATE watchlist
      SET
        notes = COALESCE(${notes}, notes),
        priority = COALESCE(${priority}, priority)
      WHERE ccn = ${ccn}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ item: result[0] });
  } catch (error) {
    console.error('Watchlist update error:', error);
    return NextResponse.json({ error: 'Failed to update watchlist' }, { status: 500 });
  }
}
