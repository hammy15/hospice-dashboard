'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Shield, AlertTriangle, CheckCircle, XCircle, Loader2,
  TrendingUp, TrendingDown, MapPin, Building2, Award, BarChart3
} from 'lucide-react';

interface ComplianceSummary {
  total_providers: number;
  scored_providers: number;
  avg_compliance_score: number;
  avg_quality_score: number;
  high_compliance: number;
  medium_compliance: number;
  low_compliance: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
}

interface StateCompliance {
  state: string;
  provider_count: number;
  avg_compliance: number;
  avg_quality: number;
  high_compliance: number;
  low_compliance: number;
}

interface AtRiskProvider {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  classification: string;
  compliance_score: number;
  quality_score: number;
  overall_score: number;
  pe_backed: boolean;
  chain_affiliated: boolean;
}

interface DistributionItem {
  score_range: string;
  count: number;
}

interface OwnershipTrend {
  ownership_type_cms: string;
  total: number;
  avg_compliance: number;
  green: number;
  yellow: number;
  red: number;
}

const formatNumber = (value: number | null) => {
  if (!value) return '-';
  return new Intl.NumberFormat('en-US').format(value);
};

const getComplianceColor = (score: number | null) => {
  if (!score) return 'text-gray-400';
  if (score >= 70) return 'text-emerald-400';
  if (score >= 50) return 'text-amber-400';
  return 'text-red-400';
};

const getComplianceBg = (score: number | null) => {
  if (!score) return 'bg-gray-500/20';
  if (score >= 70) return 'bg-emerald-500/20';
  if (score >= 50) return 'bg-amber-500/20';
  return 'bg-red-500/20';
};

const getClassificationColor = (classification: string) => {
  switch (classification) {
    case 'GREEN': return 'text-emerald-400 bg-emerald-500/20';
    case 'YELLOW': return 'text-amber-400 bg-amber-500/20';
    case 'RED': return 'text-red-400 bg-red-500/20';
    default: return 'text-gray-400 bg-gray-500/20';
  }
};

export default function CompliancePage() {
  const [summary, setSummary] = useState<ComplianceSummary | null>(null);
  const [stateData, setStateData] = useState<StateCompliance[]>([]);
  const [atRisk, setAtRisk] = useState<AtRiskProvider[]>([]);
  const [distribution, setDistribution] = useState<DistributionItem[]>([]);
  const [trends, setTrends] = useState<OwnershipTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'states' | 'at-risk'>('overview');

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [summaryRes, stateRes, atRiskRes, distRes, trendsRes] = await Promise.all([
        fetch('/api/compliance?type=summary'),
        fetch('/api/compliance?type=by-state'),
        fetch('/api/compliance?type=at-risk'),
        fetch('/api/compliance?type=distribution'),
        fetch('/api/compliance?type=trends'),
      ]);

      const [summaryData, stateData, atRiskData, distData, trendsData] = await Promise.all([
        summaryRes.json(),
        stateRes.json(),
        atRiskRes.json(),
        distRes.json(),
        trendsRes.json(),
      ]);

      if (summaryData.success) setSummary(summaryData.data);
      if (stateData.success) setStateData(stateData.data);
      if (atRiskData.success) setAtRisk(atRiskData.data);
      if (distData.success) setDistribution(distData.data);
      if (trendsData.success) setTrends(trendsData.data);
    } catch (error) {
      console.error('Error fetching compliance data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-500)]" />
      </div>
    );
  }

  const maxDistCount = Math.max(...distribution.map(d => d.count));

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="gradient-text">Compliance Dashboard</span>
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Monitor compliance scores, risk levels, and quality metrics
        </p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-4 h-4 text-[var(--color-text-muted)]" />
              <span className="text-xs text-[var(--color-text-muted)]">Total Providers</span>
            </div>
            <div className="text-2xl font-bold font-mono">{formatNumber(summary.total_providers)}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              <span className="text-xs text-[var(--color-text-muted)]">Avg Compliance</span>
            </div>
            <div className="text-2xl font-bold font-mono text-[var(--color-turquoise-500)]">
              {summary.avg_compliance_score || '-'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-[var(--color-text-muted)]">High Compliance</span>
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {formatNumber(summary.high_compliance)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">Score 70+</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-[var(--color-text-muted)]">Medium</span>
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400">
              {formatNumber(summary.medium_compliance)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">Score 50-69</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-red-400" />
              <span className="text-xs text-[var(--color-text-muted)]">Low/At Risk</span>
            </div>
            <div className="text-2xl font-bold font-mono text-red-400">
              {formatNumber(summary.low_compliance)}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">Score &lt;50</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card p-4 rounded-xl"
          >
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-[var(--color-text-muted)]">Avg Quality</span>
            </div>
            <div className="text-2xl font-bold font-mono text-purple-400">
              {summary.avg_quality_score || '-'}
            </div>
          </motion.div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={'px-4 py-2 rounded-lg font-medium text-sm transition-colors ' +
            (activeTab === 'overview'
              ? 'bg-[var(--color-turquoise-500)] text-white'
              : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]')
          }
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('states')}
          className={'px-4 py-2 rounded-lg font-medium text-sm transition-colors ' +
            (activeTab === 'states'
              ? 'bg-[var(--color-turquoise-500)] text-white'
              : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]')
          }
        >
          By State
        </button>
        <button
          onClick={() => setActiveTab('at-risk')}
          className={'px-4 py-2 rounded-lg font-medium text-sm transition-colors ' +
            (activeTab === 'at-risk'
              ? 'bg-[var(--color-turquoise-500)] text-white'
              : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]')
          }
        >
          At-Risk Providers
        </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Distribution */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Compliance Score Distribution
            </h3>
            <div className="space-y-3">
              {distribution.map((item, index) => (
                <div key={item.score_range} className="flex items-center gap-3">
                  <span className="w-16 text-sm font-mono text-[var(--color-text-muted)]">
                    {item.score_range}
                  </span>
                  <div className="flex-1 bg-[var(--color-bg-secondary)] rounded-full h-6 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: (item.count / maxDistCount) * 100 + '%' }}
                      transition={{ delay: index * 0.05 }}
                      className={'h-full rounded-full ' +
                        (item.score_range.startsWith('9') || item.score_range.startsWith('8') || item.score_range.startsWith('7')
                          ? 'bg-emerald-500'
                          : item.score_range.startsWith('6') || item.score_range.startsWith('5')
                            ? 'bg-amber-500'
                            : 'bg-red-500')
                      }
                    />
                  </div>
                  <span className="w-16 text-right text-sm font-mono">
                    {item.count.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ownership Type Trends */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Compliance by Ownership Type
            </h3>
            <div className="space-y-3">
              {trends.map((trend) => (
                <div key={trend.ownership_type_cms} className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm truncate flex-1">
                      {trend.ownership_type_cms || 'Unknown'}
                    </span>
                    <span className={'font-mono text-sm ' + getComplianceColor(trend.avg_compliance)}>
                      {trend.avg_compliance}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--color-text-muted)]">{trend.total} providers</span>
                    <span className="text-emerald-400">{trend.green}G</span>
                    <span className="text-amber-400">{trend.yellow}Y</span>
                    <span className="text-red-400">{trend.red}R</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'states' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Compliance by State
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-tertiary)]">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">State</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Providers</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Avg Compliance</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Avg Quality</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">High Compliance</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">At Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {stateData.map((state, index) => (
                  <motion.tr
                    key={state.state}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="py-3 px-4 font-medium">{state.state}</td>
                    <td className="py-3 px-4 text-right font-mono">{state.provider_count}</td>
                    <td className={'py-3 px-4 text-right font-mono font-bold ' + getComplianceColor(state.avg_compliance)}>
                      {state.avg_compliance}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{state.avg_quality}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400">{state.high_compliance}</td>
                    <td className="py-3 px-4 text-right font-mono text-red-400">{state.low_compliance}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'at-risk' && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              At-Risk Providers (Compliance Score &lt;50)
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--color-bg-tertiary)]">
                <tr>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Provider</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-wider">Location</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">Classification</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Compliance</th>
                  <th className="py-3 px-4 text-right text-xs font-semibold uppercase tracking-wider">Quality</th>
                  <th className="py-3 px-4 text-center text-xs font-semibold uppercase tracking-wider">Ownership</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {atRisk.map((provider, index) => (
                  <motion.tr
                    key={provider.ccn}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="hover:bg-[var(--color-bg-hover)]"
                  >
                    <td className="py-3 px-4">
                      <Link href={'/provider/' + provider.ccn} className="hover:text-[var(--color-turquoise-500)]">
                        <div className="font-medium">{provider.provider_name}</div>
                        <div className="text-xs text-[var(--color-text-muted)]">{provider.ccn}</div>
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {provider.city}, {provider.state}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={'px-2 py-0.5 rounded-full text-xs font-bold ' + getClassificationColor(provider.classification)}>
                        {provider.classification}
                      </span>
                    </td>
                    <td className={'py-3 px-4 text-right font-mono font-bold ' + getComplianceColor(provider.compliance_score)}>
                      {provider.compliance_score}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">{provider.quality_score || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      {provider.pe_backed && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 text-xs mr-1">PE</span>
                      )}
                      {provider.chain_affiliated && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-xs">Chain</span>
                      )}
                      {!provider.pe_backed && !provider.chain_affiliated && (
                        <span className="text-xs text-[var(--color-text-muted)]">Independent</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
