import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const classification = searchParams.get('classification');
  const state = searchParams.get('state');
  const conStateOnly = searchParams.get('conStateOnly') === 'true';
  const minAdc = searchParams.get('minAdc');
  const maxAdc = searchParams.get('maxAdc');
  const search = searchParams.get('search');
  const format = searchParams.get('format') || 'csv';

  // Build dynamic query based on filters
  let query = `
    SELECT
      ccn,
      provider_name,
      city,
      state,
      county,
      classification,
      overall_score,
      quality_score,
      compliance_score,
      operational_score,
      market_score,
      estimated_adc,
      adc_fit,
      ownership_type_cms,
      con_state,
      pe_backed,
      chain_affiliated,
      ownership_complexity,
      outreach_readiness,
      platform_vs_tuckin,
      confidence_level,
      phone_number,
      website,
      address_line_1,
      city || ', ' || state || ' ' || COALESCE(zip_code, '') as full_address
    FROM hospice_providers
    WHERE 1=1
  `;

  const params: any[] = [];
  let paramIndex = 1;

  if (classification) {
    query += ` AND classification = $${paramIndex}`;
    params.push(classification);
    paramIndex++;
  }

  if (state) {
    query += ` AND state = $${paramIndex}`;
    params.push(state);
    paramIndex++;
  }

  if (conStateOnly) {
    query += ` AND con_state = true`;
  }

  if (minAdc) {
    query += ` AND estimated_adc >= $${paramIndex}`;
    params.push(Number(minAdc));
    paramIndex++;
  }

  if (maxAdc) {
    query += ` AND estimated_adc <= $${paramIndex}`;
    params.push(Number(maxAdc));
    paramIndex++;
  }

  if (search) {
    query += ` AND (provider_name ILIKE $${paramIndex} OR city ILIKE $${paramIndex} OR ownership_type_cms ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += ` ORDER BY overall_score DESC NULLS LAST`;

  try {
    const results = await sql.query(query, params);

    if (format === 'csv') {
      // Generate CSV
      const headers = [
        'CCN',
        'Provider Name',
        'City',
        'State',
        'County',
        'Classification',
        'Overall Score',
        'Quality Score',
        'Compliance Score',
        'Operational Score',
        'Market Score',
        'Estimated ADC',
        'ADC Fit',
        'Ownership Type',
        'CON State',
        'PE Backed',
        'Chain Affiliated',
        'Ownership Complexity',
        'Outreach Readiness',
        'Deal Type',
        'Confidence Level',
        'Phone',
        'Website',
        'Address'
      ];

      const csvRows = [headers.join(',')];

      for (const row of results) {
        const values = [
          row.ccn,
          `"${(row.provider_name || '').replace(/"/g, '""')}"`,
          `"${(row.city || '').replace(/"/g, '""')}"`,
          row.state,
          `"${(row.county || '').replace(/"/g, '""')}"`,
          row.classification,
          row.overall_score,
          row.quality_score,
          row.compliance_score,
          row.operational_score,
          row.market_score,
          row.estimated_adc,
          row.adc_fit,
          `"${(row.ownership_type_cms || '').replace(/"/g, '""')}"`,
          row.con_state ? 'Yes' : 'No',
          row.pe_backed ? 'Yes' : 'No',
          row.chain_affiliated ? 'Yes' : 'No',
          row.ownership_complexity,
          row.outreach_readiness,
          row.platform_vs_tuckin,
          row.confidence_level,
          row.phone_number || '',
          row.website || '',
          `"${(row.full_address || '').replace(/"/g, '""')}"`
        ];
        csvRows.push(values.join(','));
      }

      const csv = csvRows.join('\n');

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="hospice-targets-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Return JSON if format is not CSV
    return NextResponse.json({ data: results, count: results.length });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
