import { NextRequest, NextResponse } from 'next/server';
import { getContacts, createContact, getContactsWithFollowUps } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ccn = searchParams.get('ccn') || undefined;
    const followUps = searchParams.get('followups');

    if (followUps === 'true') {
      const contacts = await getContactsWithFollowUps();
      return NextResponse.json({ success: true, data: contacts });
    }

    const contacts = await getContacts(ccn);
    return NextResponse.json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch contacts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.ccn || !body.contact_name) {
      return NextResponse.json({ success: false, error: 'CCN and contact_name are required' }, { status: 400 });
    }
    const contact = await createContact(body);
    return NextResponse.json({ success: true, data: contact });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json({ success: false, error: 'Failed to create contact' }, { status: 500 });
  }
}
