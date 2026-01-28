'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, AlertTriangle, XCircle, Shield, TrendingUp, MapPin,
  Building2, Users, ChevronRight, ArrowUpRight, Zap, Activity,
  BarChart3, PieChart, Map, DollarSign, Star, Filter, X
} from 'lucide-react';

interface DashboardProps {
  stats: any;
  stateStats: any[];
  topTargets: any[];
  ownershipStats: any[];
  adcDistribution: any[];
  scoreDistribution: any[];
  mapData: any[];
  conComparison: any[];
}

const MiniBarChart = ({ data, maxValue, color }: { data: number[]; maxValue: number; color: string }) => (
  <div className="flex items-end gap-0.5 h-8">
    {data.map((val, i) => (
      <div
        key={i}
        className="flex-1 rounded-t transition-all duration-300 hover:opacity-80"
        style={{
          height: `${(val / maxValue) * 100}%`,
          background: color,
          minHeight: '2px',
        }}
      />
    ))}
  </div>
);

const CircularProgress = ({ value, max, size = 80, strokeWidth = 6, color }: {
  value: number; max: number; size?: number; strokeWidth?: number; color: string;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        className="text-[var(--color-border)]"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
      />
    </svg>
  );
};

export function DashboardClient({
  stats,
  stateStats,
  topTargets,
  ownershipStats,
  adcDistribution,
  scoreDistribution,
  mapData,
  conComparison,
}: DashboardProps) {
  const router = useRouter();
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const greenCount = Number(stats.green_count);
  const yellowCount = Number(stats.yellow_count);
  const redCount = Number(stats.red_count);
  const totalCount = Number(stats.total_count);
  const greenConCount = Number(stats.green_con_count);

  const greenRate = ((greenCount / totalCount) * 100).toFixed(1);
  const conCoverage = ((greenConCount / greenCount) * 100).toFixed(0);

  // Prepare chart data
  const adcValues = adcDistribution.map((d: any) => Number(d.green_count) || 0);
  const adcMax = Math.max(...adcValues, 1);
  const scoreValues = scoreDistribution.map((d: any) => Number(d.green_count) || 0);
  const scoreMax = Math.max(...scoreValues, 1);

  const topStates = stateStats.slice(0, 6);

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
      {/* Compact Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-display)]">
            <span className="gradient-text">Command Center</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {totalCount.toLocaleString()} providers • Live data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm"
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Advanced Search</span>
          </Link>
          <Link
            href="/top-10"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-turquoise-500)] text-white hover:bg-[var(--color-turquoise-600)] transition-colors text-sm font-medium"
          >
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Top 10</span>
          </Link>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-3 lg:gap-4">

        {/* === ROW 1: Signal Cards === */}

        {/* GREEN - Large */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-6 lg:col-span-3"
        >
          <Link href="/green" className="block h-full">
            <div className="h-full p-4 lg:p-5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/10 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-xl bg-emerald-500/20">
                  <Target className="w-5 h-5 text-emerald-500" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-500/50 group-hover:text-emerald-500 transition-colors" />
              </div>
              <div className="text-3xl lg:text-4xl font-bold text-emerald-500 font-mono">
                {greenCount}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] mt-1">GREEN Targets</div>
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20">{greenRate}% of total</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* YELLOW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="col-span-6 lg:col-span-2"
        >
          <Link href="/targets?classification=YELLOW" className="block h-full">
            <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 hover:border-amber-500/40 transition-all group cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-[var(--color-text-muted)]">YELLOW</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-amber-500 font-mono">
                {yellowCount.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-2">Watch List</div>
            </div>
          </Link>
        </motion.div>

        {/* RED */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-6 lg:col-span-2"
        >
          <Link href="/targets?classification=RED" className="block h-full">
            <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-red-500/10 to-red-600/5 border border-red-500/20 hover:border-red-500/40 transition-all group cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-xs text-[var(--color-text-muted)]">RED</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-red-500 font-mono">
                {redCount.toLocaleString()}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-2">Flagged</div>
            </div>
          </Link>
        </motion.div>

        {/* CON Protected */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="col-span-6 lg:col-span-2"
        >
          <Link href="/targets?classification=GREEN&conStateOnly=true" className="block h-full">
            <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/5 border border-[var(--color-turquoise-500)]/20 hover:border-[var(--color-turquoise-500)]/40 transition-all group cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                <span className="text-xs text-[var(--color-text-muted)]">CON</span>
              </div>
              <div className="text-2xl lg:text-3xl font-bold text-[var(--color-turquoise-500)] font-mono">
                {greenConCount}
              </div>
              <div className="text-xs text-[var(--color-text-muted)] mt-2">{conCoverage}% of GREEN</div>
            </div>
          </Link>
        </motion.div>

        {/* Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-3"
        >
          <div className="h-full p-4 rounded-2xl glass-card">
            <div className="grid grid-cols-2 gap-3 h-full">
              <Link href="/search?minAdc=20&maxAdc=60" className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Avg ADC</div>
                <div className="text-xl font-bold font-mono">{stats.avg_green_adc || '—'}</div>
                <div className="text-[10px] text-[var(--color-turquoise-500)]">GREEN avg</div>
              </Link>
              <Link href="/green" className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Avg Score</div>
                <div className="text-xl font-bold font-mono">{stats.avg_green_score || '—'}</div>
                <div className="text-[10px] text-[var(--color-turquoise-500)]">GREEN avg</div>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* === ROW 2: Charts & Data === */}

        {/* ADC Distribution Mini Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="col-span-6 lg:col-span-2"
        >
          <Link href="/search" className="block h-full">
            <div className="h-full p-4 rounded-2xl glass-card hover:border-[var(--glass-hover-border)] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">ADC Dist.</span>
                <BarChart3 className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </div>
              <MiniBarChart data={adcValues} maxValue={adcMax} color="var(--color-turquoise-500)" />
              <div className="flex justify-between mt-2 text-[10px] text-[var(--color-text-muted)]">
                <span>0-20</span>
                <span>100+</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Score Distribution Mini Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="col-span-6 lg:col-span-2"
        >
          <Link href="/search" className="block h-full">
            <div className="h-full p-4 rounded-2xl glass-card hover:border-[var(--glass-hover-border)] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-[var(--color-text-muted)]">Score Dist.</span>
                <Activity className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
              </div>
              <MiniBarChart data={scoreValues} maxValue={scoreMax} color="#10b981" />
              <div className="flex justify-between mt-2 text-[10px] text-[var(--color-text-muted)]">
                <span>0-30</span>
                <span>85+</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Top States */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="col-span-12 lg:col-span-4 row-span-2"
        >
          <div className="h-full p-4 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Top Markets</span>
              <Link href="/map" className="text-xs text-[var(--color-turquoise-500)] hover:underline flex items-center gap-1">
                View Map <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1">
              {topStates.map((state: any, i: number) => (
                <Link
                  key={state.state}
                  href={`/market/${state.state.toLowerCase()}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer group"
                  onMouseEnter={() => setHoveredState(state.state)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xs font-mono">
                      {i + 1}
                    </span>
                    <span className="font-medium text-sm">{state.state}</span>
                    {state.is_con_state && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">CON</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <span className="text-xs font-mono text-emerald-500">{state.green_count}G</span>
                      <span className="text-xs font-mono text-amber-500">{state.yellow_count}Y</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top Targets Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-12 lg:col-span-4 row-span-2"
        >
          <div className="h-full p-4 rounded-2xl glass-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold">Top GREEN Targets</span>
              <Link href="/green" className="text-xs text-[var(--color-turquoise-500)] hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-1">
              {topTargets.map((provider: any, i: number) => (
                <Link
                  key={provider.ccn}
                  href={`/provider/${provider.ccn}`}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-emerald-500">{i + 1}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate max-w-[180px]">{provider.provider_name}</div>
                      <div className="text-[11px] text-[var(--color-text-muted)] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {provider.city}, {provider.state}
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold font-mono text-emerald-500">{provider.overall_score}</div>
                    <div className="text-[10px] text-[var(--color-text-muted)]">ADC: {provider.estimated_adc || '—'}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Classification Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="col-span-6 lg:col-span-2"
        >
          <Link href="/targets" className="block h-full">
            <div className="h-full p-4 rounded-2xl glass-card hover:border-[var(--glass-hover-border)] transition-all cursor-pointer">
              <div className="text-xs font-medium text-[var(--color-text-muted)] mb-3">Classification</div>
              <div className="relative flex items-center justify-center">
                <CircularProgress
                  value={greenCount}
                  max={totalCount}
                  size={70}
                  strokeWidth={8}
                  color="#10b981"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold font-mono">{greenRate}%</span>
                </div>
              </div>
              <div className="text-center text-[10px] text-[var(--color-text-muted)] mt-2">GREEN Rate</div>
            </div>
          </Link>
        </motion.div>

        {/* Ownership Mix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-6 lg:col-span-2"
        >
          <Link href="/search" className="block h-full">
            <div className="h-full p-4 rounded-2xl glass-card hover:border-[var(--glass-hover-border)] transition-all cursor-pointer">
              <div className="text-xs font-medium text-[var(--color-text-muted)] mb-2">Ownership</div>
              <div className="space-y-1.5">
                {ownershipStats.slice(0, 3).map((o: any) => (
                  <div key={o.type} className="flex items-center justify-between">
                    <span className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-[80px]">
                      {o.type?.replace('Non-Profit', 'NP').replace('For-Profit', 'FP') || 'Other'}
                    </span>
                    <span className="text-[11px] font-mono text-emerald-500">{o.green_count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Link>
        </motion.div>

        {/* === ROW 3: Quick Actions === */}

        {/* Washington Focus */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="col-span-6 lg:col-span-3"
        >
          <Link href="/market/wa" className="block h-full">
            <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/5 border border-purple-500/20 hover:border-purple-500/40 transition-all group cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-semibold">Washington</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">Focus Market</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold font-mono text-purple-500">7</span>
                <span className="text-xs text-[var(--color-text-muted)]">GREEN targets</span>
              </div>
              <div className="text-[11px] text-[var(--color-text-muted)] mt-1">CON-protected • High priority</div>
            </div>
          </Link>
        </motion.div>

        {/* Oregon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="col-span-6 lg:col-span-3"
        >
          <Link href="/market/or" className="block h-full">
            <div className="h-full p-4 rounded-2xl glass-card hover:border-[var(--glass-hover-border)] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  <span className="text-sm font-semibold">Oregon</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">CON</span>
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">Adjacent market opportunity</div>
            </div>
          </Link>
        </motion.div>

        {/* California */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="col-span-6 lg:col-span-3"
        >
          <Link href="/market/ca" className="block h-full">
            <div className="h-full p-4 rounded-2xl glass-card hover:border-[var(--glass-hover-border)] transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-semibold">California</span>
                </div>
              </div>
              <div className="text-xs text-[var(--color-text-muted)]">Largest market by volume</div>
            </div>
          </Link>
        </motion.div>

        {/* Map Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="col-span-6 lg:col-span-3"
        >
          <Link href="/map" className="block h-full">
            <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/5 border border-[var(--color-turquoise-500)]/20 hover:border-[var(--color-turquoise-500)]/40 transition-all cursor-pointer flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Map className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  <span className="text-sm font-semibold">Interactive Map</span>
                </div>
                <div className="text-xs text-[var(--color-text-muted)]">View all locations</div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-[var(--color-turquoise-500)]" />
            </div>
          </Link>
        </motion.div>

      </div>

      {/* Compact Footer */}
      <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
          <span>CMS Provider Data • Census Demographics • HCRIS Financials</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}
