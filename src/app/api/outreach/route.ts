import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// Get outreach templates and history
export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  const { searchParams } = new URL(request.url);
  const ccn = searchParams.get('ccn');

  try {
    // Default templates (available to all)
    const defaultTemplates = [
      {
        id: 'default-intro',
        name: 'Initial Introduction',
        subject: 'Partnership Opportunity for {{provider_name}}',
        body: `Dear {{owner_name}},

I hope this message finds you well. My name is {{sender_name}} and I represent {{company_name}}, a healthcare investment firm focused on supporting hospice operators.

We've been impressed by {{provider_name}}'s reputation in the {{city}}, {{state}} market and would welcome the opportunity to discuss how we might support your growth objectives.

Would you have 15 minutes for an introductory call this week?

Best regards,
{{sender_name}}
{{company_name}}`,
        variables: ['provider_name', 'owner_name', 'city', 'state', 'sender_name', 'company_name'],
      },
      {
        id: 'default-follow-up',
        name: 'Follow-Up',
        subject: 'Following up: {{provider_name}}',
        body: `Hi {{owner_name}},

I wanted to follow up on my previous message regarding {{provider_name}}.

I understand you're busy running a successful operation, but I believe a brief conversation could be mutually beneficial.

Our firm has helped similar hospice providers in {{state}} achieve their goals while maintaining their commitment to patient care.

Would a 10-minute call work for you?

Best,
{{sender_name}}`,
        variables: ['provider_name', 'owner_name', 'state', 'sender_name'],
      },
      {
        id: 'default-valuation',
        name: 'Valuation Discussion',
        subject: 'Complimentary Valuation Analysis - {{provider_name}}',
        body: `Dear {{owner_name}},

As you may be aware, the hospice M&A market has seen significant activity recently. Many operators like yourself are curious about their organization's value in today's market.

We'd be happy to provide a complimentary, confidential valuation analysis for {{provider_name}}. This analysis would consider:

• Your ADC and patient volume trends
• Quality metrics and star ratings
• Market demographics in {{county}} County
• Regional comparable transactions

There's no obligation, and the information remains completely confidential.

Interested in learning more?

Best regards,
{{sender_name}}
{{company_name}}`,
        variables: ['provider_name', 'owner_name', 'county', 'sender_name', 'company_name'],
      },
    ];

    let userTemplates: unknown[] = [];
    let outreachHistory: unknown[] = [];

    if (user) {
      userTemplates = await sql`
        SELECT * FROM outreach_templates
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
      `;

      if (ccn) {
        outreachHistory = await sql`
          SELECT oh.*, ot.name as template_name
          FROM outreach_history oh
          LEFT JOIN outreach_templates ot ON ot.id = oh.template_id
          WHERE oh.user_id = ${user.id} AND oh.ccn = ${ccn}
          ORDER BY oh.sent_at DESC
        `;
      } else {
        outreachHistory = await sql`
          SELECT oh.*, ot.name as template_name, hp.provider_name
          FROM outreach_history oh
          LEFT JOIN outreach_templates ot ON ot.id = oh.template_id
          LEFT JOIN hospice_providers hp ON hp.ccn = oh.ccn
          WHERE oh.user_id = ${user.id}
          ORDER BY oh.sent_at DESC
          LIMIT 50
        `;
      }
    }

    return NextResponse.json({
      templates: [...defaultTemplates, ...userTemplates],
      history: outreachHistory,
    });
  } catch (error) {
    console.error('Outreach API error:', error);
    return NextResponse.json({ error: 'Failed to fetch outreach data' }, { status: 500 });
  }
}

// Create custom template
export async function POST(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { name, subject, body, variables } = await request.json();

    const result = await sql`
      INSERT INTO outreach_templates (user_id, name, subject, body, variables)
      VALUES (${user.id}, ${name}, ${subject}, ${body}, ${JSON.stringify(variables || [])})
      RETURNING *
    `;

    return NextResponse.json({ success: true, template: result[0] });
  } catch (error) {
    console.error('Create template error:', error);
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 });
  }
}

// Log outreach
export async function PUT(request: Request) {
  const user = await getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { ccn, template_id, notes } = await request.json();

    await sql`
      INSERT INTO outreach_history (user_id, ccn, template_id, notes)
      VALUES (${user.id}, ${ccn}, ${template_id || null}, ${notes || null})
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Log outreach error:', error);
    return NextResponse.json({ error: 'Failed to log outreach' }, { status: 500 });
  }
}

// Generate personalized message
export async function PATCH(request: Request) {
  try {
    const { ccn, templateId } = await request.json();

    // Get provider data
    const providerResult = await sql`
      SELECT
        hp.*,
        pe.owner_name,
        pe.linkedin_url
      FROM hospice_providers hp
      LEFT JOIN provider_enrichment pe ON pe.ccn = hp.ccn
      WHERE hp.ccn = ${ccn}
    `;

    if (providerResult.length === 0) {
      return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
    }

    const provider = providerResult[0];

    // Get template (would be from templates list in real implementation)
    const templates: Record<string, { subject: string; body: string }> = {
      'default-intro': {
        subject: `Partnership Opportunity for ${provider.provider_name}`,
        body: `Dear ${provider.administrator_name || 'Owner'},

I hope this message finds you well. My name is [Your Name] and I represent [Your Company], a healthcare investment firm focused on supporting hospice operators.

We've been impressed by ${provider.provider_name}'s reputation in the ${provider.city}, ${provider.state} market and would welcome the opportunity to discuss how we might support your growth objectives.

Would you have 15 minutes for an introductory call this week?

Best regards,
[Your Name]
[Your Company]`,
      },
    };

    const template = templates[templateId] || templates['default-intro'];

    return NextResponse.json({
      provider,
      message: {
        subject: template.subject,
        body: template.body,
      },
    });
  } catch (error) {
    console.error('Generate message error:', error);
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}
