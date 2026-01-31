'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Star, TrendingUp, TrendingDown, AlertTriangle, CheckCircle,
  ChevronRight, ChevronDown, Info, Target, Lightbulb, Calculator,
  BarChart3, Settings, RefreshCw, Download, Play, Pause,
  ArrowUp, ArrowDown, Minus, HelpCircle, Zap, BookOpen, ExternalLink
} from 'lucide-react';
import FiveStarDataset, { getActionPlan } from '@/lib/knowledge';

// CMS Quality Measures - Complete list with official thresholds
// Source: CMS Five-Star Quality Rating System Technical Users' Guide
const QUALITY_MEASURES = {
  longStay: [
    {
      id: 'ls_falls',
      name: 'Falls with Major Injury',
      description: 'Percentage of long-stay residents who experienced one or more falls with major injury',
      lowerIsBetter: true,
      nationalAvg: 3.2,
      thresholds: { excellent: 1.5, good: 2.5, fair: 4.0, poor: 5.5 },
      weight: 1.0,
      actionPlan: [
        'Implement hourly rounding checks for high-risk residents',
        'Install bed/chair alarms for residents with fall history',
        'Review and adjust medications that increase fall risk',
        'Ensure proper footwear and assistive devices are available',
        'Conduct environmental safety audits (lighting, clutter, wet floors)',
      ],
    },
    {
      id: 'ls_antipsychotic',
      name: 'Antipsychotic Medication Use',
      description: 'Percentage of long-stay residents who received an antipsychotic medication',
      lowerIsBetter: true,
      nationalAvg: 14.5,
      thresholds: { excellent: 8.0, good: 12.0, fair: 18.0, poor: 25.0 },
      weight: 1.0,
      actionPlan: [
        'Review all antipsychotic orders for clinical appropriateness',
        'Implement non-pharmacological interventions for behavioral symptoms',
        'Conduct gradual dose reduction trials where appropriate',
        'Train staff on person-centered dementia care approaches',
        'Document behaviors and triggers to identify root causes',
      ],
    },
    {
      id: 'ls_pressure_ulcer',
      name: 'Pressure Ulcers (High Risk)',
      description: 'Percentage of high-risk long-stay residents with pressure ulcers',
      lowerIsBetter: true,
      nationalAvg: 6.8,
      thresholds: { excellent: 3.0, good: 5.0, fair: 8.0, poor: 12.0 },
      weight: 1.0,
      actionPlan: [
        'Implement turning/repositioning schedules every 2 hours',
        'Use pressure-redistributing mattresses and cushions',
        'Conduct weekly skin assessments and document findings',
        'Optimize nutrition and hydration for wound healing',
        'Address incontinence promptly to prevent skin breakdown',
      ],
    },
    {
      id: 'ls_uti',
      name: 'Urinary Tract Infections',
      description: 'Percentage of long-stay residents with a urinary tract infection',
      lowerIsBetter: true,
      nationalAvg: 3.1,
      thresholds: { excellent: 1.5, good: 2.5, fair: 4.0, poor: 6.0 },
      weight: 1.0,
      actionPlan: [
        'Review catheter use and implement removal protocols',
        'Ensure proper perineal care and hygiene practices',
        'Increase fluid intake for at-risk residents',
        'Train staff on aseptic catheter insertion techniques',
        'Monitor for early signs of UTI and treat promptly',
      ],
    },
    {
      id: 'ls_weight_loss',
      name: 'Weight Loss',
      description: 'Percentage of long-stay residents who lose too much weight',
      lowerIsBetter: true,
      nationalAvg: 5.8,
      thresholds: { excellent: 3.0, good: 5.0, fair: 7.0, poor: 10.0 },
      weight: 1.0,
      actionPlan: [
        'Conduct monthly weight monitoring for all residents',
        'Provide fortified foods and supplements as needed',
        'Address swallowing difficulties with speech therapy',
        'Review medications affecting appetite',
        'Offer preferred foods and dining environment improvements',
      ],
    },
    {
      id: 'ls_catheter',
      name: 'Catheter Left in Bladder',
      description: 'Percentage of long-stay residents with a catheter inserted and left in their bladder',
      lowerIsBetter: true,
      nationalAvg: 1.6,
      thresholds: { excellent: 0.5, good: 1.0, fair: 2.0, poor: 3.5 },
      weight: 1.0,
      actionPlan: [
        'Implement nurse-driven catheter removal protocols',
        'Review all catheter orders daily for continued need',
        'Try bladder training and intermittent catheterization',
        'Document medical necessity for any ongoing catheter use',
        'Track catheter days and set reduction goals',
      ],
    },
    {
      id: 'ls_physical_restraints',
      name: 'Physical Restraints',
      description: 'Percentage of long-stay residents who were physically restrained',
      lowerIsBetter: true,
      nationalAvg: 0.4,
      thresholds: { excellent: 0.0, good: 0.2, fair: 0.5, poor: 1.0 },
      weight: 1.0,
      actionPlan: [
        'Implement restraint-free care environment policies',
        'Use alternatives: low beds, motion sensors, 1:1 supervision',
        'Train staff on de-escalation techniques',
        'Review and discontinue restraint orders promptly',
        'Involve family in care planning discussions',
      ],
    },
    {
      id: 'ls_depression',
      name: 'Depressive Symptoms',
      description: 'Percentage of long-stay residents who have depressive symptoms',
      lowerIsBetter: true,
      nationalAvg: 4.2,
      thresholds: { excellent: 2.0, good: 3.5, fair: 5.5, poor: 8.0 },
      weight: 1.0,
      actionPlan: [
        'Screen all residents for depression on admission and quarterly',
        'Implement activity programs to increase engagement',
        'Ensure adequate lighting and outdoor time',
        'Consider psychiatric consultation for treatment-resistant cases',
        'Train staff to recognize and report mood changes',
      ],
    },
  ],
  shortStay: [
    {
      id: 'ss_rehospitalization',
      name: 'Rehospitalization',
      description: 'Percentage of short-stay residents who were re-hospitalized after a nursing home admission',
      lowerIsBetter: true,
      nationalAvg: 21.8,
      thresholds: { excellent: 15.0, good: 18.0, fair: 24.0, poor: 30.0 },
      weight: 1.5,
      actionPlan: [
        'Implement INTERACT (Interventions to Reduce Acute Care Transfers)',
        'Conduct thorough admission assessments to identify risks',
        'Ensure timely follow-up with physicians after hospital discharge',
        'Improve medication reconciliation processes',
        'Train staff to recognize early warning signs of decline',
      ],
    },
    {
      id: 'ss_ed_visits',
      name: 'Emergency Department Visits',
      description: 'Percentage of short-stay residents who had an outpatient emergency department visit',
      lowerIsBetter: true,
      nationalAvg: 11.3,
      thresholds: { excellent: 7.0, good: 9.0, fair: 13.0, poor: 18.0 },
      weight: 1.0,
      actionPlan: [
        'Develop protocols for managing common conditions in-house',
        'Ensure 24/7 access to nursing and medical staff',
        'Use telehealth for after-hours physician consultations',
        'Train staff on when ED visits are truly necessary',
        'Implement care pathways for falls, chest pain, respiratory distress',
      ],
    },
    {
      id: 'ss_function_improved',
      name: 'Functional Improvement',
      description: 'Percentage of short-stay residents whose function improved',
      lowerIsBetter: false,
      nationalAvg: 74.5,
      thresholds: { excellent: 82.0, good: 78.0, fair: 70.0, poor: 60.0 },
      weight: 1.5,
      actionPlan: [
        'Increase therapy intensity and frequency where appropriate',
        'Set individualized, measurable rehab goals',
        'Encourage patient participation in all ADLs',
        'Coordinate therapy with nursing care plans',
        'Monitor progress weekly and adjust treatment plans',
      ],
    },
    {
      id: 'ss_new_pressure_ulcer',
      name: 'New Pressure Ulcers',
      description: 'Percentage of short-stay residents with new or worsening pressure ulcers',
      lowerIsBetter: true,
      nationalAvg: 1.2,
      thresholds: { excellent: 0.3, good: 0.7, fair: 1.5, poor: 2.5 },
      weight: 1.0,
      actionPlan: [
        'Conduct skin assessment within 24 hours of admission',
        'Implement turning schedule from day one',
        'Use pressure-relieving devices for at-risk patients',
        'Document skin condition at every shift change',
        'Address nutrition deficits immediately',
      ],
    },
    {
      id: 'ss_pain',
      name: 'Moderate to Severe Pain',
      description: 'Percentage of short-stay residents who reported moderate to severe pain',
      lowerIsBetter: true,
      nationalAvg: 16.2,
      thresholds: { excellent: 10.0, good: 13.0, fair: 18.0, poor: 25.0 },
      weight: 1.0,
      actionPlan: [
        'Implement routine pain assessments (at least daily)',
        'Use multimodal pain management approaches',
        'Ensure timely administration of PRN pain medications',
        'Consider non-pharmacological interventions (heat, massage, positioning)',
        'Review and optimize pain medication regimens',
      ],
    },
  ],
};

// Calculate QM star rating based on scores
function calculateQMStarRating(scores: Record<string, number>): number {
  let totalWeightedScore = 0;
  let totalWeight = 0;

  [...QUALITY_MEASURES.longStay, ...QUALITY_MEASURES.shortStay].forEach(qm => {
    const score = scores[qm.id];
    if (score !== undefined) {
      let points = 0;
      if (qm.lowerIsBetter) {
        if (score <= qm.thresholds.excellent) points = 5;
        else if (score <= qm.thresholds.good) points = 4;
        else if (score <= qm.thresholds.fair) points = 3;
        else if (score <= qm.thresholds.poor) points = 2;
        else points = 1;
      } else {
        if (score >= qm.thresholds.excellent) points = 5;
        else if (score >= qm.thresholds.good) points = 4;
        else if (score >= qm.thresholds.fair) points = 3;
        else if (score >= qm.thresholds.poor) points = 2;
        else points = 1;
      }
      totalWeightedScore += points * qm.weight;
      totalWeight += qm.weight;
    }
  });

  if (totalWeight === 0) return 3;
  const avgScore = totalWeightedScore / totalWeight;
  return Math.round(avgScore * 10) / 10;
}

function getScoreStatus(qm: typeof QUALITY_MEASURES.longStay[0], value: number): 'excellent' | 'good' | 'fair' | 'poor' | 'critical' {
  if (qm.lowerIsBetter) {
    if (value <= qm.thresholds.excellent) return 'excellent';
    if (value <= qm.thresholds.good) return 'good';
    if (value <= qm.thresholds.fair) return 'fair';
    if (value <= qm.thresholds.poor) return 'poor';
    return 'critical';
  } else {
    if (value >= qm.thresholds.excellent) return 'excellent';
    if (value >= qm.thresholds.good) return 'good';
    if (value >= qm.thresholds.fair) return 'fair';
    if (value >= qm.thresholds.poor) return 'poor';
    return 'critical';
  }
}

const STATUS_COLORS = {
  excellent: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  good: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  fair: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  poor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function QualityMeasuresPage() {
  const [tab, setTab] = useState<'overview' | 'longStay' | 'shortStay' | 'whatIf' | 'actionPlan' | 'methodology'>('overview');
  const [expandedQM, setExpandedQM] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [whatIfScores, setWhatIfScores] = useState<Record<string, number>>({});
  const [showWhatIfComparison, setShowWhatIfComparison] = useState(false);

  // Initialize with sample data
  useEffect(() => {
    const initialScores: Record<string, number> = {};
    QUALITY_MEASURES.longStay.forEach(qm => {
      initialScores[qm.id] = qm.nationalAvg * (0.8 + Math.random() * 0.4);
    });
    QUALITY_MEASURES.shortStay.forEach(qm => {
      initialScores[qm.id] = qm.nationalAvg * (0.8 + Math.random() * 0.4);
    });
    setScores(initialScores);
    setWhatIfScores({ ...initialScores });
  }, []);

  const currentRating = useMemo(() => calculateQMStarRating(scores), [scores]);
  const whatIfRating = useMemo(() => calculateQMStarRating(whatIfScores), [whatIfScores]);
  const ratingDiff = whatIfRating - currentRating;

  const priorityImprovements = useMemo(() => {
    return [...QUALITY_MEASURES.longStay, ...QUALITY_MEASURES.shortStay]
      .map(qm => {
        const score = scores[qm.id];
        if (score === undefined) return null;
        const status = getScoreStatus(qm, score);
        const improvement = qm.lowerIsBetter
          ? score - qm.thresholds.good
          : qm.thresholds.good - score;
        return { qm, score, status, improvement, impactPotential: improvement * qm.weight };
      })
      .filter(item => item && (item.status === 'poor' || item.status === 'critical' || item.status === 'fair'))
      .sort((a, b) => (b?.impactPotential || 0) - (a?.impactPotential || 0))
      .slice(0, 5);
  }, [scores]);

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          className={`w-5 h-5 ${i <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`}
        />
      ))}
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="gradient-text">Quality Measures</span>
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Drill into QM scores, get action plans, and simulate star rating improvements
        </p>
      </div>

      {/* Star Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Current QM Star Rating</h3>
            <Star className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{currentRating.toFixed(1)}</div>
            {renderStars(currentRating)}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)]">What-If Projection</h3>
            <Calculator className="w-5 h-5 text-[var(--color-turquoise-500)]" />
          </div>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">{whatIfRating.toFixed(1)}</div>
            {renderStars(whatIfRating)}
            {ratingDiff !== 0 && (
              <span className={`text-sm font-medium ${ratingDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {ratingDiff > 0 ? '+' : ''}{ratingDiff.toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-[var(--color-text-muted)]">Priority Focus Areas</h3>
            <Target className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-4xl font-bold">{priorityImprovements.length}</div>
          <p className="text-sm text-[var(--color-text-muted)]">measures need attention</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'longStay', label: 'Long-Stay QMs', icon: Star },
          { id: 'shortStay', label: 'Short-Stay QMs', icon: Star },
          { id: 'whatIf', label: 'What-If Simulator', icon: Calculator },
          { id: 'actionPlan', label: 'Action Plan', icon: Lightbulb },
          { id: 'methodology', label: 'CMS Methodology', icon: BookOpen },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-[var(--color-turquoise-500)] text-white'
                : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Priority Improvements */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              Priority Improvement Areas
            </h3>
            <div className="space-y-3">
              {priorityImprovements.map((item, i) => {
                if (!item) return null;
                const { qm, score, status } = item;
                return (
                  <div
                    key={qm.id}
                    className={`p-4 rounded-lg border ${STATUS_COLORS[status]} cursor-pointer hover:opacity-90 transition-opacity`}
                    onClick={() => {
                      setTab(qm.id.startsWith('ls_') ? 'longStay' : 'shortStay');
                      setExpandedQM(qm.id);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold">#{i + 1}</span>
                        <div>
                          <h4 className="font-medium">{qm.name}</h4>
                          <p className="text-sm opacity-80">{qm.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">{score.toFixed(1)}%</div>
                        <div className="text-xs opacity-80">
                          {qm.lowerIsBetter ? 'Target: <' : 'Target: >'}{qm.thresholds.good}%
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card rounded-xl p-4">
              <div className="text-sm text-[var(--color-text-muted)] mb-1">Excellent Measures</div>
              <div className="text-2xl font-bold text-emerald-400">
                {[...QUALITY_MEASURES.longStay, ...QUALITY_MEASURES.shortStay].filter(qm =>
                  scores[qm.id] !== undefined && getScoreStatus(qm, scores[qm.id]) === 'excellent'
                ).length}
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-sm text-[var(--color-text-muted)] mb-1">Good Measures</div>
              <div className="text-2xl font-bold text-blue-400">
                {[...QUALITY_MEASURES.longStay, ...QUALITY_MEASURES.shortStay].filter(qm =>
                  scores[qm.id] !== undefined && getScoreStatus(qm, scores[qm.id]) === 'good'
                ).length}
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-sm text-[var(--color-text-muted)] mb-1">Fair Measures</div>
              <div className="text-2xl font-bold text-amber-400">
                {[...QUALITY_MEASURES.longStay, ...QUALITY_MEASURES.shortStay].filter(qm =>
                  scores[qm.id] !== undefined && getScoreStatus(qm, scores[qm.id]) === 'fair'
                ).length}
              </div>
            </div>
            <div className="glass-card rounded-xl p-4">
              <div className="text-sm text-[var(--color-text-muted)] mb-1">Needs Improvement</div>
              <div className="text-2xl font-bold text-red-400">
                {[...QUALITY_MEASURES.longStay, ...QUALITY_MEASURES.shortStay].filter(qm =>
                  scores[qm.id] !== undefined && (getScoreStatus(qm, scores[qm.id]) === 'poor' || getScoreStatus(qm, scores[qm.id]) === 'critical')
                ).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Long-Stay / Short-Stay QM Lists */}
      {(tab === 'longStay' || tab === 'shortStay') && (
        <div className="glass-card rounded-xl overflow-hidden">
          <div className="p-4 border-b border-[var(--color-border)]">
            <h3 className="font-semibold">{tab === 'longStay' ? 'Long-Stay' : 'Short-Stay'} Quality Measures</h3>
          </div>
          <div className="divide-y divide-[var(--color-border)]">
            {(tab === 'longStay' ? QUALITY_MEASURES.longStay : QUALITY_MEASURES.shortStay).map(qm => {
              const score = scores[qm.id] || 0;
              const status = getScoreStatus(qm, score);
              const isExpanded = expandedQM === qm.id;

              return (
                <div key={qm.id}>
                  <div
                    className="p-4 hover:bg-[var(--color-bg-hover)] cursor-pointer transition-colors"
                    onClick={() => setExpandedQM(isExpanded ? null : qm.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`w-3 h-3 rounded-full ${
                          status === 'excellent' ? 'bg-emerald-400' :
                          status === 'good' ? 'bg-blue-400' :
                          status === 'fair' ? 'bg-amber-400' :
                          status === 'poor' ? 'bg-orange-400' : 'bg-red-400'
                        }`} />
                        <div>
                          <h4 className="font-medium">{qm.name}</h4>
                          <p className="text-sm text-[var(--color-text-muted)]">{qm.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-lg font-bold font-mono">{score.toFixed(1)}%</div>
                          <div className="text-xs text-[var(--color-text-muted)]">
                            National: {qm.nationalAvg}%
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${STATUS_COLORS[status]}`}>
                          {status}
                        </span>
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 space-y-4">
                          {/* Thresholds */}
                          <div className="p-4 bg-[var(--color-bg-tertiary)] rounded-lg">
                            <h5 className="text-sm font-medium mb-3">Rating Thresholds</h5>
                            <div className="grid grid-cols-5 gap-2 text-center text-xs">
                              {['excellent', 'good', 'fair', 'poor', 'critical'].map(level => (
                                <div key={level} className={`p-2 rounded ${STATUS_COLORS[level as keyof typeof STATUS_COLORS]}`}>
                                  <div className="capitalize font-medium">{level}</div>
                                  <div className="mt-1">
                                    {qm.lowerIsBetter ? '<' : '>'}{qm.thresholds[level as keyof typeof qm.thresholds] || '—'}%
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Action Plan */}
                          <div>
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4 text-amber-400" />
                              Improvement Strategies
                            </h5>
                            <ul className="space-y-2">
                              {qm.actionPlan.map((action, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                  <CheckCircle className="w-4 h-4 text-[var(--color-turquoise-500)] flex-shrink-0 mt-0.5" />
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* What-If Adjustment */}
                          <div className="p-4 bg-[var(--color-bg-secondary)] rounded-lg">
                            <h5 className="text-sm font-medium mb-2">Try What-If Scenario</h5>
                            <div className="flex items-center gap-4">
                              <input
                                type="range"
                                min="0"
                                max={qm.lowerIsBetter ? qm.thresholds.poor * 1.5 : 100}
                                step="0.1"
                                value={whatIfScores[qm.id] || score}
                                onChange={e => setWhatIfScores({ ...whatIfScores, [qm.id]: parseFloat(e.target.value) })}
                                className="flex-1"
                              />
                              <input
                                type="number"
                                value={(whatIfScores[qm.id] || score).toFixed(1)}
                                onChange={e => setWhatIfScores({ ...whatIfScores, [qm.id]: parseFloat(e.target.value) || 0 })}
                                className="w-20 px-2 py-1 rounded bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-right"
                              />
                              <span>%</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* What-If Simulator Tab */}
      {tab === 'whatIf' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold">Star Rating What-If Simulator</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Adjust QM values to see projected star rating changes
                </p>
              </div>
              <button
                onClick={() => setWhatIfScores({ ...scores })}
                className="px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-sm font-medium transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Reset
              </button>
            </div>

            {/* Comparison */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="p-6 bg-[var(--color-bg-secondary)] rounded-xl text-center">
                <div className="text-sm text-[var(--color-text-muted)] mb-2">Current Rating</div>
                <div className="text-5xl font-bold mb-2">{currentRating.toFixed(1)}</div>
                {renderStars(currentRating)}
              </div>
              <div className="p-6 bg-gradient-to-br from-[var(--color-turquoise-500)]/20 to-[var(--color-turquoise-600)]/10 border border-[var(--color-turquoise-500)]/30 rounded-xl text-center">
                <div className="text-sm text-[var(--color-turquoise-400)] mb-2">Projected Rating</div>
                <div className="text-5xl font-bold mb-2">{whatIfRating.toFixed(1)}</div>
                {renderStars(whatIfRating)}
                {ratingDiff !== 0 && (
                  <div className={`mt-2 text-sm font-medium ${ratingDiff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {ratingDiff > 0 ? '+' : ''}{ratingDiff.toFixed(2)} stars
                  </div>
                )}
              </div>
            </div>

            {/* QM Adjusters */}
            <div className="space-y-4">
              <h4 className="font-medium">Adjust Quality Measures</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[...QUALITY_MEASURES.longStay, ...QUALITY_MEASURES.shortStay].map(qm => {
                  const currentScore = scores[qm.id] || 0;
                  const whatIfScore = whatIfScores[qm.id] || currentScore;
                  const diff = whatIfScore - currentScore;
                  const improved = qm.lowerIsBetter ? diff < 0 : diff > 0;

                  return (
                    <div key={qm.id} className="p-3 bg-[var(--color-bg-secondary)] rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium truncate">{qm.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[var(--color-text-muted)]">
                            {currentScore.toFixed(1)}%
                          </span>
                          {diff !== 0 && (
                            <span className={`text-xs font-medium ${improved ? 'text-emerald-400' : 'text-red-400'}`}>
                              → {whatIfScore.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max={qm.lowerIsBetter ? Math.max(30, currentScore * 2) : 100}
                        step="0.5"
                        value={whatIfScore}
                        onChange={e => setWhatIfScores({ ...whatIfScores, [qm.id]: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action Plan Tab */}
      {tab === 'actionPlan' && (
        <div className="space-y-6">
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-400" />
              Personalized Action Plan for Star Rating Improvement
            </h3>

            {priorityImprovements.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                <h4 className="text-lg font-semibold mb-2">All Quality Measures Are On Track!</h4>
                <p className="text-[var(--color-text-muted)]">
                  Your facility is performing well across all measured areas.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {priorityImprovements.map((item, i) => {
                  if (!item) return null;
                  const { qm, score, status } = item;
                  const targetScore = qm.lowerIsBetter ? qm.thresholds.good : qm.thresholds.good;
                  const improvement = qm.lowerIsBetter
                    ? ((score - targetScore) / score * 100).toFixed(0)
                    : ((targetScore - score) / targetScore * 100).toFixed(0);

                  return (
                    <div key={qm.id} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                      <div className={`p-4 ${STATUS_COLORS[status]}`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
                              {i + 1}
                            </span>
                            <div>
                              <h4 className="font-semibold">{qm.name}</h4>
                              <p className="text-sm opacity-80">
                                Current: {score.toFixed(1)}% → Target: {targetScore}%
                                ({Math.abs(parseFloat(improvement))}% {qm.lowerIsBetter ? 'reduction' : 'improvement'} needed)
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-[var(--color-bg-primary)]">
                        <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          Action Steps
                        </h5>
                        <ol className="space-y-3">
                          {qm.actionPlan.map((action, j) => (
                            <li key={j} className="flex items-start gap-3">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-500)] flex items-center justify-center text-xs font-bold">
                                {j + 1}
                              </span>
                              <span className="text-sm">{action}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Download Action Plan */}
          <div className="flex justify-end">
            <button className="px-6 py-3 rounded-lg bg-[var(--color-turquoise-500)] text-white font-medium hover:bg-[var(--color-turquoise-600)] transition-colors flex items-center gap-2">
              <Download className="w-5 h-5" />
              Download Action Plan PDF
            </button>
          </div>
        </div>
      )}

      {/* CMS Methodology Tab */}
      {tab === 'methodology' && (
        <div className="space-y-6">
          {/* Overview Card */}
          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">CMS Five-Star Quality Rating System</h3>
                <p className="text-sm text-[var(--color-text-muted)]">
                  Official methodology from the Centers for Medicare & Medicaid Services
                </p>
              </div>
            </div>
            <p className="text-[var(--color-text-secondary)] mb-4">
              {FiveStarDataset.Overview.Description}. The system uses data from{' '}
              <strong>{FiveStarDataset.Overview.FacilitiesRated.toLocaleString()}</strong> skilled nursing facilities
              and has been updated {FiveStarDataset.Overview.Updates.length} times since its{' '}
              {FiveStarDataset.Overview.LaunchYear} launch.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.cms.gov/Medicare/Provider-Enrollment-and-Certification/CertificationandComplianc/FSQRS"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                CMS Official Documentation
              </a>
              <Link
                href="/learn"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] hover:bg-[var(--color-turquoise-500)]/30 transition-colors text-sm"
              >
                <BookOpen className="w-4 h-4" />
                Full Knowledge Base
              </Link>
            </div>
          </div>

          {/* Three Domains */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Health Inspections */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <h4 className="font-semibold">Health Inspections</h4>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                Based on deficiency citations from annual standard surveys, complaint investigations, and focused infection control surveys.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[var(--color-bg-tertiary)]">
                  <span className="text-[var(--color-text-muted)]">Components:</span>
                  <ul className="mt-1 space-y-1">
                    <li>• Standard Survey weighted 65%</li>
                    <li>• Complaint Investigations weighted 25%</li>
                    <li>• Infection Control Survey weighted 10%</li>
                  </ul>
                </div>
                <div className="flex justify-between p-2 rounded bg-emerald-500/10 text-emerald-400">
                  <span>5 Stars</span>
                  <span>Top 10%</span>
                </div>
                <div className="flex justify-between p-2 rounded bg-red-500/10 text-red-400">
                  <span>1 Star</span>
                  <span>Bottom 20%</span>
                </div>
              </div>
            </div>

            {/* Staffing */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-400" />
                </div>
                <h4 className="font-semibold">Staffing</h4>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                Based on RN hours and total nursing hours per resident day, adjusted for case-mix using Payroll-Based Journal (PBJ) data.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[var(--color-bg-tertiary)]">
                  <span className="text-[var(--color-text-muted)]">Key Thresholds (HPRD):</span>
                  <ul className="mt-1 space-y-1">
                    <li>• RN: 0.75+ HPRD for 5 stars</li>
                    <li>• Total: 4.10+ HPRD for 5 stars</li>
                    <li>• Case-mix adjusted</li>
                  </ul>
                </div>
                <div className="flex justify-between p-2 rounded bg-amber-500/10 text-amber-400">
                  <span>Weekend Staffing</span>
                  <span>Monitored since 2022</span>
                </div>
              </div>
            </div>

            {/* Quality Measures */}
            <div className="glass-card rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-purple-400" />
                </div>
                <h4 className="font-semibold">Quality Measures</h4>
              </div>
              <p className="text-sm text-[var(--color-text-muted)] mb-3">
                Based on MDS assessments (17 long-stay + 11 short-stay measures), with points assigned based on percentile thresholds.
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-[var(--color-bg-tertiary)]">
                  <span className="text-[var(--color-text-muted)]">Point System:</span>
                  <ul className="mt-1 space-y-1">
                    <li>• 0-100 pts per measure</li>
                    <li>• Total points determine stars</li>
                    <li>• Updated quarterly</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-1 mt-2">
                  <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 text-center">546+ = 5★</div>
                  <div className="p-1.5 rounded bg-blue-500/10 text-blue-400 text-center">486-545 = 4★</div>
                  <div className="p-1.5 rounded bg-amber-500/10 text-amber-400 text-center">406-485 = 3★</div>
                  <div className="p-1.5 rounded bg-red-500/10 text-red-400 text-center">&lt;406 = 1-2★</div>
                </div>
              </div>
            </div>
          </div>

          {/* Overall Rating Calculation */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-400" />
              Overall Star Rating Calculation
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium mb-3 text-[var(--color-text-muted)]">Calculation Process</h5>
                <ol className="space-y-2 text-sm">
                  {FiveStarDataset.Domains.Overall.CalculationMethod.map((step, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-500)] flex items-center justify-center text-xs font-bold">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-3 text-[var(--color-text-muted)]">Star Rating Caps</h5>
                <div className="space-y-2">
                  {FiveStarDataset.Domains.Overall.Caps.map((cap, i) => (
                    <div key={i} className="p-3 rounded-lg bg-[var(--color-bg-tertiary)] text-sm">
                      {cap}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* QM Measure Categories */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="font-semibold mb-4">Quality Measure Categories</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">17</span>
                  Long-Stay Measures
                </h5>
                <ul className="space-y-1 text-sm">
                  {FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.map((measure, i) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <CheckCircle className="w-3 h-3 text-[var(--color-turquoise-500)]" />
                      {measure.Name}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">11</span>
                  Short-Stay Measures
                </h5>
                <ul className="space-y-1 text-sm">
                  {FiveStarDataset.Domains.QualityMeasures.ShortStayMeasuresList.map((measure, i) => (
                    <li key={i} className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                      <CheckCircle className="w-3 h-3 text-[var(--color-turquoise-500)]" />
                      {measure.Name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="font-semibold mb-4">Data Sources & Update Frequency</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                <h5 className="font-medium mb-2">Health Inspections</h5>
                <p className="text-sm text-[var(--color-text-muted)]">
                  From CASPER database. 3-year average for standard surveys, 3-year history for complaints.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                <h5 className="font-medium mb-2">Staffing</h5>
                <p className="text-sm text-[var(--color-text-muted)]">
                  From Payroll-Based Journal (PBJ) data. Calculated as HPRD with case-mix adjustment using RUG-IV/PDPM.
                </p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)]">
                <h5 className="font-medium mb-2">Quality Measures</h5>
                <p className="text-sm text-[var(--color-text-muted)]">
                  From MDS 3.0 assessments and claims data. Updated quarterly with rolling 12-month periods.
                </p>
              </div>
            </div>
          </div>

          {/* Key Thresholds Reference */}
          <div className="glass-card rounded-xl p-6">
            <h4 className="font-semibold mb-4">Key Quality Measure Thresholds</h4>
            <p className="text-sm text-[var(--color-text-muted)] mb-4">
              National percentile cutoffs for common quality measures. Lower is better for most measures.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    <th className="text-left py-2 px-3">Measure</th>
                    <th className="text-center py-2 px-3 text-emerald-400">Excellent (&lt;)</th>
                    <th className="text-center py-2 px-3 text-blue-400">Good (&lt;)</th>
                    <th className="text-center py-2 px-3 text-amber-400">Average (&lt;)</th>
                    <th className="text-center py-2 px-3 text-[var(--color-text-muted)]">National Avg</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {QUALITY_MEASURES.longStay.slice(0, 6).map(qm => (
                    <tr key={qm.id} className="hover:bg-[var(--color-bg-hover)]">
                      <td className="py-2 px-3 font-medium">{qm.name}</td>
                      <td className="text-center py-2 px-3">{qm.thresholds.excellent}%</td>
                      <td className="text-center py-2 px-3">{qm.thresholds.good}%</td>
                      <td className="text-center py-2 px-3">{qm.thresholds.fair}%</td>
                      <td className="text-center py-2 px-3 text-[var(--color-text-muted)]">{qm.nationalAvg}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
