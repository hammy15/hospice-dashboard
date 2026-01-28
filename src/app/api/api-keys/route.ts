import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest, generateApiKey } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get user's API keys (without the actual key values)
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const keys = await sql`
      SELECT
        id, name, permissions, rate_limit, requests_today,
        created_at, last_used, active
      FROM api_keys
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
    `;

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('API keys fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch API keys' }, { status: 500 });
  }
}

// Create new API key
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Key name required' }, { status: 400 });
    }

    // Limit to 5 keys per user
    const countResult = await sql`
      SELECT COUNT(*) as count FROM api_keys WHERE user_id = ${user.id} AND active = true
    `;

    if (Number(countResult[0].count) >= 5) {
      return NextResponse.json({ error: 'Maximum of 5 active API keys allowed' }, { status: 400 });
    }

    const key = await generateApiKey(user.id, name);

    if (!key) {
      return NextResponse.json({ error: 'Failed to generate API key' }, { status: 500 });
    }

    // Return the key only once - user must save it
    return NextResponse.json({
      success: true,
      key, // Show only on creation!
      message: 'Save this key now - it will not be shown again',
    });
  } catch (error) {
    console.error('Create API key error:', error);
    return NextResponse.json({ error: 'Failed to create API key' }, { status: 500 });
  }
}

// Revoke API key
export async function DELETE(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyId = searchParams.get('id');

  if (!keyId) {
    return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
  }

  try {
    await sql`
      UPDATE api_keys SET active = false
      WHERE id = ${keyId} AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Revoke API key error:', error);
    return NextResponse.json({ error: 'Failed to revoke API key' }, { status: 500 });
  }
}
