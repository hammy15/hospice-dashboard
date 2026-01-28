'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Calculator, DollarSign, TrendingUp, Building2, Search,
  Loader2, Info, ChevronRight, BarChart3, Target, Scale
} from 'lucide-react';

interface Multiples {
  revenue_multiple: { low: number; median: number; high: number };
  ebitda_multiple: { low: number; median: number; high: number };
  per_adc_value: { low: number; median: number; high: number };
  notes: string;
}

interface ProviderFinancials {
  ccn: string;
  provider_name: string;
  state: string;
  city: string;
  estimated_adc: number | null;
  total_revenue: number | null;
  total_expenses: number | null;
  net_income: number | null;
  cost_report_year: number | null;
  ownership_type_cms: string;
  pe_backed: boolean;
  chain_affiliated: boolean;
}

const formatCurrency = (value: number | null | undefined) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
};

const formatNumber = (value: number | null | undefined) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US').format(value);
};

export default function ValuationPage() {
  const [ccn, setCcn] = useState('');
  const [loading, setLoading] = useState(false);
  const [multiples, setMultiples] = useState<Multiples | null>(null);
  const [provider, setProvider] = useState<ProviderFinancials | null>(null);
  const [calculated, setCalculated] = useState<any>(null);

  // Custom inputs
  const [customRevenue, setCustomRevenue] = useState<string>('');
  const [customEbitda, setCustomEbitda] = useState<string>('');
  const [customAdc, setCustomAdc] = useState<string>('');
  const [sellerNotePercent, setSellerNotePercent] = useState<string>('30');
  const [sellerNoteRate, setSellerNoteRate] = useState<string>('6');
  const [sellerNoteTerm, setSellerNoteTerm] = useState<string>('60');

  useEffect(() => {
    fetchMultiples();
  }, []);

  async function fetchMultiples() {
    try {
      const response = await fetch('/api/valuation?type=multiples');
      const data = await response.json();
      if (data.success) {
        setMultiples(data.data);
      }
    } catch (error) {
      console.error('Error fetching multiples:', error);
    }
  }

  async function fetchValuation() {
    if (!ccn) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/valuation?ccn=${ccn}`);
      const data = await response.json();
      if (data.success) {
        setProvider(data.data.provider);
        setCalculated(data.data.calculated);
        setCustomRevenue(data.data.provider.total_revenue?.toString() || '');
        setCustomAdc(data.data.provider.estimated_adc?.toString() || '');
      }
    } catch (error) {
      console.error('Error fetching valuation:', error);
    } finally {
      setLoading(false);
    }
  }

  // Calculate custom valuations
  const revenue = parseFloat(customRevenue) || 0;
  const ebitda = parseFloat(customEbitda) || revenue * 0.15; // Assume 15% margin if not provided
  const adc = parseFloat(customAdc) || 0;
  const notePercent = parseFloat(sellerNotePercent) || 0;
  const noteRate = parseFloat(sellerNoteRate) || 0;
  const noteTerm = parseFloat(sellerNoteTerm) || 60;

  const valuations = multiples ? {
    revenue: {
      low: revenue * multiples.revenue_multiple.low,
      median: revenue * multiples.revenue_multiple.median,
      high: revenue * multiples.revenue_multiple.high,
    },
    ebitda: {
      low: ebitda * multiples.ebitda_multiple.low,
      median: ebitda * multiples.ebitda_multiple.median,
      high: ebitda * multiples.ebitda_multiple.high,
    },
    adc: {
      low: adc * multiples.per_adc_value.low,
      median: adc * multiples.per_adc_value.median,
      high: adc * multiples.per_adc_value.high,
    },
  } : null;

  const selectedValuation = valuations?.revenue.median || 0;
  const sellerNoteAmount = selectedValuation * (notePercent / 100);
  const cashAtClose = selectedValuation - sellerNoteAmount;
  const monthlyPayment = sellerNoteAmount > 0
    ? (sellerNoteAmount * (noteRate / 100 / 12)) / (1 - Math.pow(1 + (noteRate / 100 / 12), -noteTerm))
    : 0;

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="gradient-text">Valuation Calculator</span>
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Model acquisition valuations using industry multiples
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Provider Lookup */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Load Provider Data
            </h2>
            <div className="flex gap-3">
              <input
                type="text"
                value={ccn}
                onChange={e => setCcn(e.target.value)}
                placeholder="Enter CCN (e.g., 501234)"
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none"
                onKeyDown={e => e.key === 'Enter' && fetchValuation()}
              />
              <button
                onClick={fetchValuation}
                disabled={loading || !ccn}
                className="px-6 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 transition-colors"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Load'}
              </button>
            </div>

            {provider && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-lg bg-[var(--color-bg-secondary)]"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{provider.provider_name}</h3>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      {provider.city}, {provider.state} • {provider.ownership_type_cms}
                    </p>
                  </div>
                  <Link
                    href={`/provider/${provider.ccn}`}
                    className="text-[var(--color-turquoise-500)] hover:underline text-sm"
                  >
                    View Profile →
                  </Link>
                </div>
              </motion.div>
            )}
          </div>

          {/* Custom Inputs */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Valuation Inputs
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Annual Revenue</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="number"
                    value={customRevenue}
                    onChange={e => setCustomRevenue(e.target.value)}
                    placeholder="0"
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">EBITDA (optional)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="number"
                    value={customEbitda}
                    onChange={e => setCustomEbitda(e.target.value)}
                    placeholder="Auto: 15% margin"
                    className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Average Daily Census</label>
                <input
                  type="number"
                  value={customAdc}
                  onChange={e => setCustomAdc(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
            </div>
          </div>

          {/* Valuation Results */}
          {valuations && (revenue > 0 || adc > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card rounded-xl p-6"
            >
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[var(--color-turquoise-500)]" />
                Valuation Estimates
              </h2>

              <div className="space-y-6">
                {/* Revenue Multiple */}
                {revenue > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Revenue Multiple ({multiples?.revenue_multiple.low}x - {multiples?.revenue_multiple.high}x)</h3>
                      <span className="text-xs text-[var(--color-text-muted)]">Based on {formatCurrency(revenue)} revenue</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Conservative</div>
                        <div className="text-lg font-bold">{formatCurrency(valuations.revenue.low)}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{multiples?.revenue_multiple.low}x</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-turquoise-500)]/10 border border-[var(--color-turquoise-500)]/30">
                        <div className="text-xs text-[var(--color-turquoise-400)] mb-1">Median</div>
                        <div className="text-lg font-bold text-[var(--color-turquoise-500)]">{formatCurrency(valuations.revenue.median)}</div>
                        <div className="text-xs text-[var(--color-turquoise-400)]">{multiples?.revenue_multiple.median}x</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Premium</div>
                        <div className="text-lg font-bold">{formatCurrency(valuations.revenue.high)}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{multiples?.revenue_multiple.high}x</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* EBITDA Multiple */}
                {ebitda > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">EBITDA Multiple ({multiples?.ebitda_multiple.low}x - {multiples?.ebitda_multiple.high}x)</h3>
                      <span className="text-xs text-[var(--color-text-muted)]">Based on {formatCurrency(ebitda)} EBITDA</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Conservative</div>
                        <div className="text-lg font-bold">{formatCurrency(valuations.ebitda.low)}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                        <div className="text-xs text-amber-400 mb-1">Median</div>
                        <div className="text-lg font-bold text-amber-400">{formatCurrency(valuations.ebitda.median)}</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Premium</div>
                        <div className="text-lg font-bold">{formatCurrency(valuations.ebitda.high)}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Per ADC Value */}
                {adc > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-medium">Per-ADC Valuation</h3>
                      <span className="text-xs text-[var(--color-text-muted)]">Based on {formatNumber(adc)} ADC</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Conservative</div>
                        <div className="text-lg font-bold">{formatCurrency(valuations.adc.low)}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">${formatNumber(multiples?.per_adc_value.low)}/ADC</div>
                      </div>
                      <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="text-xs text-emerald-400 mb-1">Median</div>
                        <div className="text-lg font-bold text-emerald-400">{formatCurrency(valuations.adc.median)}</div>
                        <div className="text-xs text-emerald-400">${formatNumber(multiples?.per_adc_value.median)}/ADC</div>
                      </div>
                      <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">Premium</div>
                        <div className="text-lg font-bold">{formatCurrency(valuations.adc.high)}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">${formatNumber(multiples?.per_adc_value.high)}/ADC</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Deal Structure */}
        <div className="space-y-6">
          {/* Industry Multiples */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Industry Multiples
            </h2>

            {multiples ? (
              <div className="space-y-4">
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="text-sm font-medium">Revenue Multiple</div>
                  <div className="text-2xl font-bold font-mono">
                    {multiples.revenue_multiple.low}x - {multiples.revenue_multiple.high}x
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">Median: {multiples.revenue_multiple.median}x</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="text-sm font-medium">EBITDA Multiple</div>
                  <div className="text-2xl font-bold font-mono">
                    {multiples.ebitda_multiple.low}x - {multiples.ebitda_multiple.high}x
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">Median: {multiples.ebitda_multiple.median}x</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="text-sm font-medium">Per-ADC Value</div>
                  <div className="text-2xl font-bold font-mono">
                    ${formatNumber(multiples.per_adc_value.low)} - ${formatNumber(multiples.per_adc_value.high)}
                  </div>
                  <div className="text-xs text-[var(--color-text-muted)]">Median: ${formatNumber(multiples.per_adc_value.median)}</div>
                </div>
                <p className="text-xs text-[var(--color-text-muted)] mt-2">{multiples.notes}</p>
              </div>
            ) : (
              <Loader2 className="w-6 h-6 animate-spin mx-auto" />
            )}
          </div>

          {/* Seller Note Calculator */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Deal Structure
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Seller Note %</label>
                <input
                  type="number"
                  value={sellerNotePercent}
                  onChange={e => setSellerNotePercent(e.target.value)}
                  min="0"
                  max="100"
                  className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Rate %</label>
                  <input
                    type="number"
                    value={sellerNoteRate}
                    onChange={e => setSellerNoteRate(e.target.value)}
                    step="0.5"
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Term (mo)</label>
                  <input
                    type="number"
                    value={sellerNoteTerm}
                    onChange={e => setSellerNoteTerm(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
                  />
                </div>
              </div>

              {selectedValuation > 0 && (
                <div className="pt-4 border-t border-[var(--color-border)] space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Purchase Price</span>
                    <span className="font-semibold">{formatCurrency(selectedValuation)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Cash at Close</span>
                    <span className="font-semibold text-emerald-400">{formatCurrency(cashAtClose)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-text-muted)]">Seller Note</span>
                    <span className="font-semibold text-amber-400">{formatCurrency(sellerNoteAmount)}</span>
                  </div>
                  {monthlyPayment > 0 && (
                    <div className="flex justify-between text-sm pt-2 border-t border-[var(--color-border)]">
                      <span className="text-[var(--color-text-muted)]">Monthly Payment</span>
                      <span className="font-semibold">{formatCurrency(monthlyPayment)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="glass-card rounded-xl p-4">
            <Link
              href="/owner-carryback"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
            >
              <Target className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              <div className="flex-1">
                <div className="font-medium text-sm">Owner Carry-Back Targets</div>
                <div className="text-xs text-[var(--color-text-muted)]">Find seller financing candidates</div>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
