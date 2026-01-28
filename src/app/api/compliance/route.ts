import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'summary';
  const state = searchParams.get('state');

  try {
    if (type === 'summary') {
      // National compliance summary
      const summary = await sql.query(`
        SELECT 
          COUNT(*) as total_providers,
          COUNT(compliance_score) as scored_providers,
          ROUND(AVG(compliance_score), 1) as avg_compliance_score,
          ROUND(AVG(quality_score), 1) as avg_quality_score,
          COUNT(CASE WHEN compliance_score >= 70 THEN 1 END) as high_compliance,
          COUNT(CASE WHEN compliance_score >= 50 AND compliance_score < 70 THEN 1 END) as medium_compliance,
          COUNT(CASE WHEN compliance_score < 50 AND compliance_score IS NOT NULL THEN 1 END) as low_compliance,
          COUNT(CASE WHEN classification = 'GREEN' THEN 1 END) as green_count,
          COUNT(CASE WHEN classification = 'YELLOW' THEN 1 END) as yellow_count,
          COUNT(CASE WHEN classification = 'RED' THEN 1 END) as red_count
        FROM hospice_providers
      `);

      return NextResponse.json({
        success: true,
        data: summary[0]
      });
    }

    if (type === 'by-state') {
      // Compliance by state
      const byState = await sql.query(`
        SELECT 
          state,
          COUNT(*) as provider_count,
          ROUND(AVG(compliance_score), 1) as avg_compliance,
          ROUND(AVG(quality_score), 1) as avg_quality,
          COUNT(CASE WHEN compliance_score >= 70 THEN 1 END) as high_compliance,
          COUNT(CASE WHEN compliance_score < 50 AND compliance_score IS NOT NULL THEN 1 END) as low_compliance
        FROM hospice_providers
        WHERE compliance_score IS NOT NULL
        GROUP BY state
        ORDER BY avg_compliance DESC
      `);

      return NextResponse.json({
        success: true,
        data: byState
      });
    }

    if (type === 'at-risk') {
      // At-risk providers (low compliance scores)
      let query = `
        SELECT 
          ccn,
          provider_name,
          city,
          state,
          classification,
          compliance_score,
          quality_score,
          overall_score,
          pe_backed,
          chain_affiliated
        FROM hospice_providers
        WHERE compliance_score IS NOT NULL
          AND compliance_score < 50
      `;

      const params: string[] = [];
      if (state) {
        query += ` AND state = $1`;
        params.push(state);
      }

      query += ` ORDER BY compliance_score ASC LIMIT 100`;

      const atRisk = await sql.query(query, params);

      return NextResponse.json({
        success: true,
        data: atRisk
      });
    }

    if (type === 'high-performers') {
      // High compliance performers
      let query = `
        SELECT 
          ccn,
          provider_name,
          city,
          state,
          classification,
          compliance_score,
          quality_score,
          overall_score,
          estimated_adc,
          pe_backed,
          chain_affiliated
        FROM hospice_providers
        WHERE compliance_score IS NOT NULL
          AND compliance_score >= 80
      `;

      const params: string[] = [];
      if (state) {
        query += ` AND state = $1`;
        params.push(state);
      }

      query += ` ORDER BY compliance_score DESC LIMIT 100`;

      const highPerformers = await sql.query(query, params);

      return NextResponse.json({
        success: true,
        data: highPerformers
      });
    }

    if (type === 'distribution') {
      // Compliance score distribution
      const distribution = await sql.query(`
        SELECT 
          CASE 
            WHEN compliance_score >= 90 THEN '90-100'
            WHEN compliance_score >= 80 THEN '80-89'
            WHEN compliance_score >= 70 THEN '70-79'
            WHEN compliance_score >= 60 THEN '60-69'
            WHEN compliance_score >= 50 THEN '50-59'
            WHEN compliance_score >= 40 THEN '40-49'
            WHEN compliance_score >= 30 THEN '30-39'
            WHEN compliance_score < 30 THEN '0-29'
          END as score_range,
          COUNT(*) as count
        FROM hospice_providers
        WHERE compliance_score IS NOT NULL
        GROUP BY score_range
        ORDER BY score_range DESC
      `);

      return NextResponse.json({
        success: true,
        data: distribution
      });
    }

    if (type === 'trends') {
      // Classification trends by ownership type
      const trends = await sql.query(`
        SELECT 
          ownership_type_cms,
          COUNT(*) as total,
          ROUND(AVG(compliance_score), 1) as avg_compliance,
          COUNT(CASE WHEN classification = 'GREEN' THEN 1 END) as green,
          COUNT(CASE WHEN classification = 'YELLOW' THEN 1 END) as yellow,
          COUNT(CASE WHEN classification = 'RED' THEN 1 END) as red
        FROM hospice_providers
        WHERE ownership_type_cms IS NOT NULL
        GROUP BY ownership_type_cms
        ORDER BY total DESC
        LIMIT 10
      `);

      return NextResponse.json({
        success: true,
        data: trends
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Compliance API error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch compliance data' }, { status: 500 });
  }
}
