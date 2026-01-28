import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const ccn = searchParams.get('ccn');
  const ccns = searchParams.get('ccns'); // For bulk reports

  try {
    if (ccn) {
      // Single provider report
      const provider = await sql.query(`
        SELECT 
          ccn, provider_name, city, state, county, address_line_1, zip_code,
          phone_number, website, administrator_name,
          classification, overall_score, quality_score, compliance_score,
          operational_score, market_score, confidence_level,
          estimated_adc, adc_fit, competitive_density, outreach_readiness,
          platform_vs_tuckin,
          total_revenue, total_expenses, net_income,
          ownership_type_cms, pe_backed, chain_affiliated, owner_count,
          ownership_complexity,
          con_state, county_pop_65_plus, county_pct_65_plus, county_median_income,
          cms_quality_star, cms_cahps_star,
          latitude, longitude
        FROM hospice_providers
        WHERE ccn = $1
      `, [ccn]);

      if (provider.length === 0) {
        return NextResponse.json({ success: false, error: 'Provider not found' }, { status: 404 });
      }

      // Get competitors in same county
      const competitors = await sql.query(`
        SELECT ccn, provider_name, classification, estimated_adc
        FROM hospice_providers
        WHERE county = $1 AND state = $2 AND ccn != $3
        ORDER BY overall_score DESC
        LIMIT 5
      `, [provider[0].county, provider[0].state, ccn]);

      // Get outreach history
      const outreach = await sql.query(`
        SELECT outreach_type, sent_at as outreach_date, notes, outcome
        FROM outreach_history
        WHERE ccn = $1
        ORDER BY sent_at DESC
        LIMIT 10
      `, [ccn]);

      return NextResponse.json({
        success: true,
        data: {
          provider: provider[0],
          competitors,
          outreach,
          generatedAt: new Date().toISOString(),
        }
      });
    }

    if (ccns) {
      // Bulk report - summary of multiple providers
      const ccnList = ccns.split(',').map(c => c.trim()).filter(Boolean);

      if (ccnList.length === 0) {
        return NextResponse.json({ success: false, error: 'No CCNs provided' }, { status: 400 });
      }

      const placeholders = ccnList.map((_, i) => '$' + (i + 1)).join(',');
      const providers = await sql.query(`
        SELECT 
          ccn, provider_name, city, state, county,
          classification, overall_score, quality_score, compliance_score,
          estimated_adc, total_revenue, net_income,
          pe_backed, chain_affiliated, phone_number
        FROM hospice_providers
        WHERE ccn IN (${placeholders})
        ORDER BY overall_score DESC
      `, ccnList);

      return NextResponse.json({
        success: true,
        data: {
          providers,
          count: providers.length,
          generatedAt: new Date().toISOString(),
        }
      });
    }

    // Return report templates/options
    return NextResponse.json({
      success: true,
      data: {
        templates: [
          { id: 'single', name: 'Single Provider Report', description: 'Detailed report for one provider' },
          { id: 'comparison', name: 'Provider Comparison', description: 'Side-by-side comparison of 2-5 providers' },
          { id: 'market', name: 'Market Overview', description: 'Market analysis for a state or region' },
        ]
      }
    });

  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to generate report data' }, { status: 500 });
  }
}
