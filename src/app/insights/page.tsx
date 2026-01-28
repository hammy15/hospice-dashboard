'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BarChart3, PieChart, TrendingUp, Users, DollarSign, MapPin,
  Shield, Building2, Star, Activity, Target, Zap, ChevronRight,
  RefreshCw, Database, ArrowUpRight, AlertTriangle, CheckCircle2,
} from 'lucide-react';

interface InsightsData {
  overview: any;
  classificationTrend: any[];
  stateBreakdown: any[];
  ownershipBreakdown: any[];
  adcBuckets: any[];
  scoreBuckets: any[];
  revenueDistribution: any[];
  demographicsCorrelation: any[];
  conVsNonCon: any[];
  qualityMetrics: any[];
  financialHealth: any[];
  topCounties: any[];
  marketDensity: any[];
}

const formatCurrency = (val: number | null) => {
  if (!val) return '—';
  if (val >= 1e9) return `$${(val / 1e9).toFixed(1)}B`;
  if (val >= 1e6) return `$${(val / 1e6).toFixed(1)}M`;
  if (val >= 1e3) return `$${(val / 1e3).toFixed(0)}K`;
  return `$${val.toFixed(0)}`;
};

const formatNumber = (val: number | null) => {
  if (!val) return '—';
  return val.toLocaleString();
};

// Horizontal bar component
const HorizontalBar = ({ value, max, color, label, sublabel }: {
  value: number; max: number; color: string; label: string; sublabel?: string;
}) => (
  <div className="group cursor-pointer">
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium truncate">{label}</span>
      <span className="text-sm font-mono">{value}</span>
    </div>
    <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
    {sublabel && <span className="text-xs text-[var(--color-text-muted)]">{sublabel}</span>}
  </div>
);

// Donut chart component
const DonutChart = ({ segments, size = 120, strokeWidth = 16 }: {
  segments: { value: number; color: string; label: string }[];
  size?: number;
  strokeWidth?: number;
}) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  let offset = 0;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {segments.map((segment, i) => {
          const segmentLength = (segment.value / total) * circumference;
          const currentOffset = offset;
          offset += segmentLength;
          return (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference - segmentLength}`}
              strokeDashoffset={-currentOffset}
              className="transition-all duration-500"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold">{formatNumber(total)}</div>
          <div className="text-xs text-[var(--color-text-muted)]">Total</div>
        </div>
      </div>
    </div>
  );
};

// Stat card component
const StatCard = ({ label, value, sublabel, icon: Icon, color, href }: {
  label: string; value: string | number; sublabel?: string;
  icon: any; color: string; href?: string;
}) => {
  const content = (
    <div className={`p-4 rounded-xl bg-gradient-to-br ${color} border border-white/10 ${href ? 'hover:scale-[1.02] cursor-pointer' : ''} transition-transform`}>
      <div className="flex items-start justify-between mb-2">
        <Icon className="w-5 h-5 opacity-80" />
        {href && <ArrowUpRight className="w-4 h-4 opacity-50" />}
      </div>
      <div className="text-2xl font-bold font-mono">{value}</div>
      <div className="text-sm opacity-80">{label}</div>
      {sublabel && <div className="text-xs opacity-60 mt-1">{sublabel}</div>}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
};

export default function InsightsPage() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/insights');
      const json = await res.json();
      setData(json);
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to fetch insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    // Simulate sync - in production this would call a real sync endpoint
    await new Promise(r => setTimeout(r, 2000));
    await fetchInsights();
    setSyncing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-turquoise-500)] mx-auto mb-4" />
          <p className="text-[var(--color-text-muted)]">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview } = data;

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 pb-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-display)]">
            <span className="gradient-text">Market Insights</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            Comprehensive analytics across {formatNumber(Number(overview.total_providers))} providers
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSync && (
            <span className="text-xs text-[var(--color-text-muted)]">
              Last updated: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white hover:bg-[var(--color-turquoise-600)] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
        </div>
      </div>

      {/* Overview Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <StatCard
          label="GREEN Targets"
          value={formatNumber(Number(overview.green_count))}
          icon={Target}
          color="from-emerald-500/20 to-emerald-600/10 text-emerald-500"
          href="/green"
        />
        <StatCard
          label="YELLOW Watch"
          value={formatNumber(Number(overview.yellow_count))}
          icon={AlertTriangle}
          color="from-amber-500/20 to-amber-600/10 text-amber-500"
          href="/targets?classification=YELLOW"
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(Number(overview.total_revenue))}
          sublabel={`${overview.with_financials} with data`}
          icon={DollarSign}
          color="from-blue-500/20 to-blue-600/10 text-blue-500"
        />
        <StatCard
          label="Avg Score"
          value={overview.avg_score || '—'}
          icon={Activity}
          color="from-purple-500/20 to-purple-600/10 text-purple-500"
        />
        <StatCard
          label="Avg ADC"
          value={overview.avg_adc || '—'}
          icon={Users}
          color="from-pink-500/20 to-pink-600/10 text-pink-500"
        />
        <StatCard
          label="States Covered"
          value={overview.total_states}
          sublabel={`${overview.total_counties} counties`}
          icon={MapPin}
          color="from-cyan-500/20 to-cyan-600/10 text-cyan-500"
          href="/map"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4">

        {/* Classification Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-12 md:col-span-6 lg:col-span-3"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Classification
              </h3>
              <Link href="/targets" className="text-xs text-[var(--color-turquoise-500)] hover:underline">
                View All →
              </Link>
            </div>
            <div className="flex items-center justify-center">
              <DonutChart
                segments={[
                  { value: Number(overview.green_count), color: '#10b981', label: 'GREEN' },
                  { value: Number(overview.yellow_count), color: '#f59e0b', label: 'YELLOW' },
                  { value: Number(overview.red_count), color: '#ef4444', label: 'RED' },
                ]}
              />
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {[
                { label: 'GREEN', count: overview.green_count, color: '#10b981' },
                { label: 'YELLOW', count: overview.yellow_count, color: '#f59e0b' },
                { label: 'RED', count: overview.red_count, color: '#ef4444' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ background: item.color }} />
                  <div className="text-xs text-[var(--color-text-muted)]">{item.label}</div>
                  <div className="text-sm font-mono font-semibold">{item.count}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* CON vs Non-CON */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-12 md:col-span-6 lg:col-span-3"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              CON Analysis
            </h3>
            <div className="space-y-4">
              {data.conVsNonCon.map((item: any) => (
                <div key={item.category}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{item.category}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500">
                      {item.green_rate}% GREEN
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]">
                      <div className="text-lg font-bold font-mono">{item.total}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Total</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]">
                      <div className="text-lg font-bold font-mono text-emerald-500">{item.green_count}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">GREEN</div>
                    </div>
                    <div className="p-2 rounded-lg bg-[var(--color-bg-tertiary)]">
                      <div className="text-lg font-bold font-mono">{item.avg_score}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Avg Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 lg:col-span-6"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Top States by GREEN Targets
              </h3>
              <Link href="/map" className="text-xs text-[var(--color-turquoise-500)] hover:underline">
                View Map →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {data.stateBreakdown.slice(0, 8).map((state: any) => {
                const maxGreen = Math.max(...data.stateBreakdown.slice(0, 8).map((s: any) => Number(s.green_count)));
                return (
                  <Link
                    key={state.state}
                    href={`/market/${state.state.toLowerCase()}`}
                    className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{state.state}</span>
                        {state.is_con_state && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">CON</span>
                        )}
                      </div>
                      <span className="text-xs text-[var(--color-text-muted)]">{state.total} total</span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-border)] rounded-full overflow-hidden mb-1">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${(Number(state.green_count) / maxGreen) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-emerald-500 font-mono">{state.green_count} GREEN</span>
                      <span className="text-amber-500 font-mono">{state.yellow_count} YLW</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ADC Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-12 md:col-span-6 lg:col-span-4"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              ADC Distribution
            </h3>
            <div className="space-y-3">
              {data.adcBuckets.map((bucket: any) => {
                const maxCount = Math.max(...data.adcBuckets.map((b: any) => Number(b.total)));
                const isTarget = bucket.adc_range.includes('Target');
                return (
                  <HorizontalBar
                    key={bucket.adc_range}
                    value={Number(bucket.total)}
                    max={maxCount}
                    color={isTarget ? '#10b981' : 'var(--color-turquoise-500)'}
                    label={bucket.adc_range}
                    sublabel={`${bucket.green_count} GREEN`}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Ownership Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 md:col-span-6 lg:col-span-4"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Building2 className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              Ownership Types
            </h3>
            <div className="space-y-3">
              {data.ownershipBreakdown.slice(0, 5).map((item: any) => {
                const maxCount = Math.max(...data.ownershipBreakdown.map((o: any) => Number(o.total)));
                return (
                  <HorizontalBar
                    key={item.ownership_type}
                    value={Number(item.total)}
                    max={maxCount}
                    color={item.ownership_type === 'Non-Profit' ? '#10b981' : '#8b5cf6'}
                    label={item.ownership_type}
                    sublabel={`${item.green_count} GREEN • Avg Score: ${item.avg_score}`}
                  />
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Quality Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-12 md:col-span-6 lg:col-span-4"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Star className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              CAHPS Star Ratings
            </h3>
            <div className="space-y-3">
              {data.qualityMetrics.map((item: any) => {
                const maxCount = Math.max(...data.qualityMetrics.map((q: any) => Number(q.total)));
                const stars = Number(item.star_rating);
                return (
                  <div key={item.star_rating} className="flex items-center gap-3">
                    <div className="w-16 text-sm font-mono flex items-center gap-1">
                      {stars}
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-amber-400"
                          style={{ width: `${(Number(item.total) / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-12 text-right text-sm font-mono">{item.total}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-[var(--color-border)] text-center">
              <span className="text-xs text-[var(--color-text-muted)]">
                {overview.with_star_rating} of {overview.total_providers} have ratings
              </span>
            </div>
          </div>
        </motion.div>

        {/* Revenue Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-12 md:col-span-6 lg:col-span-6"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              Revenue Distribution
            </h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {data.revenueDistribution.map((item: any) => (
                <div key={item.revenue_range} className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                  <div className="text-sm font-medium mb-1">{item.revenue_range}</div>
                  <div className="text-xl font-bold font-mono">{item.total}</div>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className="text-emerald-500">{item.green_count} GREEN</span>
                    <span className="text-[var(--color-text-muted)]">
                      {item.profitable_count} profitable
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Demographics Correlation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="col-span-12 md:col-span-6 lg:col-span-6"
        >
          <div className="glass-card rounded-2xl p-5 h-full">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              Demographics & Performance
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {data.demographicsCorrelation.map((item: any) => (
                <div key={item.aging_pct_range} className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                  <div className="text-sm font-medium mb-2">{item.aging_pct_range}</div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold font-mono text-emerald-500">{item.green_count}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">GREEN</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold font-mono">{item.avg_score}</div>
                      <div className="text-[10px] text-[var(--color-text-muted)]">Avg Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Data Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-12"
        >
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-semibold flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              Data Coverage & Quality
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { label: 'Total Providers', value: overview.total_providers, pct: 100 },
                { label: 'With Financials', value: overview.with_financials, pct: Math.round((overview.with_financials / overview.total_providers) * 100) },
                { label: 'With NPI', value: overview.with_npi, pct: Math.round((overview.with_npi / overview.total_providers) * 100) },
                { label: 'Star Ratings', value: overview.with_star_rating, pct: Math.round((overview.with_star_rating / overview.total_providers) * 100) },
                { label: 'Geocoded', value: overview.geocoded, pct: Math.round((overview.geocoded / overview.total_providers) * 100) },
                { label: 'States', value: overview.total_states, pct: Math.round((overview.total_states / 55) * 100) },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="relative w-16 h-16 mx-auto mb-2">
                    <svg className="w-16 h-16 transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-[var(--color-border)]"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray={`${(item.pct / 100) * 176} 176`}
                        className="text-[var(--color-turquoise-500)]"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-bold">{item.pct}%</span>
                    </div>
                  </div>
                  <div className="text-lg font-bold font-mono">{formatNumber(Number(item.value))}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
