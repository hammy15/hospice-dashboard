'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, TrendingUp, PieChart, MapPin, Loader2,
  ArrowUpRight, ArrowDownRight, Minus, Users, DollarSign
} from 'lucide-react';

interface StateConsolidation {
  state: string;
  total_providers: number;
  pe_owned: number;
  chain_affiliated: number;
  independent: number;
  pe_penetration_pct: number;
  chain_penetration_pct: number;
}

interface Portfolio {
  portfolio_group: string;
  provider_count: number;
  total_adc: number;
  states: string[];
}

const formatNumber = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US').format(value);
};

const formatPercent = (value: number | null) => {
  if (value === null) return '-';
  return `${Number(value).toFixed(1)}%`;
};

const getPenetrationColor = (pct: number) => {
  if (pct >= 30) return 'text-red-400';
  if (pct >= 15) return 'text-amber-400';
  return 'text-emerald-400';
};

export default function ConsolidationPage() {
  const [stateData, setStateData] = useState<StateConsolidation[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<keyof StateConsolidation>('pe_penetration_pct');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [statesRes, portfoliosRes] = await Promise.all([
        fetch('/api/consolidation?type=states'),
        fetch('/api/consolidation?type=portfolios'),
      ]);

      const statesData = await statesRes.json();
      const portfoliosData = await portfoliosRes.json();

      if (statesData.success) setStateData(statesData.data);
      if (portfoliosData.success) setPortfolios(portfoliosData.data);
    } catch (error) {
      console.error('Error fetching consolidation data:', error);
    } finally {
      setLoading(false);
    }
  }

  const sortedStates = [...stateData].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'desc' ? bVal - aVal : aVal - bVal;
    }
    return 0;
  });

  const handleSort = (key: keyof StateConsolidation) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'desc' ? 'asc' : 'desc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  // Calculate totals
  const totals = stateData.reduce(
    (acc, s) => ({
      total: acc.total + s.total_providers,
      pe: acc.pe + s.pe_owned,
      chain: acc.chain + s.chain_affiliated,
      independent: acc.independent + s.independent,
    }),
    { total: 0, pe: 0, chain: 0, independent: 0 }
  );

  const nationalPePct = totals.total > 0 ? (totals.pe / totals.total) * 100 : 0;
  const nationalChainPct = totals.total > 0 ? (totals.chain / totals.total) * 100 : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="gradient-text">Market Consolidation</span>
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          PE and chain market penetration analysis
        </p>
      </div>

      {/* National Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-tertiary)] flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Total Providers</span>
          </div>
          <div className="text-3xl font-bold font-mono">{formatNumber(totals.total)}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm font-medium text-[var(--color-text-muted)]">PE Owned</span>
          </div>
          <div className="text-3xl font-bold font-mono text-purple-400">{formatNumber(totals.pe)}</div>
          <div className="text-sm text-[var(--color-text-muted)]">{nationalPePct.toFixed(1)}% of market</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Chain Affiliated</span>
          </div>
          <div className="text-3xl font-bold font-mono text-amber-400">{formatNumber(totals.chain)}</div>
          <div className="text-sm text-[var(--color-text-muted)]">{nationalChainPct.toFixed(1)}% of market</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6 rounded-xl"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-[var(--color-text-muted)]">Independent</span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-400">{formatNumber(totals.independent)}</div>
          <div className="text-sm text-[var(--color-text-muted)]">
            {totals.total > 0 ? ((totals.independent / totals.total) * 100).toFixed(1) : 0}% of market
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* State-by-State Table */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h2 className="font-semibold flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-turquoise-500)]" />
                Consolidation by State
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--color-bg-tertiary)]">
                  <tr>
                    <th
                      className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[var(--color-turquoise-500)]"
                      onClick={() => handleSort('state')}
                    >
                      State
                    </th>
                    <th
                      className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[var(--color-turquoise-500)]"
                      onClick={() => handleSort('total_providers')}
                    >
                      Total
                    </th>
                    <th
                      className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[var(--color-turquoise-500)]"
                      onClick={() => handleSort('pe_penetration_pct')}
                    >
                      PE %
                    </th>
                    <th
                      className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[var(--color-turquoise-500)]"
                      onClick={() => handleSort('chain_penetration_pct')}
                    >
                      Chain %
                    </th>
                    <th
                      className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-[var(--color-turquoise-500)]"
                      onClick={() => handleSort('independent')}
                    >
                      Independent
                    </th>
                    <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">
                      Opportunity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {sortedStates.map((state, index) => {
                    const independentPct = state.total_providers > 0
                      ? (state.independent / state.total_providers) * 100
                      : 0;

                    return (
                      <motion.tr
                        key={state.state}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        className="hover:bg-[var(--color-bg-hover)] transition-colors"
                      >
                        <td className="py-3 px-4 font-medium">{state.state}</td>
                        <td className="py-3 px-4 text-right font-mono">{state.total_providers}</td>
                        <td className={`py-3 px-4 text-right font-mono ${getPenetrationColor(state.pe_penetration_pct)}`}>
                          {formatPercent(state.pe_penetration_pct)}
                        </td>
                        <td className={`py-3 px-4 text-right font-mono ${getPenetrationColor(state.chain_penetration_pct)}`}>
                          {formatPercent(state.chain_penetration_pct)}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-mono">{state.independent}</span>
                          <span className="text-xs text-[var(--color-text-muted)] ml-1">
                            ({independentPct.toFixed(0)}%)
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {independentPct >= 70 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                              <ArrowUpRight className="w-3 h-3" /> High
                            </span>
                          ) : independentPct >= 50 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                              <Minus className="w-3 h-3" /> Medium
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                              <ArrowDownRight className="w-3 h-3" /> Low
                            </span>
                          )}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Portfolio Groups */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Major Portfolios
            </h2>

            <div className="space-y-4">
              {portfolios
                .filter(p => p.portfolio_group !== 'Other/Independent')
                .map((portfolio, index) => (
                  <motion.div
                    key={portfolio.portfolio_group}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-[var(--color-bg-secondary)]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{portfolio.portfolio_group}</h3>
                      <span className="text-lg font-bold font-mono text-[var(--color-turquoise-500)]">
                        {portfolio.provider_count}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-[var(--color-text-muted)]">
                      <span>Total ADC: {formatNumber(portfolio.total_adc)}</span>
                      <span>{portfolio.states?.length || 0} states</span>
                    </div>
                    {portfolio.states && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {portfolio.states.slice(0, 8).map(s => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-xs"
                          >
                            {s}
                          </span>
                        ))}
                        {portfolio.states.length > 8 && (
                          <span className="px-1.5 py-0.5 rounded bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-text-muted)]">
                            +{portfolio.states.length - 8}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
            </div>
          </div>

          {/* Legend */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="text-sm font-medium mb-3">Opportunity Rating</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>High: 70%+ Independent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Medium: 50-70% Independent</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span>Low: &lt;50% Independent</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
