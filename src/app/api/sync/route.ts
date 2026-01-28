import { NextResponse } from 'next/server';
import { Pool } from '@neondatabase/serverless';

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for long-running sync

interface SyncResult {
  source: string;
  status: 'success' | 'error' | 'skipped';
  recordsProcessed?: number;
  message?: string;
}

export async function POST(request: Request) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const body = await request.json().catch(() => ({}));
    const { sources = ['all'] } = body;

    const results: SyncResult[] = [];
    const shouldSync = (source: string) => sources.includes('all') || sources.includes(source);

    // 1. Sync CMS Provider Data (check for new providers)
    if (shouldSync('cms')) {
      try {
        // In production, this would fetch from CMS API
        // For now, we'll update last_sync timestamp and verify data integrity
        const verifyResult = await pool.query(`
          SELECT
            COUNT(*) as total,
            COUNT(*) FILTER (WHERE overall_score IS NULL) as missing_scores,
            COUNT(*) FILTER (WHERE classification IS NULL) as missing_classification
          FROM hospice_providers
        `);

        results.push({
          source: 'CMS Provider Data',
          status: 'success',
          recordsProcessed: Number(verifyResult.rows[0].total),
          message: `Verified ${verifyResult.rows[0].total} providers. ${verifyResult.rows[0].missing_scores} missing scores.`,
        });
      } catch (error) {
        results.push({
          source: 'CMS Provider Data',
          status: 'error',
          message: String(error),
        });
      }
    }

    // 2. Update calculated fields (recalculate scores if needed)
    if (shouldSync('scores')) {
      try {
        // Ensure all providers have classification based on score
        const updateResult = await pool.query(`
          UPDATE hospice_providers
          SET classification = CASE
            WHEN overall_score >= 70 AND estimated_adc <= 60 THEN 'GREEN'
            WHEN overall_score >= 50 THEN 'YELLOW'
            ELSE 'RED'
          END
          WHERE classification IS NULL OR classification = ''
          RETURNING ccn
        `);

        results.push({
          source: 'Score Recalculation',
          status: 'success',
          recordsProcessed: updateResult.rowCount || 0,
          message: `Updated ${updateResult.rowCount || 0} provider classifications`,
        });
      } catch (error) {
        results.push({
          source: 'Score Recalculation',
          status: 'error',
          message: String(error),
        });
      }
    }

    // 3. Geocoding check (identify providers needing geocoding)
    if (shouldSync('geocoding')) {
      try {
        const missingGeoResult = await pool.query(`
          SELECT COUNT(*) as count
          FROM hospice_providers
          WHERE (latitude IS NULL OR longitude IS NULL)
            AND address_line_1 IS NOT NULL
        `);

        const needsGeocoding = Number(missingGeoResult.rows[0].count);

        results.push({
          source: 'Geocoding',
          status: 'success',
          recordsProcessed: needsGeocoding,
          message: needsGeocoding > 0
            ? `${needsGeocoding} providers need geocoding`
            : 'All providers with addresses are geocoded',
        });
      } catch (error) {
        results.push({
          source: 'Geocoding',
          status: 'error',
          message: String(error),
        });
      }
    }

    // 4. Demographics data check
    if (shouldSync('demographics')) {
      try {
        const demoResult = await pool.query(`
          SELECT
            COUNT(*) FILTER (WHERE county_pop_65_plus IS NOT NULL) as with_demo,
            COUNT(*) FILTER (WHERE county_pop_65_plus IS NULL) as missing_demo
          FROM hospice_providers
        `);

        results.push({
          source: 'Census Demographics',
          status: 'success',
          recordsProcessed: Number(demoResult.rows[0].with_demo),
          message: `${demoResult.rows[0].with_demo} with demographics, ${demoResult.rows[0].missing_demo} missing`,
        });
      } catch (error) {
        results.push({
          source: 'Census Demographics',
          status: 'error',
          message: String(error),
        });
      }
    }

    // 5. Financial data check (HCRIS)
    if (shouldSync('financials')) {
      try {
        const finResult = await pool.query(`
          SELECT
            COUNT(*) FILTER (WHERE total_revenue IS NOT NULL) as with_financials,
            COUNT(*) FILTER (WHERE total_revenue IS NULL) as missing_financials,
            MAX(cost_report_year) as latest_year
          FROM hospice_providers
        `);

        results.push({
          source: 'HCRIS Financials',
          status: 'success',
          recordsProcessed: Number(finResult.rows[0].with_financials),
          message: `${finResult.rows[0].with_financials} with financials (latest: ${finResult.rows[0].latest_year || 'N/A'})`,
        });
      } catch (error) {
        results.push({
          source: 'HCRIS Financials',
          status: 'error',
          message: String(error),
        });
      }
    }

    // 6. NPI Registry check
    if (shouldSync('npi')) {
      try {
        const npiResult = await pool.query(`
          SELECT
            COUNT(*) FILTER (WHERE npi IS NOT NULL) as with_npi,
            COUNT(*) FILTER (WHERE npi IS NULL) as missing_npi
          FROM hospice_providers
        `);

        results.push({
          source: 'NPI Registry',
          status: 'success',
          recordsProcessed: Number(npiResult.rows[0].with_npi),
          message: `${npiResult.rows[0].with_npi} with NPI, ${npiResult.rows[0].missing_npi} missing`,
        });
      } catch (error) {
        results.push({
          source: 'NPI Registry',
          status: 'error',
          message: String(error),
        });
      }
    }

    // 7. Star Ratings check
    if (shouldSync('starratings')) {
      try {
        const starResult = await pool.query(`
          SELECT
            COUNT(*) FILTER (WHERE cms_cahps_star IS NOT NULL) as with_stars,
            ROUND(AVG(cms_cahps_star)::numeric, 2) as avg_star
          FROM hospice_providers
        `);

        results.push({
          source: 'CMS Star Ratings',
          status: 'success',
          recordsProcessed: Number(starResult.rows[0].with_stars),
          message: `${starResult.rows[0].with_stars} with ratings, avg: ${starResult.rows[0].avg_star || 'N/A'}★`,
        });
      } catch (error) {
        results.push({
          source: 'CMS Star Ratings',
          status: 'error',
          message: String(error),
        });
      }
    }

    // Get summary stats
    const summaryResult = await pool.query(`
      SELECT
        COUNT(*) as total_providers,
        COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
        COUNT(*) FILTER (WHERE classification = 'YELLOW') as yellow_count,
        COUNT(*) FILTER (WHERE classification = 'RED') as red_count
      FROM hospice_providers
    `);

    await pool.end();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      summary: summaryResult.rows[0],
    });
  } catch (error) {
    console.error('Sync error:', error);
    await pool.end();
    return NextResponse.json({
      success: false,
      error: 'Sync failed',
      message: String(error),
    }, { status: 500 });
  }
}

// GET endpoint to check sync status
export async function GET() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const result = await pool.query(`
      SELECT
        COUNT(*) as total_providers,
        COUNT(*) FILTER (WHERE classification = 'GREEN') as green_count,
        COUNT(*) FILTER (WHERE latitude IS NOT NULL) as geocoded,
        COUNT(*) FILTER (WHERE total_revenue IS NOT NULL) as with_financials,
        COUNT(*) FILTER (WHERE npi IS NOT NULL) as with_npi,
        COUNT(*) FILTER (WHERE cms_cahps_star IS NOT NULL) as with_stars,
        COUNT(*) FILTER (WHERE county_pop_65_plus IS NOT NULL) as with_demographics
      FROM hospice_providers
    `);

    await pool.end();

    return NextResponse.json({
      status: 'ready',
      data: result.rows[0],
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    await pool.end();
    return NextResponse.json({ status: 'error', error: String(error) }, { status: 500 });
  }
}
