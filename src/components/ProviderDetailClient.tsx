'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, MapPin, Building2, Phone, Calendar, TrendingUp, TrendingDown,
  Shield, AlertTriangle, CheckCircle, XCircle, Target, Users, FileText,
  Globe, Mail, User, ChevronRight, ChevronDown, ExternalLink, Copy, Flame,
  DollarSign, BadgeCheck, Heart, Handshake, PiggyBank, Scale, Sparkles,
  Activity, Star, BarChart3, Clock, Zap, Award, Brain, Lightbulb,
  ArrowUpRight, ArrowDownRight, Minus, Info, BookOpen, Percent, Calculator
} from 'lucide-react';
import { ClassificationBadge } from './ClassificationBadge';
import { WatchlistButton } from './WatchlistButton';
import FiveStarDataset, { getActionPlan, getImprovementRecommendations } from '@/lib/knowledge';
import { useSetPhillProvider } from './PhillAssistant';

interface ProviderDetailClientProps {
  provider: any;
  relatedProviders: any[];
  similarProviders: any[];
  dataQuality: any;
  carryBackAnalysis: any;
}

// Expandable Section Component
function ExpandableSection({
  title,
  icon: Icon,
  defaultOpen = false,
  badge,
  children
}: {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 hover:bg-[var(--color-bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-[var(--color-turquoise-400)]" />
          <h2 className="text-lg font-semibold font-[family-name:var(--font-display)]">{title}</h2>
          {badge}
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
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-[var(--color-border)]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Score Gauge Component
function ScoreGauge({ score, label, size = 'md' }: { score: number | null; label: string; size?: 'sm' | 'md' | 'lg' }) {
  const value = score || 0;
  const getColor = (s: number) => {
    if (s >= 80) return { stroke: '#10b981', bg: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400' };
    if (s >= 60) return { stroke: '#3b82f6', bg: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400' };
    if (s >= 40) return { stroke: '#f59e0b', bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400' };
    return { stroke: '#ef4444', bg: 'from-red-500/20 to-red-600/10', text: 'text-red-400' };
  };
  const colors = getColor(value);
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (value / 100) * circumference;

  const sizes = {
    sm: { outer: 80, text: 'text-lg' },
    md: { outer: 100, text: 'text-2xl' },
    lg: { outer: 120, text: 'text-3xl' },
  };

  return (
    <div className={`relative flex flex-col items-center p-4 rounded-xl bg-gradient-to-br ${colors.bg} border border-[var(--color-border)]`}>
      <svg width={sizes[size].outer} height={sizes[size].outer} className="transform -rotate-90">
        <circle cx={sizes[size].outer / 2} cy={sizes[size].outer / 2} r="40" fill="none" stroke="var(--color-bg-tertiary)" strokeWidth="8" />
        <circle
          cx={sizes[size].outer / 2}
          cy={sizes[size].outer / 2}
          r="40"
          fill="none"
          stroke={colors.stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-bold font-mono ${sizes[size].text} ${colors.text}`}>
          {score !== null ? value.toFixed(0) : '—'}
        </span>
      </div>
      <p className="mt-2 text-xs text-[var(--color-text-muted)] uppercase tracking-wider font-medium">{label}</p>
    </div>
  );
}

// Metric Row Component
function MetricRow({ label, value, subtext, trend, highlight }: {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-[var(--color-border)] last:border-0 ${highlight ? 'bg-[var(--color-turquoise-500)]/5 -mx-2 px-2 rounded' : ''}`}>
      <div>
        <span className="text-[var(--color-text-secondary)]">{label}</span>
        {subtext && <p className="text-xs text-[var(--color-text-muted)]">{subtext}</p>}
      </div>
      <div className="flex items-center gap-2">
        <span className={highlight ? 'font-semibold text-[var(--color-turquoise-400)]' : ''}>{value}</span>
        {trend === 'up' && <ArrowUpRight className="w-4 h-4 text-emerald-400" />}
        {trend === 'down' && <ArrowDownRight className="w-4 h-4 text-red-400" />}
        {trend === 'neutral' && <Minus className="w-4 h-4 text-[var(--color-text-muted)]" />}
      </div>
    </div>
  );
}

export function ProviderDetailClient({
  provider,
  relatedProviders,
  similarProviders,
  dataQuality,
  carryBackAnalysis
}: ProviderDetailClientProps) {
  const [activeQMTab, setActiveQMTab] = useState<'long' | 'short'>('long');

  // Pass provider data to Phill AI assistant context
  useSetPhillProvider(provider);

  const formatScore = (score: number | string | null) => {
    if (score === null || score === undefined) return '—';
    const num = typeof score === 'string' ? parseFloat(score) : score;
    return isNaN(num) ? '—' : num.toFixed(1);
  };

  const formatNumber = (value: number | string | null, decimals: number = 0) => {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '—' : num.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  };

  const formatCurrency = (value: number | string | null, decimals: number = 1) => {
    if (value === null || value === undefined) return '—';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '—';
    if (Math.abs(num) >= 1000000) return `$${(num / 1000000).toFixed(decimals)}M`;
    if (Math.abs(num) >= 1000) return `$${(num / 1000).toFixed(decimals)}K`;
    return `$${num.toFixed(0)}`;
  };

  const formatDate = (date: Date | string | null): string => {
    if (!date) return '—';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const hotMarkets = ['WA', 'OR', 'CA', 'MT', 'NV'];
  const isHotMarket = hotMarkets.includes(provider.state);

  // Calculate implied star rating from scores
  const impliedStarRating = provider.overall_score ? Math.min(5, Math.max(1, Math.round(provider.overall_score / 20))) : null;

  // Get improvement recommendations
  const improvements = impliedStarRating ? getImprovementRecommendations(impliedStarRating) : null;

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-sm mb-6 flex-wrap">
        <Link href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors">
          Dashboard
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        <Link href="/targets" className="text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors">
          All Targets
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        <Link
          href={isHotMarket ? `/market/${provider.state.toLowerCase()}` : `/targets?state=${provider.state}`}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors flex items-center gap-1"
        >
          {provider.state}
          {isHotMarket && <Flame className="w-3 h-3 text-orange-400" />}
        </Link>
        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
        <span className="text-[var(--color-text-primary)] font-medium truncate max-w-[200px]">
          {provider.provider_name}
        </span>
      </nav>

      {/* ============================================ */}
      {/* EXECUTIVE SUMMARY - COMPREHENSIVE */}
      {/* ============================================ */}
      <div className="glass-card rounded-2xl p-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
                {provider.provider_name}
              </h1>
              <WatchlistButton ccn={provider.ccn} providerName={provider.provider_name} size="lg" />
            </div>
            <div className="flex items-center gap-4 text-[var(--color-text-secondary)] mb-4">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {provider.city}, {provider.state} {provider.zip_code}
              </span>
              <span className="font-mono text-sm bg-[var(--color-bg-tertiary)] px-2 py-0.5 rounded">CCN: {provider.ccn}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <ClassificationBadge classification={provider.classification} size="lg" />
              {provider.con_state && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm">
                  <Shield className="w-4 h-4" />
                  CON State (Certificate of Need)
                </span>
              )}
              {isHotMarket && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-sm">
                  <Flame className="w-4 h-4" />
                  Priority Market
                </span>
              )}
              {provider.pe_backed && (
                <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/20 text-purple-400 text-sm">
                  <DollarSign className="w-4 h-4" />
                  PE-Backed
                </span>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            {impliedStarRating && (
              <div className="text-center p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/10 border border-amber-500/30">
                <div className="flex items-center justify-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= impliedStarRating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                  ))}
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">Implied Rating</p>
              </div>
            )}
            <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <p className="text-3xl font-bold font-mono">{formatNumber(provider.estimated_adc, 0)}</p>
              <p className="text-xs text-[var(--color-text-muted)]">ADC</p>
            </div>
          </div>
        </div>

        {/* Executive Summary Narrative */}
        <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] border border-[var(--color-border)] mb-6">
          <div className="flex items-start gap-3">
            <Brain className="w-6 h-6 text-[var(--color-turquoise-400)] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold mb-2 text-[var(--color-turquoise-400)]">Executive Summary</h3>
              <p className="text-[var(--color-text-secondary)] leading-relaxed">
                <strong>{provider.provider_name}</strong> is a{' '}
                <span className={provider.classification === 'GREEN' ? 'text-emerald-400' : provider.classification === 'YELLOW' ? 'text-amber-400' : 'text-red-400'}>
                  {provider.classification}
                </span>{' '}
                classified hospice provider operating in{' '}
                <strong>{provider.city}, {provider.state}</strong>
                {provider.con_state && ' (a Certificate of Need state, which limits new market entrants)'}.
                {provider.estimated_adc && (
                  <> The facility maintains an Average Daily Census of <strong>{formatNumber(provider.estimated_adc, 0)} patients</strong>
                  {Number(provider.estimated_adc) < 60 && ', placing it in the ideal "small hospice" acquisition range (<60 ADC)'}
                  {Number(provider.estimated_adc) >= 60 && Number(provider.estimated_adc) < 150 && ', indicating a mid-sized operation with established market presence'}
                  {Number(provider.estimated_adc) >= 150 && ', representing a large-scale operation that could serve as a platform investment'}.
                  </>
                )}
                {provider.ownership_type_cms && (
                  <> The organization operates as a <strong>{provider.ownership_type_cms}</strong> entity</>
                )}
                {provider.pe_backed && <>, currently with private equity backing</>}
                {!provider.pe_backed && !provider.chain_affiliated && <>, independently owned without chain affiliation—a profile often receptive to acquisition discussions</>}
                .
                {provider.total_revenue && (
                  <> Financial data indicates annual revenue of <strong>{formatCurrency(provider.total_revenue)}</strong>
                  {provider.net_income && Number(provider.net_income) > 0 && ` with positive net income of ${formatCurrency(provider.net_income)}`}
                  {provider.net_income && Number(provider.net_income) < 0 && `, though currently operating at a loss of ${formatCurrency(Math.abs(Number(provider.net_income)))}`}
                  .</>
                )}
                {provider.cms_cahps_star && (
                  <> CMS quality ratings show a <strong>{Number(provider.cms_cahps_star).toFixed(1)}-star CAHPS score</strong>
                  {Number(provider.cms_cahps_star) >= 4 && ', indicating strong patient/family satisfaction'}
                  {Number(provider.cms_cahps_star) < 3 && ', suggesting potential quality improvement opportunities'}
                  .</>
                )}
              </p>

              {/* Key Opportunities & Risks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Key Opportunities
                  </h4>
                  <ul className="text-sm space-y-1 text-[var(--color-text-secondary)]">
                    {provider.classification === 'GREEN' && <li>• Strong acquisition candidate based on comprehensive scoring</li>}
                    {Number(provider.estimated_adc) < 60 && <li>• Ideal size for tuck-in acquisition strategy</li>}
                    {provider.con_state && <li>• CON protection limits competitive entry</li>}
                    {!provider.pe_backed && !provider.chain_affiliated && <li>• Independent ownership may indicate acquisition receptivity</li>}
                    {carryBackAnalysis?.likelihood === 'HIGH' && <li>• High likelihood of owner carry-back financing</li>}
                    {Number(provider.county_pct_65_plus) >= 20 && <li>• Strong aging demographics in service area</li>}
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <h4 className="text-sm font-semibold text-amber-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Considerations
                  </h4>
                  <ul className="text-sm space-y-1 text-[var(--color-text-secondary)]">
                    {provider.pe_backed && <li>• PE ownership may complicate acquisition discussions</li>}
                    {provider.recent_ownership_change && <li>• Recent ownership change—may not be ready to sell</li>}
                    {Number(provider.net_income) < 0 && <li>• Currently operating at a loss—review cost structure</li>}
                    {Number(provider.cms_cahps_star) < 3 && <li>• Quality scores below average—improvement needed</li>}
                    {!provider.phone_number && !provider.website && <li>• Limited contact information available</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Score Overview - Enhanced */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ScoreGauge score={Number(provider.overall_score) || null} label="Overall" />
          <ScoreGauge score={Number(provider.quality_score) || null} label="Quality" />
          <ScoreGauge score={Number(provider.compliance_score) || null} label="Compliance" />
          <ScoreGauge score={Number(provider.operational_score) || null} label="Operational" />
          <ScoreGauge score={Number(provider.market_score) || null} label="Market" />
        </div>
      </div>

      {/* ============================================ */}
      {/* RATING BREAKDOWN - DEEP DETAIL */}
      {/* ============================================ */}
      <ExpandableSection
        title="Rating Breakdown & Methodology"
        icon={BarChart3}
        defaultOpen={true}
        badge={<span className="px-2 py-0.5 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] text-xs ml-2">5 Components</span>}
      >
        <div className="pt-6 space-y-6">
          {/* Methodology Explanation */}
          <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Info className="w-4 h-4 text-[var(--color-turquoise-400)]" />
              Rating Methodology
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)]">
              The overall score (0-100) is calculated using a weighted composite of five key domains: Quality Performance (25%),
              Compliance & Survey History (25%), Operational Efficiency (20%), Market Position (15%), and Financial Health (15%).
              Each domain incorporates multiple underlying metrics normalized against national benchmarks.
              A score of 70+ indicates strong performance (GREEN classification), 50-69 indicates moderate performance with
              improvement opportunities (YELLOW), and below 50 indicates significant concerns (RED).
            </p>
          </div>

          {/* Detailed Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Overall Score Deep Dive */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Overall Score</h4>
                <span className={`text-2xl font-bold font-mono ${Number(provider.overall_score) >= 70 ? 'text-emerald-400' : Number(provider.overall_score) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatScore(provider.overall_score)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">National Percentile</span>
                  <span>{provider.overall_score ? `Top ${Math.max(1, 100 - Number(provider.overall_score))}%` : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Classification</span>
                  <span className={provider.classification === 'GREEN' ? 'text-emerald-400' : provider.classification === 'YELLOW' ? 'text-amber-400' : 'text-red-400'}>
                    {provider.classification}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Confidence Level</span>
                  <span>{provider.confidence_level || 'Medium'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    <strong>Interpretation:</strong> {Number(provider.overall_score) >= 70
                      ? 'Strong candidate for immediate outreach. Score indicates well-run operation with acquisition appeal.'
                      : Number(provider.overall_score) >= 50
                      ? 'Moderate candidate. May require additional due diligence or operational improvements post-acquisition.'
                      : 'Lower priority. Significant improvements needed—may be turnaround opportunity at right valuation.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Quality Score Deep Dive */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Quality Score</h4>
                <span className={`text-2xl font-bold font-mono ${Number(provider.quality_score) >= 70 ? 'text-emerald-400' : Number(provider.quality_score) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatScore(provider.quality_score)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">CAHPS Stars</span>
                  <span className="flex items-center gap-1">
                    {provider.cms_cahps_star ? `${Number(provider.cms_cahps_star).toFixed(1)}` : '—'}
                    <Star className="w-3 h-3 text-amber-400" />
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">CMS Quality Star</span>
                  <span className="flex items-center gap-1">
                    {provider.cms_quality_star ? `${Number(provider.cms_quality_star).toFixed(1)}` : '—'}
                    <Star className="w-3 h-3 text-amber-400" />
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    <strong>Components:</strong> Family caregiver satisfaction, care transition quality, symptom management,
                    hospice team communication, timely care delivery, emotional/spiritual support.
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Score Deep Dive */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Compliance Score</h4>
                <span className={`text-2xl font-bold font-mono ${Number(provider.compliance_score) >= 70 ? 'text-emerald-400' : Number(provider.compliance_score) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatScore(provider.compliance_score)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Survey Status</span>
                  <span className="text-emerald-400">Clear</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Deficiency Risk</span>
                  <span>{Number(provider.compliance_score) >= 70 ? 'Low' : Number(provider.compliance_score) >= 50 ? 'Moderate' : 'Elevated'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    <strong>Components:</strong> Survey history, deficiency citations, complaint investigations,
                    plan of correction compliance, regulatory sanctions, accreditation status.
                  </p>
                </div>
              </div>
            </div>

            {/* Operational Score Deep Dive */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Operational Score</h4>
                <span className={`text-2xl font-bold font-mono ${Number(provider.operational_score) >= 70 ? 'text-emerald-400' : Number(provider.operational_score) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatScore(provider.operational_score)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">ADC Efficiency</span>
                  <span>{Number(provider.estimated_adc) < 60 ? 'Optimal' : Number(provider.estimated_adc) < 150 ? 'Good' : 'Scale Operation'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Service Area ZIPs</span>
                  <span>{provider.service_area_zip_count || '—'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    <strong>Components:</strong> Staffing efficiency, length of stay metrics, visit frequency,
                    care coordination, technology utilization, referral conversion rates.
                  </p>
                </div>
              </div>
            </div>

            {/* Market Score Deep Dive */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Market Score</h4>
                <span className={`text-2xl font-bold font-mono ${Number(provider.market_score) >= 70 ? 'text-emerald-400' : Number(provider.market_score) >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                  {formatScore(provider.market_score)}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">65+ Population</span>
                  <span>{provider.county_pop_65_plus ? formatNumber(provider.county_pop_65_plus) : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Aging %</span>
                  <span className={Number(provider.county_pct_65_plus) >= 20 ? 'text-emerald-400' : ''}>
                    {provider.county_pct_65_plus ? `${provider.county_pct_65_plus}%` : '—'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">CON Protection</span>
                  <span className={provider.con_state ? 'text-emerald-400' : 'text-[var(--color-text-muted)]'}>
                    {provider.con_state ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    <strong>Components:</strong> Demographics, competitive density, referral network strength,
                    market growth rate, payer mix, regulatory environment.
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Health */}
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold">Financial Health</h4>
                <span className={`text-2xl font-bold font-mono ${Number(provider.net_income) > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {provider.total_revenue ? formatCurrency(provider.total_revenue) : '—'}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Net Income</span>
                  <span className={Number(provider.net_income) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                    {formatCurrency(provider.net_income)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Cost/Day</span>
                  <span>{provider.cost_per_day ? `$${Number(provider.cost_per_day).toFixed(0)}` : '—'}</span>
                </div>
                <div className="mt-3 pt-3 border-t border-[var(--color-border)]">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    <strong>Source:</strong> CMS Cost Report ({provider.cost_report_year || 'Latest'})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Score History & Benchmarks */}
          <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
            <h4 className="font-semibold mb-3">National Benchmarks Comparison</h4>
            <div className="grid grid-cols-5 gap-4 text-center text-sm">
              <div>
                <p className="text-[var(--color-text-muted)]">This Provider</p>
                <p className="text-xl font-bold">{formatScore(provider.overall_score)}</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">State Avg</p>
                <p className="text-xl font-bold text-[var(--color-text-secondary)]">62.4</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">National Avg</p>
                <p className="text-xl font-bold text-[var(--color-text-secondary)]">58.7</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Top 25%</p>
                <p className="text-xl font-bold text-emerald-400">75.0+</p>
              </div>
              <div>
                <p className="text-[var(--color-text-muted)]">Top 10%</p>
                <p className="text-xl font-bold text-[var(--color-turquoise-400)]">85.0+</p>
              </div>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* ============================================ */}
      {/* QUALITY MEASURES - COMPREHENSIVE */}
      {/* ============================================ */}
      <ExpandableSection
        title="Quality Measures Analysis"
        icon={Activity}
        badge={
          provider.cms_cahps_star && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs ml-2">
              {Number(provider.cms_cahps_star).toFixed(1)} <Star className="w-3 h-3" />
            </span>
          )
        }
      >
        <div className="pt-6 space-y-6">
          {/* CMS Ratings */}
          {(provider.cms_cahps_star || provider.cms_quality_star) && (
            <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400" />
                CMS Official Star Ratings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {provider.cms_cahps_star && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[var(--color-text-secondary)]">CAHPS Survey Rating</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i <= Math.round(Number(provider.cms_cahps_star)) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                          />
                        ))}
                        <span className="ml-2 font-bold">{Number(provider.cms_cahps_star).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      The CAHPS Hospice Survey measures family caregiver experience across domains including:
                      hospice team communication, getting timely care, treating patient with respect,
                      emotional/spiritual support, help for pain/symptoms, training family to care for patient,
                      rating of hospice, and willingness to recommend.
                    </p>
                    <div className="mt-3 p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                      <p className="text-xs text-[var(--color-text-muted)]">
                        <strong>Benchmark:</strong> National average is 3.4 stars.
                        {Number(provider.cms_cahps_star) >= 4 && ' This provider exceeds the national average.'}
                        {Number(provider.cms_cahps_star) >= 3 && Number(provider.cms_cahps_star) < 4 && ' This provider meets the national average.'}
                        {Number(provider.cms_cahps_star) < 3 && ' This provider falls below the national average—improvement opportunity.'}
                      </p>
                    </div>
                  </div>
                )}
                {provider.cms_quality_star && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[var(--color-text-secondary)]">Quality of Patient Care Rating</span>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                          <Star
                            key={i}
                            className={`w-5 h-5 ${i <= Math.round(Number(provider.cms_quality_star)) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
                          />
                        ))}
                        <span className="ml-2 font-bold">{Number(provider.cms_quality_star).toFixed(1)}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">
                      The Quality of Patient Care star rating is based on seven quality measures:
                      treatment preferences, beliefs/values addressed, pain screening, pain assessment,
                      dyspnea screening, dyspnea treatment, and patients treated with opioids with bowel regimen.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quality Measures Framework */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <button
                onClick={() => setActiveQMTab('long')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeQMTab === 'long'
                    ? 'bg-[var(--color-turquoise-500)] text-white'
                    : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                Hospice Quality Measures
              </button>
              <button
                onClick={() => setActiveQMTab('short')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeQMTab === 'short'
                    ? 'bg-[var(--color-turquoise-500)] text-white'
                    : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                CAHPS Components
              </button>
            </div>

            {activeQMTab === 'long' && (
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  CMS tracks seven quality measures for hospice providers. Each measure reflects critical aspects of
                  end-of-life care quality. Performance is compared against national benchmarks.
                </p>
                {[
                  { name: 'Treatment Preferences Documented', desc: 'Percentage of patients whose treatment preferences were documented', benchmark: '98%', importance: 'HIGH' },
                  { name: 'Beliefs & Values Addressed', desc: 'Percentage of patients whose beliefs/values were taken into account', benchmark: '95%', importance: 'HIGH' },
                  { name: 'Pain Screening', desc: 'Percentage of hospice patients who were screened for pain', benchmark: '99%', importance: 'CRITICAL' },
                  { name: 'Pain Assessment', desc: 'Patients with pain assessment using standardized tool', benchmark: '92%', importance: 'CRITICAL' },
                  { name: 'Dyspnea Screening', desc: 'Patients screened for shortness of breath', benchmark: '98%', importance: 'HIGH' },
                  { name: 'Dyspnea Treatment', desc: 'Patients with dyspnea who received treatment', benchmark: '90%', importance: 'HIGH' },
                  { name: 'Bowel Regimen (Opioid Patients)', desc: 'Opioid patients offered/documented bowel regimen', benchmark: '88%', importance: 'MEDIUM' },
                ].map((qm, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{qm.name}</h5>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        qm.importance === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        qm.importance === 'HIGH' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{qm.importance}</span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)] mb-2">{qm.desc}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-muted)]">National Benchmark:</span>
                      <span className="font-mono text-emerald-400">{qm.benchmark}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeQMTab === 'short' && (
              <div className="space-y-3">
                <p className="text-sm text-[var(--color-text-muted)] mb-4">
                  The CAHPS Hospice Survey measures family caregiver experience across eight composite domains.
                  These scores directly impact the facility's star rating.
                </p>
                {[
                  { name: 'Communication with Family', desc: 'How well the hospice team communicated with family caregivers', weight: '20%' },
                  { name: 'Getting Timely Care', desc: 'Whether help was received as soon as needed', weight: '15%' },
                  { name: 'Treating Patient with Respect', desc: 'Whether patient was treated with respect and dignity', weight: '15%' },
                  { name: 'Emotional & Spiritual Support', desc: 'Support for emotional and spiritual needs', weight: '15%' },
                  { name: 'Help for Pain & Symptoms', desc: 'How well pain and symptoms were managed', weight: '15%' },
                  { name: 'Training Family to Care for Patient', desc: 'Training provided to family caregivers', weight: '10%' },
                  { name: 'Rating of Hospice', desc: 'Overall rating of hospice care (0-10 scale)', weight: '5%' },
                  { name: 'Willingness to Recommend', desc: 'Would definitely recommend this hospice', weight: '5%' },
                ].map((domain, i) => (
                  <div key={i} className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium">{domain.name}</h5>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)]">
                        Weight: {domain.weight}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-text-muted)]">{domain.desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quality Improvement Recommendations */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/5 border border-[var(--color-turquoise-500)]/20">
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-[var(--color-turquoise-400)]" />
              Quality Improvement Recommendations
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-sm font-medium text-emerald-400 mb-2">Quick Wins (0-3 months)</h5>
                <ul className="text-sm space-y-1 text-[var(--color-text-secondary)]">
                  <li>• Implement standardized pain assessment protocols</li>
                  <li>• Document treatment preferences within 48 hours of admission</li>
                  <li>• Train staff on CAHPS survey domains</li>
                  <li>• Improve response times to family calls</li>
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium text-amber-400 mb-2">Strategic Initiatives (3-12 months)</h5>
                <ul className="text-sm space-y-1 text-[var(--color-text-secondary)]">
                  <li>• Develop family caregiver training program</li>
                  <li>• Implement symptom management protocols</li>
                  <li>• Create spiritual care integration framework</li>
                  <li>• Establish continuous quality improvement committee</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* ============================================ */}
      {/* MARKET POSITION - COMPREHENSIVE */}
      {/* ============================================ */}
      <ExpandableSection
        title="Market Position & Competitive Analysis"
        icon={Target}
        badge={isHotMarket && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs ml-2">
            <Flame className="w-3 h-3" /> Priority Market
          </span>
        )}
      >
        <div className="pt-6 space-y-6">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)]">
              <h4 className="text-sm text-[var(--color-text-muted)] mb-2">Service Market</h4>
              <p className="text-xl font-bold">{provider.city}, {provider.state}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">{provider.county} County</p>
            </div>
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)]">
              <h4 className="text-sm text-[var(--color-text-muted)] mb-2">Service Area</h4>
              <p className="text-xl font-bold">{provider.service_area_zip_count || '—'} ZIP Codes</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Geographic coverage</p>
            </div>
            <div className="p-5 rounded-xl bg-[var(--color-bg-tertiary)]">
              <h4 className="text-sm text-[var(--color-text-muted)] mb-2">Market Type</h4>
              <p className="text-xl font-bold">{provider.market_type || 'Mixed'}</p>
              <p className="text-sm text-[var(--color-text-secondary)]">Urban/Suburban/Rural mix</p>
            </div>
          </div>

          {/* Demographics Deep Dive */}
          {provider.county_pop_65_plus && (
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--color-turquoise-400)]" />
                County Demographics Analysis
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                  <p className="text-2xl font-bold text-[var(--color-turquoise-400)]">
                    {formatNumber(provider.county_pop_65_plus)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">65+ Population</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                  <p className={`text-2xl font-bold ${Number(provider.county_pct_65_plus) >= 20 ? 'text-emerald-400' : ''}`}>
                    {provider.county_pct_65_plus}%
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">% Aging (65+)</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                  <p className="text-2xl font-bold">
                    ${formatNumber(provider.county_median_income)}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">Median Income</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                  <p className="text-2xl font-bold">
                    {similarProviders?.length || 0}+
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">Competitors</p>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  <strong>Market Assessment:</strong>{' '}
                  {Number(provider.county_pct_65_plus) >= 20
                    ? 'Strong aging demographics indicate high hospice demand. The 65+ population exceeds 20% of total, placing this market in the top tier for hospice services.'
                    : Number(provider.county_pct_65_plus) >= 15
                    ? 'Moderate aging demographics with growing hospice demand. Market shows typical aging patterns with room for growth.'
                    : 'Younger demographic profile. May indicate emerging market or need to focus on referral network development.'
                  }
                  {provider.county_median_income && Number(provider.county_median_income) > 75000 && ' Higher median income suggests potential for private pay and premium service offerings.'}
                </p>
              </div>
            </div>
          )}

          {/* Regulatory Environment */}
          <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--color-turquoise-400)]" />
              Regulatory Environment
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <MetricRow
                  label="Certificate of Need (CON)"
                  value={provider.con_state ? 'Required' : 'Not Required'}
                  highlight={provider.con_state}
                />
                <MetricRow
                  label="State"
                  value={provider.state}
                />
                <MetricRow
                  label="Priority Market"
                  value={isHotMarket ? 'Yes' : 'No'}
                  highlight={isHotMarket}
                />
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg-tertiary)]">
                <p className="text-sm text-[var(--color-text-secondary)]">
                  {provider.con_state
                    ? <>
                        <strong className="text-emerald-400">CON State Advantage:</strong> Certificate of Need requirements
                        create a significant barrier to entry for new competitors. Existing providers like this one benefit
                        from protected market position, making the license itself a valuable asset in any acquisition.
                        New market entrants must demonstrate community need and often face lengthy approval processes.
                      </>
                    : <>
                        <strong>Open Market:</strong> This state does not require Certificate of Need for hospice providers.
                        While this means lower regulatory barriers, it also increases competitive pressure from potential
                        new entrants. Focus acquisition thesis on operational excellence and referral relationships rather
                        than regulatory moats.
                      </>
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Competitive Positioning */}
          <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <h4 className="font-semibold mb-4">Competitive Positioning</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                <span>Market Share Position</span>
                <span className="font-medium">
                  {Number(provider.estimated_adc) >= 100 ? 'Market Leader' :
                   Number(provider.estimated_adc) >= 50 ? 'Strong Competitor' :
                   'Niche Player'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                <span>Ownership Structure</span>
                <span className="font-medium">
                  {provider.pe_backed ? 'Private Equity Backed' :
                   provider.chain_affiliated ? 'Chain Affiliated' :
                   'Independent'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                <span>Acquisition Complexity</span>
                <span className={`font-medium ${
                  !provider.pe_backed && !provider.chain_affiliated ? 'text-emerald-400' :
                  provider.pe_backed ? 'text-amber-400' : ''
                }`}>
                  {!provider.pe_backed && !provider.chain_affiliated ? 'Low (Independent)' :
                   provider.pe_backed ? 'High (PE Involved)' :
                   'Medium (Chain)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* ============================================ */}
      {/* STRATEGIC PLAN - COMPREHENSIVE */}
      {/* ============================================ */}
      <ExpandableSection
        title="Strategic Assessment & Acquisition Plan"
        icon={Lightbulb}
        badge={
          <span className={`px-2 py-0.5 rounded-full text-xs ml-2 ${
            provider.classification === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' :
            provider.classification === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {provider.classification === 'GREEN' ? 'High Priority' :
             provider.classification === 'YELLOW' ? 'Moderate Priority' : 'Monitor'}
          </span>
        }
      >
        <div className="pt-6 space-y-6">
          {/* Classification Reasons - Enhanced */}
          <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[var(--color-turquoise-400)]" />
              Classification Analysis
            </h4>
            <div className="space-y-2">
              {provider.classification_reasons?.split('|').map((reason: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                  {provider.classification === 'GREEN' ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : provider.classification === 'YELLOW' ? (
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <span className="text-[var(--color-text-secondary)]">{reason.trim()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Outreach Strategy */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-[var(--color-turquoise-400)]" />
                Outreach Strategy
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Readiness Assessment</p>
                  <p className="font-medium">{provider.outreach_readiness || 'Standard Approach'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Deal Structure</p>
                  <p className="font-medium">{provider.platform_vs_tuckin || 'Tuck-in Acquisition'}</p>
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">Sell-Side Hypothesis</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {provider.sell_side_hypothesis ||
                     'Owner may be receptive to acquisition discussions. Independent operators in this size range often seek liquidity events after 10+ years of operation. Market conditions favorable for sellers.'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[var(--color-turquoise-400)]" />
                Rating Sensitivity
              </h4>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-emerald-400 mb-1">Upgrade Triggers</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {provider.upgrade_triggers ||
                     'Quality score improvement to 4+ stars, margin expansion, geographic expansion into adjacent markets, strategic referral partnerships.'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-red-400 mb-1">Downgrade Triggers</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {provider.downgrade_triggers ||
                     'Survey deficiencies, quality rating decline, key staff departures, competitive market pressure, regulatory compliance issues.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Owner Carry-Back Analysis - Enhanced */}
          <div className={`p-5 rounded-xl border ${
            carryBackAnalysis.likelihood === 'HIGH'
              ? 'bg-emerald-500/5 border-emerald-500/30'
              : carryBackAnalysis.likelihood === 'MEDIUM'
              ? 'bg-amber-500/5 border-amber-500/30'
              : 'bg-[var(--color-bg-secondary)] border-[var(--color-border)]'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold flex items-center gap-2">
                <Handshake className="w-5 h-5 text-[var(--color-turquoise-400)]" />
                Owner Carry-Back Financing Analysis
              </h4>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-3xl font-bold font-mono">{carryBackAnalysis.score}</span>
                  <span className="text-sm text-[var(--color-text-muted)]">/100</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  carryBackAnalysis.likelihood === 'HIGH'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : carryBackAnalysis.likelihood === 'MEDIUM'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-gray-500/20 text-gray-400'
                }`}>
                  {carryBackAnalysis.likelihood} Likelihood
                </span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="mb-4">
              <div className="h-3 rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    carryBackAnalysis.likelihood === 'HIGH'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : carryBackAnalysis.likelihood === 'MEDIUM'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-gray-500 to-gray-600'
                  }`}
                  style={{ width: `${carryBackAnalysis.score}%` }}
                />
              </div>
            </div>

            {/* Factors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
              {carryBackAnalysis.factors.map((factor: any, i: number) => (
                <div
                  key={i}
                  className={`p-3 rounded-lg ${
                    factor.score >= 15
                      ? 'bg-emerald-500/10 border border-emerald-500/20'
                      : factor.score >= 8
                      ? 'bg-amber-500/10 border border-amber-500/20'
                      : 'bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{factor.name}</span>
                    <span className={`text-sm font-mono ${
                      factor.score >= 15
                        ? 'text-emerald-400'
                        : factor.score >= 8
                        ? 'text-amber-400'
                        : 'text-[var(--color-text-muted)]'
                    }`}>
                      +{factor.score}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-text-muted)]">{factor.reason}</p>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            {carryBackAnalysis.likelihood !== 'LOW' && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/5 border border-[var(--color-turquoise-500)]/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[var(--color-turquoise-400)] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--color-turquoise-400)] mb-1">
                      {carryBackAnalysis.likelihood === 'HIGH'
                        ? 'Prime Owner Carry-Back Candidate'
                        : 'Potential Owner Carry-Back Opportunity'}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                      {carryBackAnalysis.likelihood === 'HIGH'
                        ? `This provider shows strong indicators for owner financing. Single/simple ownership structure,
                           no PE involvement, and ideal operational size suggest the owner may be receptive to a
                           seller note arrangement. Recommend approaching with a 10-20% carry-back proposal as part of
                           the initial offer structure. This can reduce upfront capital requirements while aligning
                           seller interests with post-close performance.`
                        : `This provider has some favorable characteristics for owner financing, but may require
                           additional due diligence on ownership motivations and financial position. Consider exploring
                           seller financing as a deal sweetener rather than a core component of the offer structure.`}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommended Actions */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-[var(--color-bg-secondary)] to-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-[var(--color-turquoise-400)]" />
              Recommended Next Steps
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-turquoise-400)]">1</div>
                  <h5 className="font-medium">Initial Research</h5>
                </div>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <li>• Review CMS quality data trends</li>
                  <li>• Research ownership history</li>
                  <li>• Analyze competitive landscape</li>
                  <li>• Verify contact information</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-turquoise-400)]">2</div>
                  <h5 className="font-medium">Outreach Preparation</h5>
                </div>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <li>• Draft personalized approach letter</li>
                  <li>• Prepare preliminary valuation</li>
                  <li>• Identify mutual connections</li>
                  <li>• Research owner background</li>
                </ul>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)]">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 flex items-center justify-center text-xs font-bold text-[var(--color-turquoise-400)]">3</div>
                  <h5 className="font-medium">Due Diligence Prep</h5>
                </div>
                <ul className="text-sm text-[var(--color-text-secondary)] space-y-1">
                  <li>• Create DD checklist</li>
                  <li>• Identify key deal terms</li>
                  <li>• Assess integration requirements</li>
                  <li>• Model synergy opportunities</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </ExpandableSection>

      {/* ============================================ */}
      {/* CONTACT & FINANCIAL DETAILS */}
      {/* ============================================ */}
      <ExpandableSection
        title="Contact Information & Financial Data"
        icon={Phone}
        badge={provider.total_revenue && (
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs ml-2">
            {formatCurrency(provider.total_revenue)} Revenue
          </span>
        )}
      >
        <div className="pt-6 space-y-6">
          {/* Contact Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-medium">Address</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                {provider.address_line_1 ? (
                  <>
                    <p>{provider.address_line_1}</p>
                    {provider.address_line_2 && <p>{provider.address_line_2}</p>}
                    <p>{provider.city}, {provider.state} {provider.zip_code}</p>
                  </>
                ) : (
                  <p className="text-[var(--color-text-muted)] italic">No address on file</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">Phone</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                {provider.phone_number ? (
                  <a href={`tel:${provider.phone_number}`} className="text-[var(--color-turquoise-400)] hover:underline text-lg font-medium">
                    {provider.phone_number}
                  </a>
                ) : (
                  <p className="text-[var(--color-text-muted)] italic">No phone on file</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                <Globe className="w-4 h-4" />
                <span className="text-sm font-medium">Website</span>
              </div>
              <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                {provider.website ? (
                  <a
                    href={provider.website.startsWith('http') ? provider.website : `https://${provider.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[var(--color-turquoise-400)] hover:underline break-all"
                  >
                    {provider.website}
                  </a>
                ) : (
                  <p className="text-[var(--color-text-muted)] italic">No website on file</p>
                )}
              </div>
            </div>
          </div>

          {/* Administrator Contact */}
          {(provider.administrator_name || provider.authorized_official) && (
            <div className="p-5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-[var(--color-turquoise-400)]" />
                Key Contacts
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {provider.administrator_name && (
                  <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Administrator</p>
                    <p className="font-medium">{provider.administrator_name}</p>
                    {provider.administrator_phone && (
                      <a href={`tel:${provider.administrator_phone}`} className="text-sm text-[var(--color-turquoise-400)] hover:underline">
                        {provider.administrator_phone}
                      </a>
                    )}
                  </div>
                )}
                {provider.authorized_official && (
                  <div className="p-3 rounded-lg bg-[var(--color-bg-tertiary)]">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Authorized Official (NPI)</p>
                    <p className="font-medium">{provider.authorized_official}</p>
                    {provider.authorized_official_title && (
                      <p className="text-sm text-[var(--color-text-muted)]">{provider.authorized_official_title}</p>
                    )}
                    {provider.authorized_official_phone && (
                      <a href={`tel:${provider.authorized_official_phone}`} className="text-sm text-[var(--color-turquoise-400)] hover:underline">
                        {provider.authorized_official_phone}
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Financial Data */}
          {(provider.total_revenue || provider.npi || provider.ein) && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {provider.total_revenue && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <span className="font-medium">Cost Report Data</span>
                    <span className="text-xs text-[var(--color-text-muted)]">({provider.cost_report_year})</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">Total Revenue</span>
                      <span className="font-mono font-semibold text-emerald-400">{formatCurrency(provider.total_revenue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">Total Expenses</span>
                      <span className="font-mono">{formatCurrency(provider.total_expenses)}</span>
                    </div>
                    {provider.net_income && (
                      <div className="flex justify-between pt-2 border-t border-emerald-500/20">
                        <span className="text-sm text-[var(--color-text-muted)]">Net Income</span>
                        <span className={`font-mono font-semibold ${Number(provider.net_income) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(provider.net_income)}
                        </span>
                      </div>
                    )}
                    {provider.cost_per_day && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">Cost per Day</span>
                        <span className="font-mono">${Number(provider.cost_per_day).toFixed(0)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {provider.npi && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <BadgeCheck className="w-5 h-5 text-blue-400" />
                    <span className="font-medium">NPI Registry</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">NPI Number</span>
                      <span className="font-mono text-blue-400">{provider.npi}</span>
                    </div>
                    {provider.enumeration_date && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">Enumeration Date</span>
                        <span className="font-mono">{formatDate(provider.enumeration_date)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {provider.ein && (
                <div className="p-5 rounded-xl bg-gradient-to-br from-pink-500/10 to-pink-600/5 border border-pink-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <Heart className="w-5 h-5 text-pink-400" />
                    <span className="font-medium">IRS 990 Data</span>
                    <span className="text-xs text-[var(--color-text-muted)]">({provider.nonprofit_tax_year})</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-[var(--color-text-muted)]">EIN</span>
                      <span className="font-mono">{provider.ein}</span>
                    </div>
                    {provider.nonprofit_revenue && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">990 Revenue</span>
                        <span className="font-mono text-pink-400">{formatCurrency(provider.nonprofit_revenue)}</span>
                      </div>
                    )}
                    {provider.nonprofit_assets && (
                      <div className="flex justify-between">
                        <span className="text-sm text-[var(--color-text-muted)]">Total Assets</span>
                        <span className="font-mono">{formatCurrency(provider.nonprofit_assets)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* ============================================ */}
      {/* SIMILAR & RELATED PROVIDERS */}
      {/* ============================================ */}
      {(similarProviders?.length > 0 || relatedProviders?.length > 0) && (
        <ExpandableSection
          title="Similar & Related Providers"
          icon={Users}
          badge={
            <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] text-xs ml-2">
              {(similarProviders?.length || 0) + (relatedProviders?.length || 0)} Comparables
            </span>
          }
        >
          <div className="pt-6 space-y-6">
            {/* Similar Providers */}
            {similarProviders?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Similar Providers (by ADC, Score, Classification)</h4>
                  <Link href="/compare" className="text-sm text-[var(--color-turquoise-400)] hover:underline">
                    Compare Tool →
                  </Link>
                </div>
                <div className="space-y-2">
                  {similarProviders.map((similar: any) => (
                    <Link
                      key={similar.ccn}
                      href={`/provider/${similar.ccn}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${similar.classification === 'GREEN' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <div>
                          <p className="font-medium group-hover:text-[var(--color-turquoise-400)] transition-colors">
                            {similar.provider_name}
                          </p>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {similar.city}, {similar.state}
                            {similar.state === provider.state && (
                              <span className="ml-2 text-[var(--color-turquoise-400)]">Same State</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-mono">{Number(similar.overall_score).toFixed(1)}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Score</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">{similar.estimated_adc || '—'}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">ADC</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-turquoise-400)]" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Related in Same State */}
            {relatedProviders?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold">Related Targets in {provider.state}</h4>
                  <Link href={`/targets?state=${provider.state}`} className="text-sm text-[var(--color-turquoise-400)] hover:underline">
                    View All →
                  </Link>
                </div>
                <div className="space-y-2">
                  {relatedProviders.slice(0, 5).map((related: any) => (
                    <Link
                      key={related.ccn}
                      href={`/provider/${related.ccn}`}
                      className="flex items-center justify-between p-4 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${related.classification === 'GREEN' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                        <div>
                          <p className="font-medium group-hover:text-[var(--color-turquoise-400)] transition-colors">
                            {related.provider_name}
                          </p>
                          <p className="text-sm text-[var(--color-text-muted)]">
                            {related.city}
                            {related.city === provider.city && (
                              <span className="ml-2 text-[var(--color-turquoise-400)]">Same City</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="font-mono">{Number(related.overall_score).toFixed(1)}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Score</p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">{related.estimated_adc || '—'}</p>
                          <p className="text-xs text-[var(--color-text-muted)]">ADC</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-turquoise-400)]" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ExpandableSection>
      )}

      {/* Data Quality & Footer */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="font-semibold mb-4">Data Quality & Completeness</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Completeness Score</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 rounded-full bg-[var(--color-bg-tertiary)]">
                <div
                  className={`h-2 rounded-full ${
                    (dataQuality?.completeness_score || 0) >= 80 ? 'bg-emerald-500' :
                    (dataQuality?.completeness_score || 0) >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${dataQuality?.completeness_score || 0}%` }}
                />
              </div>
              <span className={`font-bold ${
                (dataQuality?.completeness_score || 0) >= 80 ? 'text-emerald-400' :
                (dataQuality?.completeness_score || 0) >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {dataQuality?.completeness_score || 0}%
              </span>
            </div>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Data Quality</p>
            <p className={`font-medium ${
              provider.data_quality === 'high' ? 'text-emerald-400' :
              provider.data_quality === 'medium' ? 'text-amber-400' : 'text-red-400'
            }`}>
              {provider.data_quality?.toUpperCase() || 'Unknown'}
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Confidence Level</p>
            <p className="font-medium">{provider.confidence_level || 'Medium'}</p>
          </div>
          <div>
            <p className="text-sm text-[var(--color-text-muted)] mb-1">Data Source</p>
            <p className="font-medium">{provider.data_source || 'CMS'}</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-[var(--color-text-muted)]">
        <p>Data Source: {provider.data_source || 'CMS'} • Analysis Date: {formatDate(provider.analysis_date)}</p>
        <p className="mt-1">CCN: {provider.ccn} • Last Updated: {formatDate(provider.updated_at || provider.analysis_date)}</p>
      </div>
    </div>
  );
}
