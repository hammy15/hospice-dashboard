'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  GitCompare, Plus, X, Loader2, Building2, TrendingUp,
  DollarSign, Users, Star, Shield, MapPin, Phone, CheckCircle, XCircle
} from 'lucide-react';

interface Provider {
  ccn: string;
  provider_name: string;
  state: string;
  city: string;
  county: string;
  classification: string;
  overall_score: number | null;
  quality_score: number | null;
  compliance_score: number | null;
  operational_score: number | null;
  market_score: number | null;
  estimated_adc: number | null;
  total_revenue: number | null;
  total_expenses: number | null;
  net_income: number | null;
  pe_backed: boolean;
  chain_affiliated: boolean;
  owner_count: number | null;
  ownership_type_cms: string;
  con_state: boolean;
  county_pop_65_plus: number | null;
  county_pct_65_plus: number | null;
  county_median_income: number | null;
  cms_quality_star: number | null;
  cms_cahps_star: number | null;
  competitive_density: string;
  phone_number: string | null;
  administrator_name: string | null;
}

const formatCurrency = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatNumber = (value: number | null | undefined, decimals = 0) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(value);
};

const formatPercent = (value: number | null) => {
  if (!value) return '-';
  return `${Number(value).toFixed(1)}%`;
};

const getClassificationColor = (classification: string) => {
  switch (classification) {
    case 'GREEN': return 'text-emerald-400 bg-emerald-500/20';
    case 'YELLOW': return 'text-amber-400 bg-amber-500/20';
    case 'RED': return 'text-red-400 bg-red-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

const getBestValue = (providers: Provider[], key: keyof Provider, higherIsBetter = true) => {
  const values = providers.map(p => p[key] as number | null).filter(v => v !== null) as number[];
  if (values.length === 0) return null;
  return higherIsBetter ? Math.max(...values) : Math.min(...values);
};

export default function ComparePage() {
  const [ccnInputs, setCcnInputs] = useState<string[]>(['', '']);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCcnInput = () => {
    if (ccnInputs.length < 5) {
      setCcnInputs([...ccnInputs, '']);
    }
  };

  const removeCcnInput = (index: number) => {
    if (ccnInputs.length > 2) {
      setCcnInputs(ccnInputs.filter((_, i) => i !== index));
    }
  };

  const updateCcnInput = (index: number, value: string) => {
    const newInputs = [...ccnInputs];
    newInputs[index] = value;
    setCcnInputs(newInputs);
  };

  async function compareProviders() {
    const validCcns = ccnInputs.filter(c => c.trim());
    if (validCcns.length < 2) {
      setError('Please enter at least 2 CCNs to compare');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/compare?ccns=${validCcns.join(',')}`);
      const data = await response.json();
      if (data.success) {
        setProviders(data.data);
      } else {
        setError(data.error || 'Failed to load providers');
      }
    } catch (err) {
      setError('Failed to compare providers');
    } finally {
      setLoading(false);
    }
  }

  const ComparisonRow = ({ label, values, format, higherIsBetter = true }: {
    label: string;
    values: (string | number | boolean | null)[];
    format?: 'currency' | 'number' | 'percent' | 'boolean' | 'text';
    higherIsBetter?: boolean;
  }) => {
    const numericValues = values.map(v => typeof v === 'number' ? v : null);
    const best = format !== 'boolean' && format !== 'text'
      ? getBestValue(providers, values[0] as unknown as keyof Provider, higherIsBetter)
      : null;

    return (
      <tr className="border-b border-[var(--color-border)]">
        <td className="py-3 px-4 text-sm font-medium text-[var(--color-text-muted)]">{label}</td>
        {values.map((value, i) => {
          let displayValue: React.ReactNode = '-';
          let isBest = false;

          if (value !== null && value !== undefined) {
            if (format === 'currency') {
              displayValue = formatCurrency(value as number);
              isBest = best !== null && value === best;
            } else if (format === 'number') {
              displayValue = formatNumber(value as number, 1);
              isBest = best !== null && value === best;
            } else if (format === 'percent') {
              displayValue = formatPercent(value as number);
              isBest = best !== null && value === best;
            } else if (format === 'boolean') {
              displayValue = value ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
              ) : (
                <XCircle className="w-4 h-4 text-red-400" />
              );
            } else {
              displayValue = String(value);
            }
          }

          return (
            <td
              key={i}
              className={`py-3 px-4 text-sm text-center ${
                isBest ? 'font-bold text-[var(--color-turquoise-500)]' : ''
              }`}
            >
              {displayValue}
            </td>
          );
        })}
      </tr>
    );
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="gradient-text">Provider Comparison</span>
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Compare up to 5 providers side-by-side
        </p>
      </div>

      {/* CCN Input Form */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex flex-wrap gap-3 items-end">
          {ccnInputs.map((ccn, index) => (
            <div key={index} className="relative">
              <label className="block text-xs font-medium mb-1 text-[var(--color-text-muted)]">
                Provider {index + 1}
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={ccn}
                  onChange={e => updateCcnInput(index, e.target.value)}
                  placeholder="CCN"
                  className="w-28 px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none text-sm"
                />
                {ccnInputs.length > 2 && (
                  <button
                    onClick={() => removeCcnInput(index)}
                    className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}

          {ccnInputs.length < 5 && (
            <button
              onClick={addCcnInput}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-dashed border-[var(--color-border)] hover:border-[var(--color-turquoise-500)] text-sm text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-500)] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          )}

          <button
            onClick={compareProviders}
            disabled={loading || ccnInputs.filter(c => c.trim()).length < 2}
            className="px-6 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <GitCompare className="w-4 h-4" />
            )}
            Compare
          </button>
        </div>

        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Comparison Results */}
      {providers.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl overflow-hidden"
        >
          {/* Provider Headers */}
          <div className="grid grid-cols-1">
            <table className="w-full">
              <thead>
                <tr className="bg-[var(--color-bg-tertiary)]">
                  <th className="w-48 py-4 px-4 text-left text-sm font-semibold">Metric</th>
                  {providers.map(p => (
                    <th key={p.ccn} className="py-4 px-4 text-center">
                      <Link href={`/provider/${p.ccn}`} className="hover:text-[var(--color-turquoise-500)]">
                        <div className="font-semibold text-sm">{p.provider_name}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{p.city}, {p.state}</div>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${getClassificationColor(p.classification)}`}>
                          {p.classification}
                        </span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Scores Section */}
                <tr className="bg-[var(--color-bg-secondary)]">
                  <td colSpan={providers.length + 1} className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Scores
                  </td>
                </tr>
                <ComparisonRow label="Overall Score" values={providers.map(p => p.overall_score)} format="number" />
                <ComparisonRow label="Quality Score" values={providers.map(p => p.quality_score)} format="number" />
                <ComparisonRow label="Compliance Score" values={providers.map(p => p.compliance_score)} format="number" />
                <ComparisonRow label="Operational Score" values={providers.map(p => p.operational_score)} format="number" />
                <ComparisonRow label="Market Score" values={providers.map(p => p.market_score)} format="number" />

                {/* Operations Section */}
                <tr className="bg-[var(--color-bg-secondary)]">
                  <td colSpan={providers.length + 1} className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Operations
                  </td>
                </tr>
                <ComparisonRow label="Estimated ADC" values={providers.map(p => p.estimated_adc)} format="number" />
                <ComparisonRow label="CMS Quality Star" values={providers.map(p => p.cms_quality_star)} format="number" />
                <ComparisonRow label="CAHPS Star" values={providers.map(p => p.cms_cahps_star)} format="number" />
                <ComparisonRow label="Competitive Density" values={providers.map(p => p.competitive_density)} format="text" />

                {/* Financials Section */}
                <tr className="bg-[var(--color-bg-secondary)]">
                  <td colSpan={providers.length + 1} className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Financials
                  </td>
                </tr>
                <ComparisonRow label="Total Revenue" values={providers.map(p => p.total_revenue)} format="currency" />
                <ComparisonRow label="Total Expenses" values={providers.map(p => p.total_expenses)} format="currency" higherIsBetter={false} />
                <ComparisonRow label="Net Income" values={providers.map(p => p.net_income)} format="currency" />

                {/* Ownership Section */}
                <tr className="bg-[var(--color-bg-secondary)]">
                  <td colSpan={providers.length + 1} className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Ownership
                  </td>
                </tr>
                <ComparisonRow label="Ownership Type" values={providers.map(p => p.ownership_type_cms)} format="text" />
                <ComparisonRow label="PE Backed" values={providers.map(p => p.pe_backed)} format="boolean" />
                <ComparisonRow label="Chain Affiliated" values={providers.map(p => p.chain_affiliated)} format="boolean" />
                <ComparisonRow label="Owner Count" values={providers.map(p => p.owner_count)} format="number" higherIsBetter={false} />

                {/* Market Section */}
                <tr className="bg-[var(--color-bg-secondary)]">
                  <td colSpan={providers.length + 1} className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Market Demographics
                  </td>
                </tr>
                <ComparisonRow label="CON State" values={providers.map(p => p.con_state)} format="boolean" />
                <ComparisonRow label="County Pop 65+" values={providers.map(p => p.county_pop_65_plus)} format="number" />
                <ComparisonRow label="% Population 65+" values={providers.map(p => p.county_pct_65_plus)} format="percent" />
                <ComparisonRow label="Median Income" values={providers.map(p => p.county_median_income)} format="currency" />

                {/* Contact Section */}
                <tr className="bg-[var(--color-bg-secondary)]">
                  <td colSpan={providers.length + 1} className="py-2 px-4 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
                    Contact
                  </td>
                </tr>
                <ComparisonRow label="Administrator" values={providers.map(p => p.administrator_name)} format="text" />
                <ComparisonRow label="Phone" values={providers.map(p => p.phone_number)} format="text" />
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {providers.length === 0 && !loading && (
        <div className="glass-card rounded-xl p-12 text-center">
          <GitCompare className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
          <h2 className="text-lg font-semibold mb-2">Compare Providers</h2>
          <p className="text-[var(--color-text-muted)]">
            Enter 2-5 provider CCNs above to see a side-by-side comparison
          </p>
        </div>
      )}
    </div>
  );
}
