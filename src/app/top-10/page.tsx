'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Trophy,
  TrendingUp,
  MapPin,
  Users,
  DollarSign,
  Star,
  Shield,
  Building2,
  ChevronRight,
  ExternalLink,
  Phone,
  Globe,
  Award,
  Target,
  Zap,
  BarChart3,
  ArrowUpRight,
  CheckCircle2,
  Info,
} from 'lucide-react';

interface Opportunity {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  county: string;
  overall_score: number;
  quality_score: number | null;
  compliance_score: number | null;
  operational_score: number | null;
  market_score: number | null;
  estimated_adc: number | null;
  classification: string;
  total_revenue: number | null;
  total_expenses: number | null;
  net_income: number | null;
  cost_per_day: number | null;
  county_pop_65_plus: number | null;
  county_pct_65_plus: number | null;
  county_median_income: number | null;
  con_state: boolean;
  ownership_type_cms: string;
  pe_backed: boolean;
  chain_affiliated: boolean;
  cms_cahps_star: number | null;
  cms_quality_star: number | null;
  npi: string | null;
  ein: string | null;
  authorized_official: string | null;
  phone_number: string | null;
  website: string | null;
  address_line_1: string | null;
  latitude: number | null;
  longitude: number | null;
  outreach_readiness: string | null;
  platform_vs_tuckin: string | null;
  confidence_level: string | null;
  sell_side_hypothesis: string | null;
  classification_reasons: string | null;
}

interface MarketStats {
  total_green: number;
  green_in_con: number;
  avg_green_score: number;
  avg_green_adc: number;
  total_green_revenue: number;
  avg_green_revenue: number;
  green_with_financials: number;
}

interface StateDistribution {
  state: string;
  count: number;
  avg_score: number;
  is_con_state: boolean;
}

const formatCurrency = (value: number | null) => {
  if (!value) return 'N/A';
  const num = Number(value);
  if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `$${(num / 1000).toFixed(0)}K`;
  return `$${num.toFixed(0)}`;
};

const formatNumber = (value: number | null) => {
  if (!value) return 'N/A';
  return value.toLocaleString();
};

const getRankBadge = (rank: number) => {
  if (rank === 1) return { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-900', icon: Trophy };
  if (rank === 2) return { bg: 'from-slate-300 to-slate-400', text: 'text-slate-900', icon: Award };
  if (rank === 3) return { bg: 'from-amber-600 to-amber-700', text: 'text-amber-100', icon: Award };
  return { bg: 'from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)]', text: 'text-white', icon: Target };
};

export default function Top10Page() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [marketStats, setMarketStats] = useState<MarketStats | null>(null);
  const [stateDistribution, setStateDistribution] = useState<StateDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/top-opportunities');
        const data = await res.json();
        setOpportunities(data.opportunities || []);
        setMarketStats(data.marketStats);
        setStateDistribution(data.stateDistribution || []);
      } catch (error) {
        console.error('Failed to fetch opportunities:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-turquoise-500)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-turquoise-500)]/10 via-transparent to-amber-500/10" />
        <div className="max-w-7xl mx-auto px-6 py-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 mb-6">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                Premier Acquisition Targets
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-[family-name:var(--font-display)] font-bold mb-4">
              Top 10 Hospice Opportunities
            </h1>
            <p className="text-lg text-[var(--color-text-secondary)] max-w-3xl mx-auto">
              Data-driven analysis of the most attractive acquisition targets based on quality scores,
              market positioning, financials, and regulatory environment.
            </p>
          </motion.div>

          {/* Stats Row */}
          {marketStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
            >
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-[var(--color-turquoise-500)]">
                  {marketStats.total_green}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">GREEN Targets</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-emerald-500">
                  {marketStats.green_in_con}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">In CON States</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-amber-500">
                  {marketStats.avg_green_score}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">Avg Score</div>
              </div>
              <div className="glass-card rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">
                  {formatCurrency(marketStats.avg_green_revenue)}
                </div>
                <div className="text-sm text-[var(--color-text-muted)]">Avg Revenue</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content - Top 10 List */}
          <div className="lg:col-span-2 space-y-6">
            {opportunities.map((opp, index) => {
              const rank = index + 1;
              const badge = getRankBadge(rank);
              const BadgeIcon = badge.icon;
              const isExpanded = expandedCard === opp.ccn;

              return (
                <motion.div
                  key={opp.ccn}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-shadow"
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Rank Badge */}
                      <div className={`flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br ${badge.bg} flex items-center justify-center shadow-lg`}>
                        {rank <= 3 ? (
                          <BadgeIcon className={`w-7 h-7 ${badge.text}`} />
                        ) : (
                          <span className={`text-xl font-bold ${badge.text}`}>#{rank}</span>
                        )}
                      </div>

                      {/* Provider Info */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <Link
                            href={`/provider/${opp.ccn}`}
                            className="text-xl font-bold hover:text-[var(--color-turquoise-500)] transition-colors truncate"
                          >
                            {opp.provider_name}
                          </Link>
                          {opp.con_state && (
                            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              CON
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
                          <MapPin className="w-4 h-4" />
                          {opp.city}, {opp.state}
                          {opp.county && <span className="text-[var(--color-text-muted)]">({opp.county} County)</span>}
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-right">
                        <div className="text-3xl font-bold text-[var(--color-turquoise-500)]">
                          {opp.overall_score}
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">Score</div>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                          <Users className="w-3.5 h-3.5" />
                          Est. ADC
                        </div>
                        <div className="text-lg font-semibold">
                          {opp.estimated_adc || 'N/A'}
                        </div>
                      </div>
                      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                          <DollarSign className="w-3.5 h-3.5" />
                          Revenue
                        </div>
                        <div className="text-lg font-semibold">
                          {formatCurrency(opp.total_revenue)}
                        </div>
                      </div>
                      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                          <Star className="w-3.5 h-3.5" />
                          CAHPS Star
                        </div>
                        <div className="text-lg font-semibold">
                          {opp.cms_cahps_star ? `${opp.cms_cahps_star}★` : 'N/A'}
                        </div>
                      </div>
                      <div className="bg-[var(--color-bg-secondary)] rounded-lg p-3">
                        <div className="flex items-center gap-2 text-xs text-[var(--color-text-muted)] mb-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          65+ Pop
                        </div>
                        <div className="text-lg font-semibold">
                          {opp.county_pop_65_plus ? formatNumber(opp.county_pop_65_plus) : 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => setExpandedCard(isExpanded ? null : opp.ccn)}
                      className="w-full mt-4 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-turquoise-500)] flex items-center justify-center gap-1 transition-colors"
                    >
                      {isExpanded ? 'Show Less' : 'View Details'}
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]/50"
                    >
                      <div className="p-6 space-y-6">
                        {/* Score Breakdown */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <BarChart3 className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                            Score Breakdown
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                              { label: 'Quality', value: opp.quality_score, color: 'emerald' },
                              { label: 'Compliance', value: opp.compliance_score, color: 'blue' },
                              { label: 'Operational', value: opp.operational_score, color: 'amber' },
                              { label: 'Market', value: opp.market_score, color: 'purple' },
                            ].map((score) => (
                              <div key={score.label} className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                                <div className="text-xs text-[var(--color-text-muted)] mb-1">{score.label}</div>
                                <div className="flex items-end gap-1">
                                  <span className={`text-lg font-bold text-${score.color}-500`}>
                                    {score.value || 'N/A'}
                                  </span>
                                  {score.value && <span className="text-xs text-[var(--color-text-muted)]">/100</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Financial Details */}
                        {(opp.total_revenue || opp.net_income) && (
                          <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <DollarSign className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                              Financial Profile
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                                <div className="text-xs text-[var(--color-text-muted)] mb-1">Revenue</div>
                                <div className="text-lg font-bold">{formatCurrency(opp.total_revenue)}</div>
                              </div>
                              <div className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                                <div className="text-xs text-[var(--color-text-muted)] mb-1">Expenses</div>
                                <div className="text-lg font-bold">{formatCurrency(opp.total_expenses)}</div>
                              </div>
                              <div className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                                <div className="text-xs text-[var(--color-text-muted)] mb-1">Net Income</div>
                                <div className={`text-lg font-bold ${opp.net_income && opp.net_income > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                                  {formatCurrency(opp.net_income)}
                                </div>
                              </div>
                              <div className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                                <div className="text-xs text-[var(--color-text-muted)] mb-1">Cost/Day</div>
                                <div className="text-lg font-bold">{formatCurrency(opp.cost_per_day)}</div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Market Demographics */}
                        <div>
                          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                            Market Demographics
                          </h4>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                              <div className="text-xs text-[var(--color-text-muted)] mb-1">65+ Population</div>
                              <div className="text-lg font-bold">{formatNumber(opp.county_pop_65_plus)}</div>
                            </div>
                            <div className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                              <div className="text-xs text-[var(--color-text-muted)] mb-1">% 65+</div>
                              <div className="text-lg font-bold">
                                {opp.county_pct_65_plus ? `${opp.county_pct_65_plus}%` : 'N/A'}
                              </div>
                            </div>
                            <div className="bg-[var(--color-bg-primary)] rounded-lg p-3">
                              <div className="text-xs text-[var(--color-text-muted)] mb-1">Median Income</div>
                              <div className="text-lg font-bold">{formatCurrency(opp.county_median_income)}</div>
                            </div>
                          </div>
                        </div>

                        {/* Ownership & Contact */}
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                              Ownership Profile
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Type</span>
                                <span className="font-medium">{opp.ownership_type_cms || 'Unknown'}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">PE-Backed</span>
                                <span className={`font-medium ${opp.pe_backed ? 'text-amber-500' : 'text-emerald-500'}`}>
                                  {opp.pe_backed ? 'Yes' : 'No'}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[var(--color-text-muted)]">Chain Affiliated</span>
                                <span className="font-medium">{opp.chain_affiliated ? 'Yes' : 'No'}</span>
                              </div>
                              {opp.authorized_official && (
                                <div className="flex justify-between">
                                  <span className="text-[var(--color-text-muted)]">Official</span>
                                  <span className="font-medium truncate ml-2">{opp.authorized_official}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                              Contact Information
                            </h4>
                            <div className="space-y-2 text-sm">
                              {opp.phone_number && (
                                <a href={`tel:${opp.phone_number}`} className="flex items-center gap-2 hover:text-[var(--color-turquoise-500)]">
                                  <Phone className="w-4 h-4" />
                                  {opp.phone_number}
                                </a>
                              )}
                              {opp.website && (
                                <a href={opp.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-[var(--color-turquoise-500)]">
                                  <Globe className="w-4 h-4" />
                                  Website
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              )}
                              {opp.address_line_1 && (
                                <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                  <MapPin className="w-4 h-4" />
                                  {opp.address_line_1}
                                </div>
                              )}
                              <div className="flex gap-2 mt-3">
                                {opp.npi && (
                                  <span className="px-2 py-1 text-xs rounded bg-blue-500/20 text-blue-400">
                                    NPI: {opp.npi}
                                  </span>
                                )}
                                {opp.ein && (
                                  <span className="px-2 py-1 text-xs rounded bg-pink-500/20 text-pink-400">
                                    EIN: {opp.ein}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="pt-4 border-t border-[var(--color-border)]">
                          <Link
                            href={`/provider/${opp.ccn}`}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
                          >
                            View Full Profile
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Methodology */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[var(--color-turquoise-500)]" />
                Scoring Methodology
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Quality Score</span>
                    <p className="text-[var(--color-text-muted)]">CMS star ratings, CAHPS surveys, clinical outcomes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Compliance Score</span>
                    <p className="text-[var(--color-text-muted)]">Survey history, deficiencies, CAP compliance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Operational Score</span>
                    <p className="text-[var(--color-text-muted)]">ADC, cost efficiency, revenue performance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-medium">Market Score</span>
                    <p className="text-[var(--color-text-muted)]">Demographics, competition, CON protection</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Market Intelligence */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                2025 M&A Intelligence
              </h3>
              <div className="space-y-4 text-sm">
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="font-semibold text-amber-500 mb-1">Valuation Multiples</div>
                  <ul className="space-y-1 text-[var(--color-text-secondary)]">
                    <li>Small independents: 3-6x EBITDA</li>
                    <li>Regional platforms: 6-10x EBITDA</li>
                    <li>Premium assets: 10-15x EBITDA</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="font-semibold mb-1">Key Trends</div>
                  <ul className="space-y-1 text-[var(--color-text-muted)]">
                    <li>• PE participation down to ~27% of deals</li>
                    <li>• CON states remain premium targets</li>
                    <li>• Non-profits attracting buyer interest</li>
                    <li>• Clean compliance = higher multiples</li>
                  </ul>
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">
                  Sources: VERTESS, Scope Research, Health Affairs
                </div>
              </div>
            </motion.div>

            {/* Top States */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-turquoise-500)]" />
                Top States by GREEN Targets
              </h3>
              <div className="space-y-2">
                {stateDistribution.slice(0, 8).map((state, index) => (
                  <Link
                    key={state.state}
                    href={`/market/${state.state.toLowerCase()}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--color-bg-secondary)] text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{state.state}</span>
                      {state.is_con_state && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">CON</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[var(--color-turquoise-500)] font-semibold">{state.count}</span>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6 bg-gradient-to-br from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/10 border-[var(--color-turquoise-500)]/30"
            >
              <h3 className="text-lg font-bold mb-2">Need Custom Analysis?</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                Use our advanced search to filter by specific criteria and export your own target list.
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
              >
                Advanced Search
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
