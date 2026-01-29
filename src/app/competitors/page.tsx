'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  DollarSign,
  MapPin,
  Users,
  PieChart,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';

interface PEFirm {
  id: string;
  name: string;
  website: string | null;
  portfolio_count: number;
  recent_deals: number;
  notes: string | null;
}

interface Transaction {
  id: string;
  ccn: string | null;
  provider_name: string;
  buyer_name: string;
  buyer_type: string;
  transaction_date: string;
  estimated_value: number | null;
  deal_type: string;
  classification: string | null;
}

interface MarketShare {
  state: string;
  total_providers: number;
  pe_backed_count: number;
  pe_penetration: number;
  green_targets: number;
  independent_green: number;
}

export default function CompetitorsPage() {
  const [data, setData] = useState<{
    peFirms: PEFirm[];
    recentDeals: Transaction[];
    marketShare: MarketShare[];
    rollupActivity: unknown[];
    countyDensity: unknown[];
    ownershipConcentration: unknown[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSection, setExpandedSection] = useState<string | null>('marketShare');

  useEffect(() => {
    fetch('/api/competitors')
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (value: number | null) => {
    if (!value) return '—';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
  };

  const formatDate = (date: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          <span className="gradient-text">Competitor Analysis</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Track PE activity, M&A trends, and market consolidation
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Building2 className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">PE Firms Tracked</span>
          </div>
          <div className="text-3xl font-bold">{data?.peFirms?.length || 0}</div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">Recent Deals</span>
          </div>
          <div className="text-3xl font-bold">{data?.recentDeals?.length || 0}</div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <PieChart className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">Avg PE Penetration</span>
          </div>
          <div className="text-3xl font-bold">
            {data?.marketShare ? (data.marketShare.reduce((a, b) => a + (Number(b.pe_penetration) || 0), 0) / data.marketShare.length).toFixed(1) : 0}%
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">Independent GREEN</span>
          </div>
          <div className="text-3xl font-bold">
            {data?.marketShare?.reduce((a, b) => a + (Number(b.independent_green) || 0), 0) || 0}
          </div>
        </div>
      </div>

      {/* Market Share by State */}
      <div className="glass-card rounded-xl mb-6 overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'marketShare' ? null : 'marketShare')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            <span className="font-semibold">Market Share by State</span>
          </div>
          {expandedSection === 'marketShare' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSection === 'marketShare' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-[var(--color-border)]"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                    <th className="px-6 py-3 font-medium">State</th>
                    <th className="px-6 py-3 font-medium text-right">Total</th>
                    <th className="px-6 py-3 font-medium text-right">PE-Backed</th>
                    <th className="px-6 py-3 font-medium text-right">PE %</th>
                    <th className="px-6 py-3 font-medium text-right">GREEN Targets</th>
                    <th className="px-6 py-3 font-medium text-right">Independent GREEN</th>
                    <th className="px-6 py-3 font-medium">PE Penetration</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.marketShare?.slice(0, 20).map((row) => (
                    <tr key={row.state} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]">
                      <td className="px-6 py-3 font-medium">{row.state}</td>
                      <td className="px-6 py-3 text-right">{row.total_providers}</td>
                      <td className="px-6 py-3 text-right text-purple-400">{row.pe_backed_count}</td>
                      <td className="px-6 py-3 text-right">{row.pe_penetration}%</td>
                      <td className="px-6 py-3 text-right text-emerald-400">{row.green_targets}</td>
                      <td className="px-6 py-3 text-right font-semibold text-[var(--color-turquoise-400)]">{row.independent_green}</td>
                      <td className="px-6 py-3">
                        <div className="w-32 h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-purple-400 rounded-full"
                            style={{ width: `${Math.min(Number(row.pe_penetration) || 0, 100)}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>

      {/* PE Firms */}
      <div className="glass-card rounded-xl mb-6 overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'peFirms' ? null : 'peFirms')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Building2 className="w-5 h-5 text-purple-400" />
            <span className="font-semibold">Active PE Firms</span>
          </div>
          {expandedSection === 'peFirms' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSection === 'peFirms' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-[var(--color-border)] p-6"
          >
            {data?.peFirms && data.peFirms.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {data.peFirms.map((firm) => (
                  <div key={firm.id} className="p-4 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold">{firm.name}</span>
                      {firm.website && (
                        <a href={firm.website} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)]" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                      <span>{firm.portfolio_count} portfolio co.</span>
                      <span>{firm.recent_deals} recent deals</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-[var(--color-text-muted)] py-8">
                No PE firms tracked yet. Add firms to track competitive activity.
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="glass-card rounded-xl overflow-hidden">
        <button
          onClick={() => setExpandedSection(expandedSection === 'deals' ? null : 'deals')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors"
        >
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">Recent M&A Transactions</span>
          </div>
          {expandedSection === 'deals' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>

        {expandedSection === 'deals' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-[var(--color-border)]"
          >
            {data?.recentDeals && data.recentDeals.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-[var(--color-text-muted)] border-b border-[var(--color-border)]">
                      <th className="px-6 py-3 font-medium">Provider</th>
                      <th className="px-6 py-3 font-medium">Buyer</th>
                      <th className="px-6 py-3 font-medium">Type</th>
                      <th className="px-6 py-3 font-medium text-right">Value</th>
                      <th className="px-6 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentDeals.map((deal) => (
                      <tr key={deal.id} className="border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)]">
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {deal.ccn && (
                              <a href={`/provider/${deal.ccn}`} className="hover:text-[var(--color-turquoise-400)]">
                                {deal.provider_name}
                              </a>
                            )}
                            {!deal.ccn && deal.provider_name}
                            {deal.classification && (
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                deal.classification === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' :
                                deal.classification === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {deal.classification}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3 font-medium">{deal.buyer_name}</td>
                        <td className="px-6 py-3">
                          <span className={`text-xs px-2 py-1 rounded ${
                            deal.buyer_type === 'PE' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {deal.buyer_type || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-right font-mono">{formatCurrency(deal.estimated_value)}</td>
                        <td className="px-6 py-3 text-[var(--color-text-muted)]">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {formatDate(deal.transaction_date)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-[var(--color-text-muted)] py-8">
                No transactions recorded yet. Add deals to track market activity.
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
