import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import * as XLSX from 'xlsx';

// All available export fields with metadata
const AVAILABLE_FIELDS: Record<string, { label: string; category: string; column: string }> = {
  // Basic Info
  ccn: { label: 'CCN', category: 'Basic Info', column: 'ccn' },
  provider_name: { label: 'Provider Name', category: 'Basic Info', column: 'provider_name' },
  state: { label: 'State', category: 'Basic Info', column: 'state' },
  city: { label: 'City', category: 'Basic Info', column: 'city' },
  county: { label: 'County', category: 'Basic Info', column: 'county' },
  address: { label: 'Address', category: 'Basic Info', column: 'address_line_1' },
  zip_code: { label: 'ZIP Code', category: 'Basic Info', column: 'zip_code' },
  phone_number: { label: 'Phone', category: 'Basic Info', column: 'phone_number' },
  website: { label: 'Website', category: 'Basic Info', column: 'website' },

  // Classification & Scores
  classification: { label: 'Classification', category: 'Scores', column: 'classification' },
  overall_score: { label: 'Overall Score', category: 'Scores', column: 'overall_score' },
  quality_score: { label: 'Quality Score', category: 'Scores', column: 'quality_score' },
  compliance_score: { label: 'Compliance Score', category: 'Scores', column: 'compliance_score' },
  operational_score: { label: 'Operational Score', category: 'Scores', column: 'operational_score' },
  market_score: { label: 'Market Score', category: 'Scores', column: 'market_score' },
  confidence_level: { label: 'Confidence Level', category: 'Scores', column: 'confidence_level' },

  // Operations
  estimated_adc: { label: 'Estimated ADC', category: 'Operations', column: 'estimated_adc' },
  adc_fit: { label: 'ADC Fit', category: 'Operations', column: 'adc_fit' },
  cms_quality_star: { label: 'CMS Quality Star', category: 'Operations', column: 'cms_quality_star' },
  cms_cahps_star: { label: 'CAHPS Star', category: 'Operations', column: 'cms_cahps_star' },
  competitive_density: { label: 'Competitive Density', category: 'Operations', column: 'competitive_density' },
  outreach_readiness: { label: 'Outreach Readiness', category: 'Operations', column: 'outreach_readiness' },
  platform_vs_tuckin: { label: 'Deal Type', category: 'Operations', column: 'platform_vs_tuckin' },

  // Financials
  total_revenue: { label: 'Total Revenue', category: 'Financials', column: 'total_revenue' },
  total_expenses: { label: 'Total Expenses', category: 'Financials', column: 'total_expenses' },
  net_income: { label: 'Net Income', category: 'Financials', column: 'net_income' },

  // Ownership
  ownership_type_cms: { label: 'Ownership Type', category: 'Ownership', column: 'ownership_type_cms' },
  pe_backed: { label: 'PE Backed', category: 'Ownership', column: 'pe_backed' },
  chain_affiliated: { label: 'Chain Affiliated', category: 'Ownership', column: 'chain_affiliated' },
  owner_count: { label: 'Owner Count', category: 'Ownership', column: 'owner_count' },
  ownership_complexity: { label: 'Ownership Complexity', category: 'Ownership', column: 'ownership_complexity' },

  // Market Demographics
  con_state: { label: 'CON State', category: 'Market', column: 'con_state' },
  county_pop_65_plus: { label: 'County Pop 65+', category: 'Market', column: 'county_pop_65_plus' },
  county_pct_65_plus: { label: '% Pop 65+', category: 'Market', column: 'county_pct_65_plus' },
  county_median_income: { label: 'Median Income', category: 'Market', column: 'county_median_income' },

  // Contact
  administrator_name: { label: 'Administrator', category: 'Contact', column: 'administrator_name' },
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // If requesting field list, return available fields grouped by category
  if (searchParams.get('fields') === 'list') {
    const fieldsByCategory: Record<string, { key: string; label: string }[]> = {};

    Object.entries(AVAILABLE_FIELDS).forEach(([key, { label, category }]) => {
      if (!fieldsByCategory[category]) {
        fieldsByCategory[category] = [];
      }
      fieldsByCategory[category].push({ key, label });
    });

    return NextResponse.json({
      success: true,
      data: fieldsByCategory,
    });
  }

  // Get selected fields (or use defaults)
  const selectedParam = searchParams.get('selected');
  const selectedFields = selectedParam
    ? selectedParam.split(',').filter(f => f in AVAILABLE_FIELDS)
    : ['ccn', 'provider_name', 'city', 'state', 'classification', 'overall_score', 'estimated_adc', 'phone_number'];

  if (selectedFields.length === 0) {
    return NextResponse.json({ success: false, error: 'No valid fields selected' }, { status: 400 });
  }

  // Build SELECT columns
  const columns = selectedFields.map(f => {
    const field = AVAILABLE_FIELDS[f];
    return field.column === f ? field.column : `${field.column} as ${f}`;
  }).join(', ');

  // Get filters
  const classification = searchParams.get('classification');
  const state = searchParams.get('state');
  const conStateOnly = searchParams.get('conStateOnly') === 'true';
  const minAdc = searchParams.get('minAdc');
  const maxAdc = searchParams.get('maxAdc');
  const peOnly = searchParams.get('peOnly') === 'true';
  const independentOnly = searchParams.get('independentOnly') === 'true';
  const search = searchParams.get('search');
  const format = searchParams.get('format') || 'csv';

  // Build dynamic query based on filters
  let query = `SELECT ${columns} FROM hospice_providers WHERE 1=1`;

  const params: (string | number | boolean)[] = [];
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

  if (peOnly) {
    query += ` AND pe_backed = true`;
  }

  if (independentOnly) {
    query += ` AND pe_backed = false AND chain_affiliated = false`;
  }

  if (search) {
    query += ` AND (provider_name ILIKE $${paramIndex} OR city ILIKE $${paramIndex})`;
    params.push(`%${search}%`);
    paramIndex++;
  }

  query += ` ORDER BY overall_score DESC NULLS LAST`;

  try {
    const results = await sql.query(query, params);

    if (format === 'json') {
      return NextResponse.json({
        success: true,
        count: results.length,
        data: results,
      });
    }

    // Format data with readable values
    const headers = selectedFields.map(f => AVAILABLE_FIELDS[f].label);
    const formattedData = results.map((row: Record<string, unknown>) => {
      const formattedRow: Record<string, unknown> = {};
      selectedFields.forEach((field, i) => {
        const value = row[field];
        if (value === null || value === undefined) {
          formattedRow[headers[i]] = '';
        } else if (typeof value === 'boolean') {
          formattedRow[headers[i]] = value ? 'Yes' : 'No';
        } else {
          formattedRow[headers[i]] = value;
        }
      });
      return formattedRow;
    });

    // Generate Excel
    if (format === 'xlsx') {
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Hospice Providers');

      // Auto-size columns
      const colWidths = headers.map((header, i) => {
        const maxLen = Math.max(
          header.length,
          ...formattedData.map(row => String(row[header] || '').length)
        );
        return { wch: Math.min(maxLen + 2, 50) };
      });
      worksheet['!cols'] = colWidths;

      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="hospice-export-${new Date().toISOString().split('T')[0]}.xlsx"`,
        },
      });
    }

    // Generate CSV
    const csvRows = [headers.join(',')];

    for (const row of results) {
      const values = selectedFields.map(field => {
        const value = row[field];
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return String(value);
      });
      csvRows.push(values.join(','));
    }

    const csv = csvRows.join('\n');

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="hospice-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ success: false, error: 'Export failed' }, { status: 500 });
  }
}
