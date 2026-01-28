import { neon } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';

const sql = neon(process.env.DATABASE_URL!);

const DATA_DIR = path.join(process.cwd(), 'data', 'cost-reports');

interface Report {
  ccn: string;
  rptRecNum: string;
  fyBegin: string;
  fyEnd: string;
  year: number;
}

async function addColumns() {
  console.log('📊 Adding financial columns to database...');
  await sql`
    ALTER TABLE hospice_providers
    ADD COLUMN IF NOT EXISTS cost_report_year INTEGER,
    ADD COLUMN IF NOT EXISTS total_revenue DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS total_expenses DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS net_income DECIMAL(15, 2),
    ADD COLUMN IF NOT EXISTS total_patient_days INTEGER,
    ADD COLUMN IF NOT EXISTS medicare_patient_pct DECIMAL(5, 2),
    ADD COLUMN IF NOT EXISTS cost_per_day DECIMAL(10, 2)
  `;
  console.log('✅ Columns ready\n');
}

async function parseAllRptFiles(): Promise<Map<string, Report>> {
  const reports = new Map<string, Report>();

  const files = fs.readdirSync(DATA_DIR).filter(f => f.includes('_rpt.csv')).sort().reverse();
  console.log(`📄 Found ${files.length} RPT files, parsing most recent first...`);

  for (const file of files) {
    const year = parseInt(file.match(/\d{4}/)?.[0] || '0');
    console.log(`   Processing ${file}...`);

    const content = fs.readFileSync(path.join(DATA_DIR, file), 'utf-8');
    const lines = content.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
      if (cols.length >= 7) {
        const rptRecNum = cols[0];
        const ccn = cols[2];
        const fyBegin = cols[5];
        const fyEnd = cols[6];

        if (ccn && ccn.length === 6 && !reports.has(ccn)) {
          reports.set(ccn, { ccn, rptRecNum, fyBegin, fyEnd, year });
        }
      }
    }
  }

  console.log(`   Found ${reports.size} unique providers with cost reports\n`);
  return reports;
}

async function parseNmrcForReports(reports: Map<string, Report>): Promise<Map<string, Map<string, number>>> {
  const numericData = new Map<string, Map<string, number>>();

  const reportsByYear = new Map<number, Map<string, string>>();

  for (const [ccn, report] of reports) {
    if (!reportsByYear.has(report.year)) {
      reportsByYear.set(report.year, new Map());
    }
    reportsByYear.get(report.year)!.set(report.rptRecNum, ccn);
  }

  // Key worksheets for hospice financials (Form CMS-1984-14):
  // A000000 = Reclassification and Adjustment of Trial Balance of Expenses
  // C000000 = Calculation of Total Hospice Costs
  // F200000 = Final Settlement
  // S100000 = Statistical Data
  // S300001 = Patient Statistics
  const relevantWorksheets = ['A000000', 'C000000', 'F200000', 'S100000', 'S300001'];

  for (const [year, rptMap] of reportsByYear) {
    const nmrcFile = `HOSPC14_${year}_nmrc.csv`;
    const filePath = path.join(DATA_DIR, nmrcFile);

    if (!fs.existsSync(filePath)) continue;

    console.log(`📊 Parsing ${nmrcFile} for ${rptMap.size} reports...`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    let matched = 0;

    for (const line of lines) {
      if (!line.trim()) continue;
      const cols = line.split(',').map(c => c.replace(/"/g, '').trim());
      if (cols.length >= 5) {
        const rptRecNum = cols[0];

        if (!rptMap.has(rptRecNum)) continue;

        const ccn = rptMap.get(rptRecNum)!;
        const wksht = cols[1];
        const lineNum = cols[2]; // Keep as string to preserve leading zeros
        const colNum = cols[3];
        const value = parseFloat(cols[4]) || 0;

        if (relevantWorksheets.includes(wksht)) {
          const key = `${wksht}_${lineNum}_${colNum}`;

          if (!numericData.has(ccn)) {
            numericData.set(ccn, new Map());
          }
          numericData.get(ccn)!.set(key, value);
          matched++;
        }
      }
    }
    console.log(`   Extracted ${matched.toLocaleString()} relevant data points`);
  }

  console.log(`\n   Loaded numeric data for ${numericData.size} providers\n`);
  return numericData;
}

async function main() {
  console.log('💰 Starting CMS Cost Report enrichment...\n');

  await addColumns();

  if (!fs.existsSync(DATA_DIR)) {
    console.log('❌ Cost report data not found.');
    return;
  }

  const reports = await parseAllRptFiles();
  const numericData = await parseNmrcForReports(reports);

  const providers = await sql`
    SELECT ccn FROM hospice_providers WHERE classification IN ('GREEN', 'YELLOW')
  `;

  console.log(`🔄 Matching ${providers.length} providers with cost reports...\n`);

  let matched = 0;
  let updated = 0;
  let withRevenue = 0;

  for (const provider of providers) {
    const ccn = provider.ccn;
    const report = reports.get(ccn);
    const data = numericData.get(ccn);

    if (report && data) {
      matched++;

      // HCRIS Form CMS-1984-14 field mappings:
      // Worksheet A, Line 100.00, Col 7 = Total Allowable Costs (A000000_10000_00700)
      // Worksheet C, Line 21.00, Col 3 = Total Hospice Costs (C000000_02100_00300)
      // Worksheet F, Line 27.00, Col 2 = Total Reimbursement (F200000_02700_00200)
      // Worksheet F, Line 41.00, Col 2 = Balance Due/Owed (F200000_04100_00200)

      // Get total costs from multiple possible locations
      let totalExpenses =
        data.get('A000000_10000_00700') ?? // Worksheet A total
        data.get('C000000_02100_00300') ?? // Worksheet C total
        data.get('A000000_10000_00500') ??
        null;

      // Get revenue/reimbursement
      let totalRevenue =
        data.get('F200000_02700_00200') ?? // Total Reimbursement
        data.get('F200000_04100_00200') ?? // Balance due
        data.get('F200000_02600_00100') ?? // Total payment
        totalExpenses; // Use costs as proxy if no revenue

      // Net income
      const netIncome = totalRevenue && totalExpenses ? totalRevenue - totalExpenses : null;

      // Patient days from S-3 (S300001)
      const totalPatientDays =
        data.get('S300001_00100_00600') ??
        data.get('S300001_00100_00100') ??
        data.get('S100000_03100_00100') ?? // Unduplicated census from S-1
        null;

      // Cost per day
      const costPerDay = totalExpenses && totalPatientDays && totalPatientDays > 0
        ? totalExpenses / totalPatientDays
        : null;

      if (totalRevenue && totalRevenue > 1000) withRevenue++;

      try {
        await sql`
          UPDATE hospice_providers
          SET
            cost_report_year = ${report.year},
            total_revenue = ${totalRevenue},
            total_expenses = ${totalExpenses},
            net_income = ${netIncome},
            total_patient_days = ${totalPatientDays ? Math.round(totalPatientDays) : null},
            cost_per_day = ${costPerDay}
          WHERE ccn = ${ccn}
        `;
        updated++;

        if (updated % 200 === 0) {
          console.log(`   Updated ${updated} records (${withRevenue} with revenue)...`);
        }
      } catch (error) {
        console.error(`Error updating ${ccn}:`, error);
      }
    }
  }

  console.log(`\n✅ Cost report enrichment complete!`);
  console.log(`   Matched: ${matched} providers`);
  console.log(`   Updated: ${updated} providers`);
  console.log(`   With revenue data: ${withRevenue} providers`);

  const sample = await sql`
    SELECT ccn, provider_name, cost_report_year, total_revenue, total_expenses, net_income
    FROM hospice_providers
    WHERE total_revenue IS NOT NULL AND total_revenue > 1000
    ORDER BY total_revenue DESC
    LIMIT 5
  `;

  if (sample.length > 0) {
    console.log('\n📋 Top 5 by revenue:');
    for (const row of sample) {
      console.log(`   ${row.provider_name}: $${(Number(row.total_revenue) / 1000000).toFixed(1)}M revenue (${row.cost_report_year})`);
    }
  }

  // Stats
  const stats = await sql`
    SELECT
      COUNT(*) FILTER (WHERE total_revenue IS NOT NULL AND total_revenue > 1000) as with_revenue,
      ROUND(AVG(total_revenue) FILTER (WHERE total_revenue > 1000)) as avg_revenue,
      ROUND(AVG(total_expenses) FILTER (WHERE total_expenses > 1000)) as avg_expenses
    FROM hospice_providers
    WHERE classification IN ('GREEN', 'YELLOW')
  `;

  console.log(`\n📊 Financial Stats:`);
  console.log(`   Providers with revenue: ${stats[0].with_revenue}`);
  console.log(`   Average revenue: $${(Number(stats[0].avg_revenue) / 1000000).toFixed(2)}M`);
  console.log(`   Average expenses: $${(Number(stats[0].avg_expenses) / 1000000).toFixed(2)}M`);
}

main().catch(console.error);
