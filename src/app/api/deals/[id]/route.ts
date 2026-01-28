import { NextRequest, NextResponse } from 'next/server';
import { getDealById, updateDeal, deleteDeal } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deal = await getDealById(parseInt(id));
    if (!deal) {
      return NextResponse.json({ success: false, error: 'Deal not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    console.error('Error fetching deal:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch deal' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const deal = await updateDeal(parseInt(id), body);
    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    console.error('Error updating deal:', error);
    return NextResponse.json({ success: false, error: 'Failed to update deal' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteDeal(parseInt(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting deal:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete deal' }, { status: 500 });
  }
}
