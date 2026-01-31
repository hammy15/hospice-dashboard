'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Printer, Download, Loader2, Search, Plus, X,
  Building2, MapPin, TrendingUp, DollarSign, Users, Shield,
  CheckCircle, Phone, Globe, AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';

interface Provider {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  county: string;
  address_line_1: string;
  zip_code: string;
  phone_number: string | null;
  website: string | null;
  administrator_name: string | null;
  classification: string;
  overall_score: number | null;
  quality_score: number | null;
  compliance_score: number | null;
  operational_score: number | null;
  market_score: number | null;
  confidence_level: string | null;
  estimated_adc: number | null;
  adc_fit: string | null;
  competitive_density: string | null;
  outreach_readiness: string | null;
  platform_vs_tuckin: string | null;
  total_revenue: number | null;
  total_expenses: number | null;
  net_income: number | null;
  ownership_type_cms: string | null;
  pe_backed: boolean;
  chain_affiliated: boolean;
  owner_count: number | null;
  ownership_complexity: string | null;
  portfolio_group: string | null;
  con_state: boolean;
  county_pop_65_plus: number | null;
  county_pct_65_plus: number | null;
  county_median_income: number | null;
}

interface ReportData {
  provider: Provider;
  competitors: { ccn: string; provider_name: string; classification: string; estimated_adc: number }[];
  outreach: { outreach_type: string; outreach_date: string; notes: string; outcome: string }[];
  generatedAt: string;
}

const formatCurrency = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatNumber = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US').format(value);
};

const getClassificationColor = (classification: string) => {
  switch (classification) {
    case 'GREEN': return 'text-emerald-600 bg-emerald-100';
    case 'YELLOW': return 'text-amber-600 bg-amber-100';
    case 'RED': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

export default function ReportsPage() {
  const [ccn, setCcn] = useState('');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  async function generateReport() {
    if (!ccn.trim()) {
      setError('Please enter a CCN');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/reports?ccn=' + ccn.trim());
      const data = await response.json();

      if (data.success) {
        setReportData(data.data);
      } else {
        setError(data.error || 'Failed to generate report');
      }
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function downloadPDF() {
    if (!reportData) return;

    const doc = new jsPDF();
    const { provider } = reportData;
    const margin = 20;
    let y = margin;

    // Helper function
    const addSection = (title: string) => {
      if (y > 250) {
        doc.addPage();
        y = margin;
      }
      y += 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(13, 148, 136); // teal
      doc.text(title, margin, y);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
    };

    const addRow = (label: string, value: string | number | null) => {
      if (y > 270) {
        doc.addPage();
        y = margin;
      }
      doc.setFont('helvetica', 'normal');
      doc.text(label + ':', margin, y);
      doc.setFont('helvetica', 'bold');
      doc.text(String(value ?? '-'), margin + 60, y);
      y += 6;
    };

    // Header
    doc.setFillColor(13, 148, 136);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(provider.provider_name, margin, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`CCN: ${provider.ccn}`, margin, 26);
    doc.text(`${provider.city}, ${provider.state} ${provider.zip_code}`, margin, 33);

    // Classification badge
    const classColors: Record<string, [number, number, number]> = {
      GREEN: [16, 185, 129],
      YELLOW: [245, 158, 11],
      RED: [239, 68, 68],
    };
    const badgeColor = classColors[provider.classification] || [128, 128, 128];
    doc.setFillColor(...badgeColor);
    doc.roundedRect(160, 12, 30, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(provider.classification, 167, 19);

    y = 55;
    doc.setTextColor(0, 0, 0);

    // Scores Section
    addSection('Acquisition Scores');
    const scores = [
      ['Overall', provider.overall_score],
      ['Quality', provider.quality_score],
      ['Compliance', provider.compliance_score],
      ['Operational', provider.operational_score],
      ['Market', provider.market_score],
    ];
    doc.setFontSize(10);
    let xPos = margin;
    scores.forEach(([label, score]) => {
      doc.setFont('helvetica', 'normal');
      doc.text(String(label), xPos, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text(String(score ?? '-'), xPos, y + 7);
      doc.setFontSize(10);
      xPos += 35;
    });
    y += 18;

    // Operations Section
    addSection('Operations');
    addRow('Estimated ADC', provider.estimated_adc);
    addRow('ADC Fit', provider.adc_fit);
    addRow('Competitive Density', provider.competitive_density);
    addRow('Deal Type', provider.platform_vs_tuckin);
    addRow('Outreach Readiness', provider.outreach_readiness);

    // Financials Section
    addSection('Financials');
    addRow('Total Revenue', provider.total_revenue ? formatCurrency(provider.total_revenue) : '-');
    addRow('Total Expenses', provider.total_expenses ? formatCurrency(provider.total_expenses) : '-');
    addRow('Net Income', provider.net_income ? formatCurrency(provider.net_income) : '-');

    // Ownership Section
    addSection('Ownership');
    addRow('Type', provider.ownership_type_cms);
    addRow('PE Backed', provider.pe_backed ? 'Yes' : 'No');
    addRow('Chain Affiliated', provider.chain_affiliated ? 'Yes' : 'No');
    addRow('Owner Count', provider.owner_count);
    addRow('Complexity', provider.ownership_complexity);

    // Market Demographics Section
    addSection('Market Demographics');
    addRow('County', provider.county);
    addRow('CON State', provider.con_state ? 'Yes' : 'No');
    addRow('County Pop 65+', provider.county_pop_65_plus ? formatNumber(provider.county_pop_65_plus) : '-');
    addRow('% Pop 65+', provider.county_pct_65_plus ? `${Number(provider.county_pct_65_plus).toFixed(1)}%` : '-');
    addRow('Median Income', provider.county_median_income ? formatCurrency(provider.county_median_income) : '-');

    // Contact Section
    addSection('Contact Information');
    addRow('Administrator', provider.administrator_name);
    addRow('Phone', provider.phone_number);
    addRow('Website', provider.website);
    addRow('Address', `${provider.address_line_1}, ${provider.city}, ${provider.state} ${provider.zip_code}`);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`My5StarReport - Generated ${new Date().toLocaleDateString()}`, margin, 285);

    // Save
    doc.save(`${provider.provider_name.replace(/[^a-z0-9]/gi, '_')}_Report.pdf`);
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-6 py-8">
      {/* Header - hide when printing */}
      <div className="mb-8 print:hidden">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="gradient-text">Provider Reports</span>
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Generate detailed provider reports for due diligence
        </p>
      </div>

      {/* Report Generator - hide when printing */}
      <div className="glass-card rounded-xl p-6 mb-8 print:hidden">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--color-turquoise-500)]" />
          Generate Report
        </h3>

        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium mb-1 text-[var(--color-text-muted)]">
              Provider CCN
            </label>
            <input
              type="text"
              value={ccn}
              onChange={(e) => setCcn(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && generateReport()}
              placeholder="Enter CCN (e.g., 011502)"
              className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
            />
          </div>

          <button
            onClick={generateReport}
            disabled={loading}
            className="px-6 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Generate
          </button>

          {reportData && (
            <>
              <button
                onClick={downloadPDF}
                className="px-6 py-2 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                onClick={handlePrint}
                className="px-6 py-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] font-medium transition-colors flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </>
          )}
        </div>

        {error && (
          <p className="mt-4 text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      {/* Report Preview */}
      {reportData && (
        <div ref={reportRef} className="bg-white text-black print:shadow-none rounded-xl overflow-hidden shadow-lg">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white p-8">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">{reportData.provider.provider_name}</h1>
                <p className="text-teal-100">CCN: {reportData.provider.ccn}</p>
                <p className="text-teal-100 flex items-center gap-1 mt-1">
                  <MapPin className="w-4 h-4" />
                  {reportData.provider.city}, {reportData.provider.state} {reportData.provider.zip_code}
                </p>
              </div>
              <div className="text-right">
                <span className={'px-3 py-1 rounded-full text-sm font-bold ' + getClassificationColor(reportData.provider.classification)}>
                  {reportData.provider.classification}
                </span>
                <p className="text-teal-100 text-sm mt-2">
                  Generated: {new Date(reportData.generatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Scores Summary */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Acquisition Scores
            </h2>
            <div className="grid grid-cols-5 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-teal-600">{reportData.provider.overall_score || '-'}</div>
                <div className="text-sm text-gray-600">Overall</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{reportData.provider.quality_score || '-'}</div>
                <div className="text-sm text-gray-600">Quality</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{reportData.provider.compliance_score || '-'}</div>
                <div className="text-sm text-gray-600">Compliance</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600">{reportData.provider.operational_score || '-'}</div>
                <div className="text-sm text-gray-600">Operational</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{reportData.provider.market_score || '-'}</div>
                <div className="text-sm text-gray-600">Market</div>
              </div>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-2 gap-0 border-b border-gray-200">
            {/* Operations */}
            <div className="p-6 border-r border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Operations
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated ADC</span>
                  <span className="font-semibold">{formatNumber(reportData.provider.estimated_adc)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ADC Fit</span>
                  <span className="font-semibold">{reportData.provider.adc_fit || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Competitive Density</span>
                  <span className="font-semibold">{reportData.provider.competitive_density || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deal Type</span>
                  <span className="font-semibold">{reportData.provider.platform_vs_tuckin || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Outreach Readiness</span>
                  <span className="font-semibold">{reportData.provider.outreach_readiness || '-'}</span>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-teal-600" />
                Financials
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue</span>
                  <span className="font-semibold">{formatCurrency(reportData.provider.total_revenue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-semibold">{formatCurrency(reportData.provider.total_expenses)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                  <span className="text-gray-600 font-semibold">Net Income</span>
                  <span className={'font-bold ' + ((reportData.provider.net_income || 0) >= 0 ? 'text-green-600' : 'text-red-600')}>
                    {formatCurrency(reportData.provider.net_income)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Two Column Layout - Continued */}
          <div className="grid grid-cols-2 gap-0 border-b border-gray-200">
            {/* Ownership */}
            <div className="p-6 border-r border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-600" />
                Ownership
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold">{reportData.provider.ownership_type_cms || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PE Backed</span>
                  <span className={'font-semibold ' + (reportData.provider.pe_backed ? 'text-purple-600' : '')}>
                    {reportData.provider.pe_backed ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Chain Affiliated</span>
                  <span className="font-semibold">{reportData.provider.chain_affiliated ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Owner Count</span>
                  <span className="font-semibold">{reportData.provider.owner_count || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Complexity</span>
                  <span className="font-semibold">{reportData.provider.ownership_complexity || '-'}</span>
                </div>
              </div>
            </div>

            {/* Market */}
            <div className="p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-teal-600" />
                Market Demographics
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">County</span>
                  <span className="font-semibold">{reportData.provider.county}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CON State</span>
                  <span className={'font-semibold ' + (reportData.provider.con_state ? 'text-green-600' : '')}>
                    {reportData.provider.con_state ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">County Pop 65+</span>
                  <span className="font-semibold">{formatNumber(reportData.provider.county_pop_65_plus)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">% Population 65+</span>
                  <span className="font-semibold">{reportData.provider.county_pct_65_plus ? Number(reportData.provider.county_pct_65_plus).toFixed(1) + '%' : '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Median Income</span>
                  <span className="font-semibold">{formatCurrency(reportData.provider.county_median_income)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-teal-600" />
              Contact Information
            </h2>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 block">Administrator</span>
                <span className="font-semibold">{reportData.provider.administrator_name || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Phone</span>
                <span className="font-semibold">{reportData.provider.phone_number || '-'}</span>
              </div>
              <div>
                <span className="text-gray-600 block">Website</span>
                <span className="font-semibold break-all">{reportData.provider.website || '-'}</span>
              </div>
              <div className="col-span-3">
                <span className="text-gray-600 block">Address</span>
                <span className="font-semibold">
                  {reportData.provider.address_line_1}, {reportData.provider.city}, {reportData.provider.state} {reportData.provider.zip_code}
                </span>
              </div>
            </div>
          </div>

          {/* Competitors */}
          {reportData.competitors.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Local Competitors ({reportData.provider.county} County)
              </h2>
              <div className="grid grid-cols-1 gap-2">
                {reportData.competitors.map((comp) => (
                  <div key={comp.ccn} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="font-semibold">{comp.provider_name}</span>
                      <span className="text-gray-500 ml-2">({comp.ccn})</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-gray-600">ADC: {comp.estimated_adc || '-'}</span>
                      <span className={'px-2 py-0.5 rounded text-xs font-bold ' + getClassificationColor(comp.classification)}>
                        {comp.classification}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Outreach History */}
          {reportData.outreach.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Outreach History
              </h2>
              <div className="space-y-2">
                {reportData.outreach.map((o, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                    <div>
                      <span className="font-semibold capitalize">{o.outreach_type}</span>
                      <span className="text-gray-500 ml-2">
                        {new Date(o.outreach_date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-gray-600">{o.outcome || o.notes || '-'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-6 bg-gray-50 text-center text-sm text-gray-500">
            <p>Hospice Tracker M&A Intelligence Platform</p>
            <p>Report generated on {new Date(reportData.generatedAt).toLocaleString()}</p>
            <p className="mt-2 text-xs">This report is for informational purposes only. Data sourced from CMS and proprietary analysis.</p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <div className="glass-card rounded-xl p-12 text-center print:hidden">
          <FileText className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
          <h2 className="text-lg font-semibold mb-2">Generate a Provider Report</h2>
          <p className="text-[var(--color-text-muted)]">
            Enter a provider CCN above to generate a detailed due diligence report
          </p>
        </div>
      )}

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}
