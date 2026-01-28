'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Handshake,
  Target,
  Building2,
  Shield,
  TrendingUp,
  Users,
  DollarSign,
  MapPin,
  ChevronRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Sparkles,
  PiggyBank,
  Scale,
  Heart,
  Phone,
  Filter,
  ArrowUpRight,
  Info,
} from 'lucide-react';

interface EndemicStats {
  endemic_count: number;
  endemic_green: number;
  endemic_yellow: number;
  single_owner_endemic: number;
  ideal_size_endemic: number;
  prime_carry_back_targets: number;
  avg_endemic_adc: number;
  avg_endemic_score: number;
}

interface PipelineStats {
  platform_candidates: number;
  tuckin_candidates: number;
  owner_finance_targets: number;
  outreach_ready: number;
  contactable_green: number;
  con_protected_independent: number;
  with_financials: number;
  total_market_value_mm: number;
}

interface CarryBackAnalysis {
  score: number;
  factors: { name: string; score: number; reason: string }[];
  likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface Opportunity {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  county: string;
  classification: 'GREEN' | 'YELLOW';
  overall_score: number;
  estimated_adc: number | null;
  pe_backed: boolean;
  chain_affiliated: boolean;
  owner_count: number | null;
  ownership_type_cms: string;
  recent_ownership_change: boolean;
  con_state: boolean;
  phone_number: string | null;
  administrator_name: string | null;
  total_revenue: number | null;
  carryBackAnalysis: CarryBackAnalysis;
  carry_back_score: number;
}

interface EndemicState {
  state: string;
  endemic_count: number;
  endemic_green: number;
  endemic_yellow: number;
  is_con_state: boolean;
  avg_score: number;
}

export default function OwnerCarryBackPage() {
  const [loading, setLoading] = useState(true);
  const [endemicStats, setEndemicStats] = useState<EndemicStats | null>(null);
  const [pipelineStats, setPipelineStats] = useState<PipelineStats | null>(null);
  const [topOpportunities, setTopOpportunities] = useState<Opportunity[]>([]);
  const [endemicByState, setEndemicByState] = useState<EndemicState[]>([]);
  const [expandedProvider, setExpandedProvider] = useState<string | null>(null);
  const [filterLikelihood, setFilterLikelihood] = useState<string>('ALL');

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/owner-carryback?type=overview');
        const data = await response.json();

        if (data.success) {
          setEndemicStats(data.data.endemicStats);
          setPipelineStats(data.data.pipelineStats);
          setTopOpportunities(data.data.topOpportunities);
          setEndemicByState(data.data.endemicByState);
        }
      } catch (error) {
        console.error('Failed to fetch owner carry-back data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getLikelihoodBadge = (likelihood: string) => {
    switch (likelihood) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400">
            MEDIUM
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
            LOW
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
      </div>
    );
  }

  const filteredOpportunities = topOpportunities.filter((opp) =>
    filterLikelihood === 'ALL' || opp.carryBackAnalysis.likelihood === filterLikelihood
  );

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <Handshake className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
              <span className="gradient-text">Owner Carry-Back Opportunities</span>
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Identify endemic companies ideal for seller-financed acquisitions
            </p>
          </div>
        </div>
      </div>

      {/* What is Owner Carry-Back Info Box */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-xl p-6 mb-6 border-l-4 border-l-[var(--color-turquoise-500)]"
      >
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-[var(--color-turquoise-500)]/20 flex-shrink-0">
            <Info className="w-5 h-5 text-[var(--color-turquoise-400)]" />
          </div>
          <div>
            <h3 className="font-semibold mb-2">What is Owner Carry-Back Financing?</h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-3">
              Owner carry-back (or seller financing) is when the seller agrees to finance a portion of the purchase
              price, acting as the lender. This is ideal for acquiring small, independently-owned hospice agencies
              where the owner wants to ensure a smooth transition and continued success.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[var(--color-text-secondary)]">Lower upfront capital required</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[var(--color-text-secondary)]">Seller invested in your success</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span className="text-[var(--color-text-secondary)]">Often better terms than banks</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">Prime Targets</span>
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {endemicStats?.prime_carry_back_targets || 0}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">HIGH likelihood GREEN</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-[var(--color-turquoise-500)]/10">
              <Building2 className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">Endemic Companies</span>
          </div>
          <div className="text-3xl font-bold">
            {endemicStats?.endemic_count || 0}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">
            {endemicStats?.endemic_green || 0} GREEN / {endemicStats?.endemic_yellow || 0} YELLOW
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">Single Owner</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {endemicStats?.single_owner_endemic || 0}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Sole proprietorship</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass-card rounded-xl p-5"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Scale className="w-5 h-5 text-amber-400" />
            </div>
            <span className="text-sm text-[var(--color-text-muted)]">Ideal Size (20-60)</span>
          </div>
          <div className="text-3xl font-bold text-amber-400">
            {endemicStats?.ideal_size_endemic || 0}
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">ADC sweet spot</p>
        </motion.div>
      </div>

      {/* Deal Pipeline Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl p-6 mb-6"
      >
        <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[var(--color-turquoise-400)]" />
          Acquisition Pipeline Overview
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {pipelineStats?.owner_finance_targets || 0}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">Owner Finance Candidates</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
            <div className="text-2xl font-bold font-mono text-purple-400">
              {pipelineStats?.platform_candidates || 0}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">Platform Candidates</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
            <div className="text-2xl font-bold font-mono text-blue-400">
              {pipelineStats?.tuckin_candidates || 0}
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">Tuck-in Opportunities</p>
          </div>
          <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
            <div className="text-2xl font-bold font-mono text-[var(--color-turquoise-400)]">
              ${pipelineStats?.total_market_value_mm || 0}M
            </div>
            <p className="text-sm text-[var(--color-text-muted)]">Est. GREEN Market Value</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
          <div className="text-center">
            <div className="text-lg font-semibold font-mono">
              {pipelineStats?.contactable_green || 0}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">GREEN with Contact Info</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold font-mono">
              {pipelineStats?.con_protected_independent || 0}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">CON Protected & Independent</p>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold font-mono">
              {pipelineStats?.with_financials || 0}
            </div>
            <p className="text-xs text-[var(--color-text-muted)]">GREEN with Financials</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Opportunities List */}
        <div className="lg:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-400" />
                Top Owner Carry-Back Opportunities
              </h2>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[var(--color-text-muted)]" />
                <select
                  value={filterLikelihood}
                  onChange={(e) => setFilterLikelihood(e.target.value)}
                  className="text-sm bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] rounded-lg px-2 py-1"
                >
                  <option value="ALL">All Likelihood</option>
                  <option value="HIGH">HIGH Only</option>
                  <option value="MEDIUM">MEDIUM Only</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {filteredOpportunities.map((opp, index) => (
                <div key={opp.ccn} className="group">
                  <button
                    onClick={() => setExpandedProvider(expandedProvider === opp.ccn ? null : opp.ccn)}
                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-emerald-500">
                          {index + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">{opp.provider_name}</span>
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                            opp.classification === 'GREEN'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {opp.classification}
                          </span>
                          {opp.con_state && (
                            <Shield className="w-3.5 h-3.5 text-[var(--color-turquoise-400)]" />
                          )}
                        </div>
                        <div className="text-sm text-[var(--color-text-muted)] flex items-center gap-2">
                          <MapPin className="w-3 h-3" />
                          {opp.city}, {opp.state}
                          {opp.phone_number && <Phone className="w-3 h-3 ml-2" />}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-right">
                        <div className="text-sm font-mono font-semibold">
                          {opp.carryBackAnalysis.score}/100
                        </div>
                        <div className="text-xs text-[var(--color-text-muted)]">Carry-Back Score</div>
                      </div>
                      {getLikelihoodBadge(opp.carryBackAnalysis.likelihood)}
                      <ChevronRight className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform ${
                        expandedProvider === opp.ccn ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expandedProvider === opp.ccn && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-6 pb-4 bg-[var(--color-bg-tertiary)]/50"
                    >
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">ADC</p>
                          <p className="font-semibold font-mono">{opp.estimated_adc || '—'}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">Overall Score</p>
                          <p className="font-semibold font-mono">{opp.overall_score}</p>
                        </div>
                        <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                          <p className="text-xs text-[var(--color-text-muted)]">Ownership</p>
                          <p className="font-semibold text-sm truncate">
                            {opp.ownership_type_cms || '—'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                          Why This Target is Ideal for Owner Carry-Back:
                        </p>
                        <div className="space-y-1">
                          {opp.carryBackAnalysis.factors
                            .filter((f) => f.score > 5)
                            .map((factor, i) => (
                              <div key={i} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-medium">{factor.name}</span>
                                  <span className="text-[var(--color-text-muted)]"> — {factor.reason}</span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      <Link
                        href={`/provider/${opp.ccn}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white text-sm font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
                      >
                        View Full Profile
                        <ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>

            <div className="px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <Link
                href="/search?peBackedOnly=false&chainOnly=false"
                className="text-sm text-[var(--color-turquoise-400)] hover:underline flex items-center gap-1"
              >
                View All Endemic Companies
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Endemic by State Sidebar */}
        <div className="lg:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[var(--color-border)]">
              <h2 className="text-lg font-semibold font-[family-name:var(--font-display)] flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[var(--color-turquoise-400)]" />
                Endemic by State
              </h2>
            </div>

            <div className="divide-y divide-[var(--color-border)] max-h-[500px] overflow-y-auto">
              {endemicByState.slice(0, 15).map((state, i) => (
                <Link
                  key={state.state}
                  href={`/market/${state.state.toLowerCase()}`}
                  className="flex items-center justify-between px-6 py-3 hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xs font-mono">
                      {i + 1}
                    </span>
                    <span className="font-medium">{state.state}</span>
                    {state.is_con_state && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        CON
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-emerald-400">{state.endemic_green}G</span>
                    <span className="text-sm font-mono text-amber-400">{state.endemic_yellow}Y</span>
                  </div>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="glass-card rounded-xl p-6 mt-6"
          >
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <PiggyBank className="w-5 h-5 text-amber-400" />
              Owner Carry-Back Tips
            </h3>
            <div className="space-y-3 text-sm text-[var(--color-text-secondary)]">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-emerald-400">1</span>
                </div>
                <p>Target single-owner operators nearing retirement age</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-emerald-400">2</span>
                </div>
                <p>ADC 20-60 is the sweet spot — established but not institutional</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-emerald-400">3</span>
                </div>
                <p>CON states offer regulatory protection from new competition</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-emerald-400">4</span>
                </div>
                <p>Offer 10-20% seller note at fair terms to seal deals</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
