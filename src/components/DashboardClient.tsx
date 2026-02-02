'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target, AlertTriangle, XCircle, Shield, TrendingUp, MapPin,
  Building2, Users, ChevronRight, ArrowUpRight, Zap, Activity,
  BarChart3, PieChart, Map, DollarSign, Star, Filter, X, Handshake,
  Sparkles, Scale, PiggyBank, ChevronDown, FileText, Clock,
  TrendingDown, AlertCircle, CheckCircle2, Info, Briefcase,
  Calculator, LineChart, Target as TargetIcon, Award, Lightbulb,
  BookOpen, Eye, Layers, Grid3X3, ArrowRight, ExternalLink,
  Percent, Hash, Building, Heart, Stethoscope, BadgeCheck,
  ThumbsUp, ThumbsDown, Minus, Brain, Compass, Rocket
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
  endemicStats?: any;
  pipelineStats?: any;
}

// Expandable Section Component
function ExpandableSection({
  title,
  icon: Icon,
  defaultOpen = false,
  badge,
  variant = 'default',
  children
}: {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  badge?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantColors = {
    default: 'border-[var(--color-border)]',
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    danger: 'border-red-500/30',
    info: 'border-[var(--color-turquoise-500)]/30'
  };

  return (
    <div className={`rounded-xl border ${variantColors[variant]} bg-[var(--color-bg-secondary)]/50 overflow-hidden`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--color-bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[var(--color-turquoise-500)]" />
          <span className="font-semibold">{title}</span>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)]">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 pt-0 border-t border-[var(--color-border)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Detailed Metric Card
function DetailedMetricCard({
  label,
  value,
  subtext,
  trend,
  details,
  icon: Icon
}: {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  details?: string;
  icon?: any;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div
      className="p-4 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-all cursor-pointer relative group"
      onClick={() => details && setShowDetails(!showDetails)}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-[var(--color-text-muted)] mb-1 flex items-center gap-2">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {label}
          </div>
          <div className="text-2xl font-bold font-mono">{value}</div>
          {subtext && <div className="text-[11px] text-[var(--color-turquoise-500)] mt-1">{subtext}</div>}
        </div>
        {trend && (
          <div className={`p-1.5 rounded-lg ${
            trend === 'up' ? 'bg-emerald-500/20 text-emerald-500' :
            trend === 'down' ? 'bg-red-500/20 text-red-500' :
            'bg-gray-500/20 text-gray-500'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-4 h-4" /> :
             trend === 'down' ? <TrendingDown className="w-4 h-4" /> :
             <Minus className="w-4 h-4" />}
          </div>
        )}
      </div>
      {details && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Info className="w-3.5 h-3.5 text-[var(--color-text-muted)]" />
        </div>
      )}
      <AnimatePresence>
        {showDetails && details && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]"
          >
            {details}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Score Indicator with drill-down
function ScoreIndicator({
  score,
  label,
  maxScore = 100,
  breakdown
}: {
  score: number;
  label: string;
  maxScore?: number;
  breakdown?: { name: string; value: number; weight: number }[];
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const percentage = (score / maxScore) * 100;
  const color = percentage >= 70 ? '#10b981' : percentage >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative">
      <div
        className="flex items-center gap-3 p-3 rounded-lg bg-[var(--color-bg-tertiary)] cursor-pointer hover:bg-[var(--color-bg-hover)] transition-colors"
        onClick={() => breakdown && setShowBreakdown(!showBreakdown)}
      >
        <div className="relative w-12 h-12">
          <svg className="w-12 h-12 transform -rotate-90">
            <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" strokeWidth="4" className="text-[var(--color-border)]" />
            <circle
              cx="24" cy="24" r="20" fill="none" stroke={color} strokeWidth="4"
              strokeDasharray={`${percentage * 1.256} 125.6`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}</span>
        </div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-[var(--color-text-muted)]">
            {percentage >= 70 ? 'Strong' : percentage >= 40 ? 'Moderate' : 'Needs Attention'}
          </div>
        </div>
        {breakdown && <ChevronDown className={`w-4 h-4 ml-auto transition-transform ${showBreakdown ? 'rotate-180' : ''}`} />}
      </div>
      <AnimatePresence>
        {showBreakdown && breakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 p-3 rounded-lg bg-[var(--color-bg-tertiary)] space-y-2"
          >
            {breakdown.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-[var(--color-text-secondary)]">{item.name}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 rounded-full bg-[var(--color-border)]">
                    <div
                      className="h-full rounded-full bg-[var(--color-turquoise-500)]"
                      style={{ width: `${item.value}%` }}
                    />
                  </div>
                  <span className="font-mono w-8 text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
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
  endemicStats,
  pipelineStats,
}: DashboardProps) {
  const router = useRouter();
  const [expandedPanel, setExpandedPanel] = useState<string | null>(null);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'overview' | 'detailed'>('overview');

  const greenCount = Number(stats.green_count);
  const yellowCount = Number(stats.yellow_count);
  const redCount = Number(stats.red_count);
  const totalCount = Number(stats.total_count);
  const greenConCount = Number(stats.green_con_count);

  const greenRate = ((greenCount / totalCount) * 100).toFixed(1);
  const conCoverage = ((greenConCount / greenCount) * 100).toFixed(0);
  const yellowRate = ((yellowCount / totalCount) * 100).toFixed(1);
  const redRate = ((redCount / totalCount) * 100).toFixed(1);

  // Prepare chart data
  const adcValues = adcDistribution.map((d: any) => Number(d.green_count) || 0);
  const adcMax = Math.max(...adcValues, 1);
  const scoreValues = scoreDistribution.map((d: any) => Number(d.green_count) || 0);
  const scoreMax = Math.max(...scoreValues, 1);

  const topStates = stateStats.slice(0, 6);

  // Calculate advanced metrics
  const avgGreenAdc = stats.avg_green_adc || 0;
  const avgGreenScore = stats.avg_green_score || 0;
  const endemicGreen = endemicStats?.endemic_green || 0;
  const primeCarryBack = endemicStats?.prime_carry_back_targets || 0;
  const totalMarketValue = pipelineStats?.total_market_value_mm || 0;

  return (
    <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
      {/* Enhanced Header with View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-display)]">
            <span className="gradient-text">5-Star Quality Rating Dashboard</span>
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
            {totalCount.toLocaleString()} providers tracked • Real-time CMS data • Quality metrics & compliance tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg bg-[var(--color-bg-tertiary)] p-1">
            <button
              onClick={() => setActiveView('overview')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeView === 'overview'
                  ? 'bg-[var(--color-turquoise-500)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('detailed')}
              className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                activeView === 'detailed'
                  ? 'bg-[var(--color-turquoise-500)] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              Detailed
            </button>
          </div>
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

      {/* Conditional Content Based on Active View */}
      {activeView === 'overview' ? (
        <>
      {/* Executive Summary Section */}
      <ExpandableSection
        title="Executive Summary & Market Overview"
        icon={Briefcase}
        defaultOpen={true}
        badge="Critical Intel"
      >
        <div className="space-y-6">
          {/* Market Narrative */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-[var(--color-turquoise-500)]/5 to-transparent border border-[var(--color-turquoise-500)]/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              Strategic Market Assessment
            </h4>
            <div className="text-sm text-[var(--color-text-secondary)] space-y-3">
              <p>
                <strong className="text-[var(--color-text-primary)]">Current Market Position:</strong> The hospice M&A landscape presents {greenCount.toLocaleString()} actionable acquisition targets out of {totalCount.toLocaleString()} total providers ({greenRate}% opportunity rate). This represents a {greenCount > 500 ? 'robust' : 'selective'} acquisition environment with significant consolidation potential.
              </p>
              <p>
                <strong className="text-[var(--color-text-primary)]">Quality Distribution Analysis:</strong> GREEN-classified providers demonstrate above-average quality metrics across CMS Five-Star domains. The current distribution shows {greenRate}% meeting acquisition criteria, {yellowRate}% requiring monitoring or operational improvement post-acquisition, and {redRate}% presenting elevated risk profiles that may require extensive remediation or should be avoided.
              </p>
              <p>
                <strong className="text-[var(--color-text-primary)]">Strategic Recommendation:</strong> Focus acquisition efforts on Certificate of Need (CON) states where {greenConCount} GREEN targets benefit from regulatory barriers to entry. Endemic (independent single-location) operators represent prime targets with {endemicGreen} identified opportunities, often featuring motivated sellers approaching retirement with operational patterns favorable for owner financing arrangements.
              </p>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <DetailedMetricCard
              label="Total Addressable Market"
              value={`${totalCount.toLocaleString()}`}
              subtext="Active hospice providers"
              icon={Building}
              details="Includes all Medicare-certified hospice providers currently operating in the United States. Data sourced from CMS Provider Enrollment and Certification files, updated quarterly. Market composition: ~65% for-profit, ~30% non-profit, ~5% government-affiliated."
            />
            <DetailedMetricCard
              label="Acquisition-Ready Targets"
              value={greenCount.toLocaleString()}
              subtext={`${greenRate}% of market`}
              trend="up"
              icon={Target}
              details="GREEN classification indicates providers meeting all quality thresholds: Overall Star Rating ≥4, no Special Focus Facility designation, no recent survey enforcement actions, stable ADC trajectory, and favorable ownership patterns. These represent low-risk acquisition candidates."
            />
            <DetailedMetricCard
              label="Estimated Market Value"
              value={`$${totalMarketValue}M`}
              subtext="GREEN segment"
              icon={DollarSign}
              details="Conservative market valuation based on ADC × revenue multiple methodology. Assumes average per-patient-day reimbursement of $195, 85% Medicare mix, and 3.5-4.5x EBITDA multiple typical for quality hospice transactions. Actual valuations vary by geography, payer mix, and quality metrics."
            />
            <DetailedMetricCard
              label="Prime Seller-Finance Candidates"
              value={primeCarryBack}
              subtext="Owner carry-back likely"
              trend="up"
              icon={Handshake}
              details="Identified through proprietary algorithm analyzing: owner age indicators (LLC formation >15 years), single-location operation, stable quality metrics, no chain affiliation, CON state protection, and operational patterns suggesting approaching retirement. These targets often accept 20-40% seller financing."
            />
          </div>

          {/* Investment Thesis */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
              <h5 className="font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <ThumbsUp className="w-4 h-4" />
                Bull Case Factors
              </h5>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Demographic Tailwinds:</strong> 10,000 Americans turning 65 daily through 2030, driving sustained hospice demand growth of 7-9% annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Regulatory Stability:</strong> Medicare hospice benefit well-established since 1982 with consistent reimbursement, CMS rate increases averaging 2-3% annually</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Fragmented Market:</strong> ~5,000 providers with top 10 chains controlling only ~25% market share, significant roll-up opportunity remains</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Recurring Revenue:</strong> Average length of stay ~90 days with predictable per diem reimbursement model, minimal bad debt exposure</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Low Capital Intensity:</strong> Asset-light model with care delivered in patient homes, minimal facility investment required</span>
                </li>
              </ul>
            </div>
            <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
              <h5 className="font-semibold text-red-400 mb-3 flex items-center gap-2">
                <ThumbsDown className="w-4 h-4" />
                Bear Case Factors & Risk Mitigation
              </h5>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Reimbursement Risk:</strong> CMS payment reform proposals could impact margins; mitigate through diversified payer mix and operational efficiency</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Compliance Scrutiny:</strong> OIG has increased hospice fraud investigations; mitigate through rigorous due diligence and quality-first acquisition criteria</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Labor Market Challenges:</strong> RN and aide shortages affecting all healthcare; mitigate through geographic focus and retention programs</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>Integration Complexity:</strong> Culture and staff retention critical; mitigate through measured integration approach and incentive alignment</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <span><strong>CAP Liability:</strong> Aggregate payment cap can create year-end exposure; mitigate through LOS management and ADC growth strategies</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-3 lg:gap-4 mt-6">

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

        {/* Owner Carry-Back Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 lg:col-span-3"
        >
          <Link href="/owner-carryback" className="block h-full">
            <div className="h-full p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 to-emerald-600/5 border border-teal-500/20 hover:border-teal-500/40 hover:shadow-lg hover:shadow-teal-500/10 transition-all group cursor-pointer">
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-xl bg-teal-500/20">
                  <Handshake className="w-5 h-5 text-teal-400" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-teal-500/50 group-hover:text-teal-500 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-teal-400 font-mono">
                {endemicStats?.prime_carry_back_targets || 0}
              </div>
              <div className="text-sm text-[var(--color-text-muted)] mt-0.5">Owner Carry-Back</div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400">Prime Targets</span>
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Quick Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="col-span-12 lg:col-span-6"
        >
          <div className="h-full p-4 rounded-2xl glass-card">
            <div className="grid grid-cols-4 gap-3 h-full">
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
              <Link href="/owner-carryback" className="p-3 rounded-xl bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors cursor-pointer">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Endemic</div>
                <div className="text-xl font-bold font-mono text-teal-400">{endemicStats?.endemic_green || 0}</div>
                <div className="text-[10px] text-teal-400">Independent GREEN</div>
              </Link>
              <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                <div className="text-xs text-[var(--color-text-muted)] mb-1">Est. Value</div>
                <div className="text-xl font-bold font-mono">${pipelineStats?.total_market_value_mm || 0}M</div>
                <div className="text-[10px] text-[var(--color-text-muted)]">GREEN market</div>
              </div>
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

      {/* Deep Dive Sections */}
      <div className="mt-6 space-y-4">

        {/* Rating System Deep Dive */}
        <ExpandableSection
          title="Classification Methodology & Rating System"
          icon={Award}
          badge="CMS Aligned"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-emerald-500" />
                  </div>
                  <h5 className="font-semibold text-emerald-400">GREEN Classification</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  Providers meeting all quality thresholds representing prime acquisition candidates with minimal remediation requirements.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Overall CMS Star Rating ≥ 4 stars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>No Special Focus Facility (SFF) designation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>No recent survey enforcement actions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Stable or growing ADC trajectory</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Quality scores above 70th percentile</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                  </div>
                  <h5 className="font-semibold text-amber-400">YELLOW Classification</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  Providers with mixed indicators requiring additional due diligence or post-acquisition improvement plans.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Overall CMS Star Rating 2.5-3.5 stars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Some quality metrics below threshold</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>Historical survey issues (resolved)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>ADC fluctuation requiring analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                    <span>May present value-add opportunity</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <h5 className="font-semibold text-red-400">RED Classification</h5>
                </div>
                <p className="text-sm text-[var(--color-text-secondary)] mb-3">
                  Providers with significant concerns requiring extensive remediation or presenting unacceptable acquisition risk.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Overall CMS Star Rating &lt; 2.5 stars</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Active SFF or enforcement status</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Critical survey deficiencies</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Declining ADC trend</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3.5 h-3.5 text-red-500" />
                    <span>Multiple compliance violations</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CMS Quality Domains */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <h5 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                CMS Hospice Quality Reporting Program (HQRP) Domains
              </h5>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <h6 className="text-sm font-medium mb-2">Hospice Care Index (HCI)</h6>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Composite measure evaluating timeliness of care, pain assessment, dyspnea screening, bowel regimen, and comprehensive assessment completion within 5 days.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <h6 className="text-sm font-medium mb-2">CAHPS Hospice Survey</h6>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Family experience measures including communication, respect, emotional support, symptom management, information provision, and overall rating.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <h6 className="text-sm font-medium mb-2">Hospice Visits at End of Life</h6>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Measures evaluating RN/MSW visits in last 3 days of life and visit patterns in final 7 days, reflecting commitment to end-of-life care.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <h6 className="text-sm font-medium mb-2">Utilization Metrics</h6>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Average daily census, length of stay distribution, live discharge rates, and continuous/general inpatient care utilization patterns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* Market Intelligence */}
        <ExpandableSection
          title="Market Intelligence & Competitive Landscape"
          icon={Compass}
          badge="Strategic Intel"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h5 className="font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  Certificate of Need (CON) State Analysis
                </h5>
                <div className="space-y-3">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    CON states require state approval before establishing new hospice operations, creating regulatory barriers that protect existing providers from competition. This makes acquisitions more valuable as they represent the primary market entry strategy.
                  </p>
                  <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                    <h6 className="text-sm font-medium mb-3">Key CON States with GREEN Targets</h6>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex justify-between p-2 rounded bg-[var(--color-bg-secondary)]">
                        <span>Washington</span>
                        <span className="text-emerald-500 font-mono">7 GREEN</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-[var(--color-bg-secondary)]">
                        <span>Oregon</span>
                        <span className="text-emerald-500 font-mono">CON Protected</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-[var(--color-bg-secondary)]">
                        <span>Montana</span>
                        <span className="text-emerald-500 font-mono">CON Protected</span>
                      </div>
                      <div className="flex justify-between p-2 rounded bg-[var(--color-bg-secondary)]">
                        <span>Hawaii</span>
                        <span className="text-emerald-500 font-mono">CON Protected</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400">
                      <strong>Strategic Value:</strong> CON protection typically supports 15-25% premium valuations due to competitive moat and limited market entry alternatives.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="font-semibold mb-4 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  Ownership Structure Analysis
                </h5>
                <div className="space-y-3">
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Understanding ownership patterns helps identify motivated sellers and assess integration complexity. Endemic (single-location independent) operators often present the best owner carry-back opportunities.
                  </p>
                  <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                    <h6 className="text-sm font-medium mb-3">Ownership Distribution</h6>
                    <div className="space-y-2">
                      {ownershipStats.map((o: any) => (
                        <div key={o.type} className="flex items-center justify-between p-2 rounded bg-[var(--color-bg-secondary)]">
                          <span className="text-sm">{o.type || 'Other'}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-emerald-500 font-mono">{o.green_count} GREEN</span>
                            <span className="text-xs text-[var(--color-text-muted)]">{o.total_count} total</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-teal-500/5 border border-teal-500/20">
                    <p className="text-xs text-teal-400">
                      <strong>Opportunity Focus:</strong> Endemic GREEN providers represent {endemicGreen} targets with higher likelihood of seller financing due to owner retirement patterns and business transition preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Market Size & Growth */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <h5 className="font-semibold mb-4 flex items-center gap-2">
                <LineChart className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Hospice Industry Market Dynamics
              </h5>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Total US Market</div>
                  <div className="text-xl font-bold font-mono">$26B+</div>
                  <div className="text-[10px] text-[var(--color-turquoise-500)]">Annual Medicare spend</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Growth Rate</div>
                  <div className="text-xl font-bold font-mono">7-9%</div>
                  <div className="text-[10px] text-[var(--color-turquoise-500)]">Annual CAGR</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Fragmentation</div>
                  <div className="text-xl font-bold font-mono">~5,000</div>
                  <div className="text-[10px] text-[var(--color-turquoise-500)]">Active providers</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Top 10 Share</div>
                  <div className="text-xl font-bold font-mono">~25%</div>
                  <div className="text-[10px] text-[var(--color-turquoise-500)]">Consolidation opportunity</div>
                </div>
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* Acquisition Strategies */}
        <ExpandableSection
          title="Acquisition Strategies & Deal Structures"
          icon={Handshake}
          badge="Playbooks"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20">
                <h5 className="font-semibold text-teal-400 mb-3 flex items-center gap-2">
                  <Handshake className="w-4 h-4" />
                  Owner Carry-Back Strategy
                </h5>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  Seller financing (owner carry-back) reduces capital requirements and aligns seller interests with successful transition. Optimal for endemic operators approaching retirement.
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <h6 className="text-sm font-medium mb-2">Ideal Candidate Profile</h6>
                    <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                      <li>• Single-location independent operator</li>
                      <li>• LLC formation 15+ years ago</li>
                      <li>• Owner-operator in clinical/admin role</li>
                      <li>• Stable quality metrics (GREEN classification)</li>
                      <li>• CON state location preferred</li>
                      <li>• No chain affiliation or recent sales attempts</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <h6 className="text-sm font-medium mb-2">Typical Structure</h6>
                    <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                      <li>• 60-80% cash at close</li>
                      <li>• 20-40% seller note (5-7 year term)</li>
                      <li>• Interest rate: Prime + 1-2%</li>
                      <li>• Earnout based on ADC/quality retention</li>
                      <li>• Management transition support (6-12 months)</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/20">
                <h5 className="font-semibold text-purple-400 mb-3 flex items-center gap-2">
                  <Rocket className="w-4 h-4" />
                  Platform Build Strategy
                </h5>
                <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                  For investors seeking scale, platform building involves acquiring a strong initial asset then executing bolt-on acquisitions to create regional density.
                </p>
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <h6 className="text-sm font-medium mb-2">Platform Anchor Criteria</h6>
                    <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                      <li>• ADC 50+ with growth capacity</li>
                      <li>• Strong management team to retain</li>
                      <li>• 5-star or strong 4-star rating</li>
                      <li>• Multi-county service area potential</li>
                      <li>• Back-office scalability</li>
                      <li>• EHR/technology platform in place</li>
                    </ul>
                  </div>
                  <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <h6 className="text-sm font-medium mb-2">Bolt-On Criteria</h6>
                    <ul className="space-y-1 text-xs text-[var(--color-text-secondary)]">
                      <li>• Geographic adjacency to platform</li>
                      <li>• ADC 20-40 (digestible size)</li>
                      <li>• Synergy potential 15-25%</li>
                      <li>• Management not required long-term</li>
                      <li>• Back-office can be consolidated</li>
                      <li>• Referral relationship value</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Valuation Framework */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <h5 className="font-semibold mb-4 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Valuation Framework & Multiples
              </h5>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <h6 className="text-sm font-medium mb-2">Revenue Multiple</h6>
                  <div className="text-2xl font-bold font-mono text-[var(--color-turquoise-500)]">0.8-1.2x</div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                    Trailing 12-month Medicare revenue. Premium for 4+ star rating, CON state, growing ADC. Discount for quality issues or declining census.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <h6 className="text-sm font-medium mb-2">EBITDA Multiple</h6>
                  <div className="text-2xl font-bold font-mono text-[var(--color-turquoise-500)]">3.5-5.5x</div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                    Adjusted EBITDA accounting for owner comp normalization. Higher multiple for scale (ADC 75+), quality, and strategic positioning.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[var(--color-bg-secondary)]">
                  <h6 className="text-sm font-medium mb-2">Per-ADC Value</h6>
                  <div className="text-2xl font-bold font-mono text-[var(--color-turquoise-500)]">$25-45K</div>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-2">
                    Quick valuation proxy. Varies by geography, payer mix, quality metrics, and competitive dynamics in service area.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* Due Diligence Checklist */}
        <ExpandableSection
          title="Due Diligence Framework & Risk Assessment"
          icon={FileText}
          badge="Comprehensive"
        >
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  Clinical & Quality
                </h5>
                <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>CMS quality measure trends (3 years)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>CAHPS survey scores and trajectory</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>State survey history and deficiencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Plans of correction compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Clinical protocols and documentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Medical director qualifications</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  Financial & Operational
                </h5>
                <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>3 years audited financials</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>ADC trends and seasonality</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Payer mix and reimbursement rates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Medicare cap liability exposure</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Cost structure and labor ratios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>HCRIS cost report analysis</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
                <h5 className="font-semibold mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                  Compliance & Legal
                </h5>
                <ul className="space-y-2 text-xs text-[var(--color-text-secondary)]">
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>OIG exclusion list verification</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>State licensure and accreditation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>CON certificate transferability</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Employment agreements and non-competes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Billing compliance review</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border border-[var(--color-border)] flex-shrink-0 mt-0.5" />
                    <span>Pending litigation or investigations</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Risk Matrix */}
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <h5 className="font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Risk Assessment Matrix
              </h5>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left p-2">Risk Category</th>
                      <th className="text-left p-2">GREEN Indicators</th>
                      <th className="text-left p-2">YELLOW Indicators</th>
                      <th className="text-left p-2">RED Indicators</th>
                    </tr>
                  </thead>
                  <tbody className="text-[var(--color-text-secondary)]">
                    <tr className="border-b border-[var(--color-border)]">
                      <td className="p-2 font-medium">Quality Rating</td>
                      <td className="p-2">4-5 stars, stable/improving</td>
                      <td className="p-2">3-3.5 stars, stable</td>
                      <td className="p-2">&lt;3 stars, declining</td>
                    </tr>
                    <tr className="border-b border-[var(--color-border)]">
                      <td className="p-2 font-medium">Survey History</td>
                      <td className="p-2">No deficiencies or minor only</td>
                      <td className="p-2">Some deficiencies, all corrected</td>
                      <td className="p-2">Repeat/serious deficiencies</td>
                    </tr>
                    <tr className="border-b border-[var(--color-border)]">
                      <td className="p-2 font-medium">ADC Trend</td>
                      <td className="p-2">Growing or stable 3+ years</td>
                      <td className="p-2">Flat or slight decline</td>
                      <td className="p-2">Sustained decline &gt;10%</td>
                    </tr>
                    <tr className="border-b border-[var(--color-border)]">
                      <td className="p-2 font-medium">Financial</td>
                      <td className="p-2">EBITDA margin &gt;15%</td>
                      <td className="p-2">EBITDA margin 8-15%</td>
                      <td className="p-2">EBITDA margin &lt;8%</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-medium">Compliance</td>
                      <td className="p-2">Clean OIG, no investigations</td>
                      <td className="p-2">Historical issues, resolved</td>
                      <td className="p-2">Active investigation/exclusion</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </ExpandableSection>
      </div>

        </>
      ) : (
        /* Detailed View */
        <div className="space-y-6">
          {/* Detailed Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <DetailedMetricCard
              label="Total Providers"
              value={totalCount.toLocaleString()}
              subtext="Active hospices"
              icon={Building}
              details="Total Medicare-certified hospice providers tracked in the database."
            />
            <DetailedMetricCard
              label="GREEN Targets"
              value={greenCount.toLocaleString()}
              subtext={`${greenRate}% of market`}
              trend="up"
              icon={Target}
              details="Providers meeting all quality thresholds for acquisition."
            />
            <DetailedMetricCard
              label="YELLOW Watch"
              value={yellowCount.toLocaleString()}
              subtext={`${yellowRate}% of market`}
              icon={AlertTriangle}
              details="Providers with mixed indicators requiring additional due diligence."
            />
            <DetailedMetricCard
              label="RED Flagged"
              value={redCount.toLocaleString()}
              subtext={`${redRate}% of market`}
              trend="down"
              icon={XCircle}
              details="Providers with significant concerns or risk factors."
            />
            <DetailedMetricCard
              label="CON Protected"
              value={greenConCount.toLocaleString()}
              subtext={`${conCoverage}% of GREEN`}
              icon={Shield}
              details="GREEN targets in Certificate of Need states with regulatory barriers."
            />
            <DetailedMetricCard
              label="Endemic GREEN"
              value={endemicGreen.toLocaleString()}
              subtext="Independent operators"
              icon={Heart}
              details="Single-location independent operators - prime for owner carry-back."
            />
          </div>

          {/* Performance Metrics */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl glass-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                GREEN Target Metrics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Avg ADC</div>
                  <div className="text-2xl font-bold font-mono">{avgGreenAdc || '—'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Avg Score</div>
                  <div className="text-2xl font-bold font-mono">{avgGreenScore || '—'}</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Est. Market Value</div>
                  <div className="text-2xl font-bold font-mono">${totalMarketValue}M</div>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-bg-tertiary)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">Carry-Back Targets</div>
                  <div className="text-2xl font-bold font-mono text-teal-400">{primeCarryBack}</div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                ADC Distribution (GREEN)
              </h4>
              <div className="space-y-2">
                {adcDistribution.map((d: any) => (
                  <div key={d.range} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">{d.range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-[var(--color-border)]">
                        <div
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${(Number(d.green_count) / adcMax) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-8 text-right">{d.green_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Score Distribution (GREEN)
              </h4>
              <div className="space-y-2">
                {scoreDistribution.map((d: any) => (
                  <div key={d.range} className="flex items-center justify-between">
                    <span className="text-sm text-[var(--color-text-secondary)]">{d.range}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 rounded-full bg-[var(--color-border)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-turquoise-500)]"
                          style={{ width: `${(Number(d.green_count) / scoreMax) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono w-8 text-right">{d.green_count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* State Rankings */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl glass-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Top States by GREEN Targets
              </h4>
              <div className="space-y-2">
                {stateStats.slice(0, 10).map((state: any, i: number) => (
                  <Link
                    key={state.state}
                    href={`/market/${state.state.toLowerCase()}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-md bg-[var(--color-bg-tertiary)] flex items-center justify-center text-xs font-mono">
                        {i + 1}
                      </span>
                      <span className="font-medium">{state.state}</span>
                      {state.is_con_state && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-500">CON</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm font-mono">
                      <span className="text-emerald-500">{state.green_count}G</span>
                      <span className="text-amber-500">{state.yellow_count}Y</span>
                      <span className="text-red-500">{state.red_count}R</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl glass-card">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[var(--color-turquoise-500)]" />
                Ownership Breakdown
              </h4>
              <div className="space-y-2">
                {ownershipStats.map((o: any) => (
                  <div key={o.type} className="flex items-center justify-between p-2 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <span className="text-sm">{o.type || 'Other'}</span>
                    <div className="flex items-center gap-4 text-sm font-mono">
                      <span className="text-emerald-500">{o.green_count}G</span>
                      <span className="text-amber-500">{o.yellow_count}Y</span>
                      <span className="text-[var(--color-text-muted)]">{o.total} total</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CON vs Non-CON Comparison */}
          <div className="p-4 rounded-2xl glass-card">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Scale className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              CON State vs Non-CON State Comparison
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              {conComparison.map((c: any) => (
                <div key={c.category} className={`p-4 rounded-xl ${c.category === 'CON States' ? 'bg-emerald-500/5 border border-emerald-500/20' : 'bg-[var(--color-bg-tertiary)]'}`}>
                  <h5 className="font-medium mb-3">{c.category}</h5>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xl font-bold font-mono">{c.total}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Total</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold font-mono text-emerald-500">{c.green_count}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">GREEN</div>
                    </div>
                    <div>
                      <div className="text-xl font-bold font-mono">{c.avg_score || '—'}</div>
                      <div className="text-xs text-[var(--color-text-muted)]">Avg Score</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Compact Footer */}
      <div className="mt-6 pt-4 border-t border-[var(--color-border)]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--color-text-muted)]">
          <span>CMS Provider Data • CMS Quality Measures • HCRIS Financials • Census Demographics</span>
          <span>{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} • Real-time Intelligence</span>
        </div>
      </div>
    </div>
  );
}
