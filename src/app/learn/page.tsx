'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BookOpen, Star, Activity, Users, Shield, Calculator,
  TrendingUp, DollarSign, FileText, ExternalLink, ChevronRight,
  CheckCircle, AlertTriangle, Target, Zap, Clock, Award,
  BarChart3, Lightbulb, Download
} from 'lucide-react';
import FiveStarDataset from '@/lib/knowledge';

type TabId = 'overview' | 'inspections' | 'staffing' | 'quality' | 'overall' | 'strategies' | 'resources';

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <BookOpen className="w-4 h-4" /> },
  { id: 'inspections', label: 'Health Inspections', icon: <Shield className="w-4 h-4" /> },
  { id: 'staffing', label: 'Staffing', icon: <Users className="w-4 h-4" /> },
  { id: 'quality', label: 'Quality Measures', icon: <Activity className="w-4 h-4" /> },
  { id: 'overall', label: 'Overall Rating', icon: <Star className="w-4 h-4" /> },
  { id: 'strategies', label: 'Improvement', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'resources', label: 'Resources', icon: <FileText className="w-4 h-4" /> },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  return (
    <div className="max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--color-turquoise-500)]/20 to-[var(--color-turquoise-600)]/10">
            <BookOpen className="w-6 h-6 text-[var(--color-turquoise-500)]" />
          </div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            CMS Five-Star Knowledge Base
          </h1>
        </div>
        <p className="text-[var(--color-text-secondary)]">
          Complete guide to the CMS Five-Star Quality Rating System for Skilled Nursing Facilities
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[var(--color-border)] pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'bg-[var(--color-turquoise-500)] text-white'
                : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'inspections' && <InspectionsTab />}
        {activeTab === 'staffing' && <StaffingTab />}
        {activeTab === 'quality' && <QualityTab />}
        {activeTab === 'overall' && <OverallTab />}
        {activeTab === 'strategies' && <StrategiesTab />}
        {activeTab === 'resources' && <ResourcesTab />}
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/5 border border-[var(--color-turquoise-500)]/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--color-turquoise-500)]/20">
            <Zap className="w-6 h-6 text-[var(--color-turquoise-500)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Ready to Apply This Knowledge?</h3>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Use our Quality Measures tool to drill into specific measures, run what-if scenarios,
              and generate actionable improvement plans.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quality-measures"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors"
              >
                <Activity className="w-4 h-4" />
                Quality Measures Tool
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] font-medium hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <FileText className="w-4 h-4" />
                View FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  const overview = FiveStarDataset.Overview;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          What is the CMS Five-Star System?
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6 leading-relaxed">
          {overview.Description}. Launched in {overview.LaunchYear}, it rates over {overview.FacilitiesRated.toLocaleString()} skilled nursing facilities
          nationwide. The system uses a <strong>relative ranking model</strong> - stars are determined by how facilities perform compared to peers nationally.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
            <div className="text-2xl font-bold text-[var(--color-turquoise-500)]">{overview.FacilitiesRated.toLocaleString()}+</div>
            <div className="text-sm text-[var(--color-text-muted)]">Facilities Rated</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
            <div className="text-2xl font-bold text-emerald-500">{overview.ImpactMetrics.OccupancyBoost}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Occupancy Boost for 5-Star</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
            <div className="text-2xl font-bold text-amber-500">{overview.ImpactMetrics.PaymentAdjustment}</div>
            <div className="text-sm text-[var(--color-text-muted)]">Payment Adjustment (VBP)</div>
          </div>
          <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
            <div className="text-2xl font-bold text-purple-500">Monthly</div>
            <div className="text-sm text-[var(--color-text-muted)]">Update Frequency</div>
          </div>
        </div>

        <h3 className="font-semibold mb-3">System Updates</h3>
        <div className="space-y-2">
          {overview.Updates.map((update, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span>{update}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--color-turquoise-500)]" />
          Three Core Domains
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
            <Shield className="w-6 h-6 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Health Inspections</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Based on state surveys examining 180+ federal requirements. Foundation for overall rating.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
            <Users className="w-6 h-6 text-purple-500 mb-2" />
            <h3 className="font-semibold mb-1">Staffing</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              RN hours, total nursing hours, weekend staffing, and turnover rates from PBJ data.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20">
            <Activity className="w-6 h-6 text-emerald-500 mb-2" />
            <h3 className="font-semibold mb-1">Quality Measures</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              28 clinical measures from MDS data covering falls, infections, functional status, and more.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InspectionsTab() {
  const domain = FiveStarDataset.Domains.HealthInspections;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-500" />
          Health Inspections Domain
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-4">
          Weight: <strong>{domain.Weight}</strong> | Data Source: {domain.DataSource}
        </p>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {domain.Description}
        </p>

        <h3 className="font-semibold mb-3">Deficiency Scoring Grid</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3">Level</th>
                <th className="text-left py-2 px-3">Description</th>
                <th className="text-right py-2 px-3">Points</th>
              </tr>
            </thead>
            <tbody>
              {domain.CalculationSteps[0].Examples?.map((ex, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]">
                  <td className="py-2 px-3 font-mono">{ex.Level}</td>
                  <td className="py-2 px-3">{ex.Description}</td>
                  <td className="py-2 px-3 text-right font-mono">{ex.Points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-semibold mb-3">Calculation Formula</h3>
        <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] font-mono text-sm mb-6">
          Total Score = (Cycle1 × 0.6) + (Cycle2 × 0.3) + (Cycle3 × 0.1)
        </div>

        <h3 className="font-semibold mb-3">Star Cut Points (Q4 2023)</h3>
        <div className="grid grid-cols-5 gap-2">
          {domain.StarCutPoints.map((cp) => (
            <div key={cp.Stars} className={`p-3 rounded-xl text-center ${
              cp.Stars === 5 ? 'bg-emerald-500/10 border border-emerald-500/30' :
              cp.Stars === 4 ? 'bg-blue-500/10 border border-blue-500/30' :
              cp.Stars === 3 ? 'bg-amber-500/10 border border-amber-500/30' :
              cp.Stars === 2 ? 'bg-orange-500/10 border border-orange-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="text-lg font-bold">{cp.Stars} ★</div>
              <div className="text-xs text-[var(--color-text-muted)]">{cp.ScoreRange} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StaffingTab() {
  const domain = FiveStarDataset.Domains.Staffing;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-500" />
          Staffing Domain
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Data Source: {domain.DataSource}. {domain.CaseMixAdjustment}
        </p>

        <h3 className="font-semibold mb-3">Key Metrics Tracked</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {domain.Metrics.map((metric, i) => (
            <div key={i} className="p-3 rounded-xl bg-[var(--color-bg-secondary)] text-center">
              <div className="text-sm">{metric}</div>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3">HPRD Formula</h3>
        <div className="p-4 rounded-xl bg-[var(--color-bg-secondary)] font-mono text-sm mb-6">
          {domain.Formula}
        </div>

        <h3 className="font-semibold mb-3">Star Thresholds</h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="text-left py-2 px-3">Stars</th>
                <th className="text-left py-2 px-3">RN Points</th>
                <th className="text-left py-2 px-3">Total Points</th>
              </tr>
            </thead>
            <tbody>
              {domain.StarThresholds.map((threshold, i) => (
                <tr key={i} className="border-b border-[var(--color-border)]">
                  <td className="py-2 px-3 font-bold">{threshold.Stars} ★</td>
                  <td className="py-2 px-3">{threshold.RNPoints}</td>
                  <td className="py-2 px-3">{threshold.TotalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          2023 Rule Changes
        </h3>
        <div className="space-y-2">
          {domain.Post2023Rules.map((rule, i) => (
            <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QualityTab() {
  const qm = FiveStarDataset.Domains.QualityMeasures;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-emerald-500" />
          Quality Measures Domain
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-4">
          Total Measures: <strong>{qm.TotalMeasures}</strong> ({qm.LongStayMeasures} Long-Stay + {qm.ShortStayMeasures} Short-Stay)
        </p>
        <p className="text-[var(--color-text-secondary)] mb-6">
          Data Source: {qm.DataSource}. {qm.RiskAdjustment}
        </p>

        <h3 className="font-semibold mb-3">Long-Stay Measures</h3>
        <div className="space-y-3 mb-6">
          {qm.LongStayMeasuresList.map((measure, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{measure.Name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    measure.Impact === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {measure.Impact}
                  </span>
                  <span className="text-sm font-mono">Weight: {measure.Weight}</span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="text-center p-1 rounded bg-emerald-500/10">
                  <div className="font-bold text-emerald-500">5★</div>
                  <div>{measure.Thresholds.FiveStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-blue-500/10">
                  <div className="font-bold text-blue-500">4★</div>
                  <div>{measure.Thresholds.FourStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-amber-500/10">
                  <div className="font-bold text-amber-500">3★</div>
                  <div>{measure.Thresholds.ThreeStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-orange-500/10">
                  <div className="font-bold text-orange-500">2★</div>
                  <div>{measure.Thresholds.TwoStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-red-500/10">
                  <div className="font-bold text-red-500">1★</div>
                  <div>{measure.Thresholds.OneStar}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                National Average: {measure.NationalAverage}
              </div>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3">Short-Stay Measures</h3>
        <div className="space-y-3 mb-6">
          {qm.ShortStayMeasuresList.map((measure, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{measure.Name}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    measure.Impact === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {measure.Impact}
                  </span>
                  <span className="text-sm font-mono">Weight: {measure.Weight}</span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2 text-xs">
                <div className="text-center p-1 rounded bg-emerald-500/10">
                  <div className="font-bold text-emerald-500">5★</div>
                  <div>{measure.Thresholds.FiveStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-blue-500/10">
                  <div className="font-bold text-blue-500">4★</div>
                  <div>{measure.Thresholds.FourStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-amber-500/10">
                  <div className="font-bold text-amber-500">3★</div>
                  <div>{measure.Thresholds.ThreeStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-orange-500/10">
                  <div className="font-bold text-orange-500">2★</div>
                  <div>{measure.Thresholds.TwoStar}</div>
                </div>
                <div className="text-center p-1 rounded bg-red-500/10">
                  <div className="font-bold text-red-500">1★</div>
                  <div>{measure.Thresholds.OneStar}</div>
                </div>
              </div>
              <div className="mt-2 text-xs text-[var(--color-text-muted)]">
                National Average: {measure.NationalAverage}
                {measure.RiskAdjusted && ' | Risk-Adjusted'}
              </div>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3">QM Star Cut Points</h3>
        <div className="grid grid-cols-5 gap-2">
          {qm.StarCutPoints.map((cp) => (
            <div key={cp.Stars} className={`p-3 rounded-xl text-center ${
              cp.Stars === 5 ? 'bg-emerald-500/10 border border-emerald-500/30' :
              cp.Stars === 4 ? 'bg-blue-500/10 border border-blue-500/30' :
              cp.Stars === 3 ? 'bg-amber-500/10 border border-amber-500/30' :
              cp.Stars === 2 ? 'bg-orange-500/10 border border-orange-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="text-lg font-bold">{cp.Stars} ★</div>
              <div className="text-xs text-[var(--color-text-muted)]">{cp.ScoreRange} pts</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OverallTab() {
  const overall = FiveStarDataset.Domains.Overall;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-400" />
          Overall Rating Calculation
        </h2>
        <p className="text-[var(--color-text-secondary)] mb-6">
          {overall.Integration}
        </p>

        <h3 className="font-semibold mb-3">Calculation Steps</h3>
        <div className="space-y-3 mb-6">
          {overall.CalculationMethod.map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-[var(--color-bg-secondary)]">
              <div className="w-6 h-6 rounded-full bg-[var(--color-turquoise-500)] text-white text-sm flex items-center justify-center flex-shrink-0">
                {i + 1}
              </div>
              <span>{step}</span>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3">Point to Star Conversion</h3>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {overall.PointConversion.map((pc) => (
            <div key={pc.OverallStars} className={`p-3 rounded-xl text-center ${
              pc.OverallStars === 5 ? 'bg-emerald-500/10 border border-emerald-500/30' :
              pc.OverallStars === 4 ? 'bg-blue-500/10 border border-blue-500/30' :
              pc.OverallStars === 3 ? 'bg-amber-500/10 border border-amber-500/30' :
              pc.OverallStars === 2 ? 'bg-orange-500/10 border border-orange-500/30' :
              'bg-red-500/10 border border-red-500/30'
            }`}>
              <div className="text-lg font-bold">{pc.OverallStars} ★</div>
              <div className="text-xs text-[var(--color-text-muted)]">{pc.TotalPoints} pts</div>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          Important Caps
        </h3>
        <div className="space-y-2">
          {overall.Caps.map((cap, i) => (
            <div key={i} className="flex items-start gap-2 text-sm p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <span>{cap}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StrategiesTab() {
  const strategies = FiveStarDataset.ImprovementStrategies;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Improvement Strategies
        </h2>

        <div className="space-y-6">
          {strategies.EffectivePaths.map((path, i) => (
            <div key={i} className="p-4 rounded-xl bg-[var(--color-bg-secondary)]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-lg">{path.FromTo} Stars</h3>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-[var(--color-text-muted)]" />
                  {path.Timeline}
                </div>
              </div>
              <div className="space-y-2">
                {path.KeyActions.map((action, j) => (
                  <div key={j} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          Cost-Effective Tactics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {strategies.CostEffectiveTactics.map((tactic, i) => (
            <div key={i} className={`p-4 rounded-xl ${
              tactic.Category === 'Low-Cost' ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-blue-500/10 border border-blue-500/20'
            }`}>
              <h3 className="font-semibold mb-2">{tactic.Category} ({tactic.CostRange})</h3>
              <div className="space-y-1 mb-3">
                {tactic.Examples.map((ex, j) => (
                  <div key={j} className="text-sm flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    {ex}
                  </div>
                ))}
              </div>
              <div className="text-sm text-[var(--color-text-muted)]">
                <strong>ROI:</strong> {tactic.ROI}
              </div>
            </div>
          ))}
        </div>

        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          Pitfalls to Avoid
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {strategies.AvoidPitfalls.map((pitfall, i) => (
            <div key={i} className="flex items-start gap-2 text-sm p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>{pitfall}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ResourcesTab() {
  const resources = FiveStarDataset.Resources;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--color-turquoise-500)]" />
          Official CMS Documents
        </h2>
        <div className="space-y-3">
          {resources.OfficialCMS.map((resource, i) => (
            <a
              key={i}
              href={resource.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors group"
            >
              <div>
                <h3 className="font-medium group-hover:text-[var(--color-turquoise-500)] transition-colors">{resource.Title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{resource.Description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-tertiary)]">{resource.Type}</span>
                <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-turquoise-500)]" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-amber-500" />
          Guides and Tools
        </h2>
        <div className="space-y-3">
          {resources.GuidesAndTools.map((resource, i) => (
            <a
              key={i}
              href={resource.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors group"
            >
              <div>
                <h3 className="font-medium group-hover:text-[var(--color-turquoise-500)] transition-colors">{resource.Title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{resource.Description}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-turquoise-500)]" />
            </a>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Research and Studies
        </h2>
        <div className="space-y-3">
          {resources.ResearchAndStudies.map((resource, i) => (
            <a
              key={i}
              href={resource.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors group"
            >
              <div>
                <h3 className="font-medium group-hover:text-[var(--color-turquoise-500)] transition-colors">{resource.Title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{resource.Description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-[var(--color-bg-tertiary)]">{resource.Type}</span>
                <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-turquoise-500)]" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-emerald-500" />
          Datasets
        </h2>
        <div className="space-y-3">
          {resources.Datasets.map((resource, i) => (
            <a
              key={i}
              href={resource.URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors group"
            >
              <div>
                <h3 className="font-medium group-hover:text-[var(--color-turquoise-500)] transition-colors">{resource.Title}</h3>
                <p className="text-sm text-[var(--color-text-muted)]">{resource.Description}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">{resource.Type}</span>
                <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-[var(--color-turquoise-500)]" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
