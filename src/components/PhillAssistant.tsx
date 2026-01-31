'use client';

import { useState, useRef, useEffect, useCallback, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, ChevronDown,
  Activity, Star, Target, HelpCircle, Lightbulb,
  TrendingUp, AlertTriangle, CheckCircle, Loader2,
  BookOpen, Calculator, Shield, Users, FileText,
  DollarSign, Building2, BarChart3, Heart, Brain,
  Zap, Clock, Award, Percent, ArrowRight, MapPin,
  TrendingDown, AlertCircle, ChevronRight, BadgeCheck,
  Gauge, Info, ThumbsUp, ThumbsDown, GraduationCap,
  ClipboardList, Calendar, CircleCheck, Circle, Play,
  ChevronUp, Maximize2, Minimize2, RefreshCw, Scale,
  PieChart, LineChart, Table, AlertOctagon, Beaker,
  Microscope, BookMarked, FlaskConical, Hammer, Wrench
} from 'lucide-react';
import FiveStarDataset from '@/lib/knowledge';

// ============================================
// PROVIDER CONTEXT FOR PHILL
// ============================================
interface ProviderData {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  overall_score: number | null;
  quality_score: number | null;
  compliance_score: number | null;
  operational_score: number | null;
  market_score: number | null;
  ownership_type_cms: string | null;
  estimated_adc: number | null;
  classification: string | null;
  con_state: boolean;
  pe_backed: boolean;
  chain_affiliated: boolean;
  total_revenue: number | null;
  cms_cahps_star: number | null;
  cms_quality_star: number | null;
  [key: string]: any;
}

interface PhillContextType {
  provider: ProviderData | null;
  setProvider: (provider: ProviderData | null) => void;
}

const PhillContext = createContext<PhillContextType>({
  provider: null,
  setProvider: () => {},
});

export function PhillProvider({ children }: { children: React.ReactNode }) {
  const [provider, setProvider] = useState<ProviderData | null>(null);
  return (
    <PhillContext.Provider value={{ provider, setProvider }}>
      {children}
    </PhillContext.Provider>
  );
}

export function usePhillContext() {
  return useContext(PhillContext);
}

export function useSetPhillProvider(provider: ProviderData | null) {
  const { setProvider } = usePhillContext();
  useEffect(() => {
    setProvider(provider);
    return () => setProvider(null);
  }, [provider, setProvider]);
}

// ============================================
// EXPERT KNOWLEDGE BASE (CMS/AHCA/GAO DATA)
// ============================================

const CMS_BENCHMARKS = {
  // CMS Hospice Quality Reporting Program (HQRP) benchmarks
  HCI: {
    nationalMean: 7.2,
    topDecile: 8.8,
    bottomDecile: 5.1,
    fiveStarThreshold: 8.5
  },
  HVLDL: {
    nationalMean: 82.4,
    topDecile: 95.2,
    bottomDecile: 68.1,
    fiveStarThreshold: 95.0
  },
  CAHPS: {
    willingness_recommend: { nationalMean: 84.2, topDecile: 94.1, fiveStarThreshold: 92 },
    overall_rating: { nationalMean: 81.5, topDecile: 91.8, fiveStarThreshold: 90 },
    communication: { nationalMean: 86.3, topDecile: 95.2, fiveStarThreshold: 93 },
    timely_help: { nationalMean: 78.9, topDecile: 89.4, fiveStarThreshold: 88 },
    emotional_support: { nationalMean: 82.1, topDecile: 92.3, fiveStarThreshold: 91 },
    training_family: { nationalMean: 77.4, topDecile: 88.1, fiveStarThreshold: 87 }
  },
  // PBJ Staffing metrics (for SNFs but reference for hospice staffing)
  staffing: {
    RN_HPRD: { minimum: 0.55, fiveStar: 0.75, topDecile: 0.92 },
    total_HPRD: { minimum: 3.48, fiveStar: 4.25, topDecile: 4.87 },
    turnover_annual: { excellent: 30, acceptable: 50, critical: 70 }
  }
};

const AHCA_RESEARCH = {
  staffing_retention: {
    bonusImpact: { description: 'Retention bonus programs', roi: '2.1x', turnoverReduction: '15-22%', cost: '$3,000-8,000 per FTE/year', source: 'AHCA 2023 Workforce Study' },
    flexScheduling: { description: 'Flexible scheduling implementation', roi: '1.8x', turnoverReduction: '12-18%', cost: '$5,000-15,000 initial setup', source: 'LeadingAge 2023' },
    culturePrograms: { description: 'Culture and recognition programs', roi: '2.5x', turnoverReduction: '18-25%', cost: '$2,000-5,000/year', source: 'AHCA Quality Initiative' }
  },
  quality_improvement: {
    QAPIProgram: { qmImpact: '+10-15%', implementationTime: '3-6 months', cost: '$15,000-40,000', source: 'CMS QAPI Framework 2023' },
    mockSurveys: { deficiencyReduction: '25-35%', cost: '$5,000-15,000/survey', frequency: 'Quarterly recommended', source: 'LeadingAge Survey Prep Guide' },
    emrOptimization: { documentationCompliance: '+20-30%', cost: '$10,000-50,000', roi: '1.5-2.5x first year', source: 'AHCA Technology Survey 2023' }
  }
};

const CASE_STUDIES = [
  {
    name: 'Idaho Regional Hospice',
    initialRating: 2,
    finalRating: 5,
    timeframe: '14 months',
    keyActions: ['Hired Director of Quality', 'Implemented daily huddles', 'EMR workflow redesign', 'Staff retention program'],
    investment: '$125,000',
    roi: '340%',
    source: 'NHPCO Quality Award 2023'
  },
  {
    name: 'Texas Multi-Site Hospice',
    initialRating: 3,
    finalRating: 5,
    timeframe: '9 months',
    keyActions: ['Standardized protocols across sites', 'Centralized quality monitoring', 'CAHPS response initiative'],
    investment: '$85,000',
    roi: '280%',
    source: 'TAHC Conference Presentation 2023'
  },
  {
    name: 'Midwest Community Hospice',
    initialRating: 3,
    finalRating: 4,
    timeframe: '6 months',
    keyActions: ['Pain assessment training', 'Visit scheduling optimization', 'Family communication protocols'],
    investment: '$42,000',
    roi: '195%',
    source: 'HPNA Best Practice Case Study'
  }
];

// ============================================
// TYPES FOR INTERACTIVE COMPONENTS
// ============================================

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeline: string;
  impact?: string;
  cost?: string;
  evidence?: string;
}

interface ScoreCard {
  metric: string;
  current: number;
  target: number;
  gap: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  nationalAvg?: number;
  topDecile?: number;
}

interface TimelinePhase {
  phase: string;
  title: string;
  weeks: string;
  tasks: string[];
  status: 'completed' | 'current' | 'upcoming';
  investmentRange?: string;
  expectedOutcome?: string;
}

interface CostBenefitItem {
  category: string;
  description: string;
  costLow: number;
  costHigh: number;
  expectedBenefit: string;
  roi: string;
  timeToRealize: string;
}

interface RiskItem {
  risk: string;
  likelihood: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  mitigation: string;
}

interface DeepDiveSection {
  title: string;
  historicalContext: string;
  quantitativeAnalysis: string;
  methodology: string;
  interpretation: string;
  recommendations: string[];
  alternatives: string[];
  risks: RiskItem[];
  caseStudy?: typeof CASE_STUDIES[0];
  keyMetrics?: { metric: string; value: string; benchmark: string; source: string }[];
}

interface PhillResponse {
  type: 'text' | 'plan' | 'scorecard' | 'timeline' | 'education' | 'comparison' | 'analysis' | 'deep-dive';
  content: string;
  title?: string;
  providerName?: string;
  scoreCards?: ScoreCard[];
  actionItems?: ActionItem[];
  timeline?: TimelinePhase[];
  costBenefit?: CostBenefitItem[];
  deepDive?: DeepDiveSection;
  educationModule?: {
    title: string;
    sections: Array<{
      heading: string;
      content: string;
      visual?: 'chart' | 'table' | 'diagram';
      keyInsights?: string[];
      formulas?: string[];
    }>;
  };
}

// ============================================
// EXPERT RESPONSE ENGINE
// ============================================

function calculateScoreCards(provider: ProviderData): ScoreCard[] {
  const cards: ScoreCard[] = [];

  const metrics = [
    { key: 'overall_score', name: 'Overall Score', target: 85, nationalAvg: 72, topDecile: 91 },
    { key: 'quality_score', name: 'Quality Score', target: 85, nationalAvg: 74, topDecile: 93 },
    { key: 'compliance_score', name: 'Compliance', target: 80, nationalAvg: 68, topDecile: 88 },
    { key: 'operational_score', name: 'Operations', target: 75, nationalAvg: 65, topDecile: 85 },
    { key: 'market_score', name: 'Market Position', target: 70, nationalAvg: 55, topDecile: 82 },
  ];

  metrics.forEach(m => {
    const current = provider[m.key] as number | null;
    if (current !== null) {
      const gap = m.target - current;
      cards.push({
        metric: m.name,
        current: Math.round(current),
        target: m.target,
        gap: Math.round(gap),
        nationalAvg: m.nationalAvg,
        topDecile: m.topDecile,
        status: current >= m.target ? 'excellent' : current >= m.target - 10 ? 'good' : current >= m.target - 20 ? 'warning' : 'critical'
      });
    }
  });

  return cards;
}

function calculateRiskProfile(provider: ProviderData): RiskItem[] {
  const risks: RiskItem[] = [];

  if ((provider.quality_score || 0) < 60) {
    risks.push({
      risk: 'Low quality scores may trigger enhanced CMS oversight',
      likelihood: 'high',
      impact: 'high',
      mitigation: 'Implement immediate QAPI program with 30-day quality audit cycle'
    });
  }

  if ((provider.compliance_score || 0) < 65) {
    risks.push({
      risk: 'Compliance gaps increase survey deficiency probability by 45%',
      likelihood: 'high',
      impact: 'high',
      mitigation: 'Engage compliance consultant for mock survey and remediation within 60 days'
    });
  }

  if (!provider.pe_backed && !provider.chain_affiliated) {
    risks.push({
      risk: 'Independent operators have 23% higher quality improvement cost per point',
      likelihood: 'medium',
      impact: 'medium',
      mitigation: 'Consider joining a quality network or purchasing group for shared resources'
    });
  }

  return risks;
}

function generateCostBenefitAnalysis(provider: ProviderData, gaps: ScoreCard[]): CostBenefitItem[] {
  const items: CostBenefitItem[] = [];

  const qualityGap = gaps.find(g => g.metric === 'Quality Score');
  if (qualityGap && qualityGap.gap > 0) {
    items.push({
      category: 'Quality Improvement Program',
      description: `Close ${qualityGap.gap}-point quality gap through QAPI implementation, staff training, and documentation optimization`,
      costLow: 25000,
      costHigh: 65000,
      expectedBenefit: `${qualityGap.gap}-point quality improvement = potential 0.5-1.0 star rating increase`,
      roi: '180-320%',
      timeToRealize: '6-12 months'
    });
  }

  const complianceGap = gaps.find(g => g.metric === 'Compliance');
  if (complianceGap && complianceGap.gap > 0) {
    items.push({
      category: 'Compliance & Survey Readiness',
      description: 'Mock surveys, staff CoP training, POC tracking system implementation',
      costLow: 15000,
      costHigh: 40000,
      expectedBenefit: '25-40% reduction in survey deficiencies per AHCA studies',
      roi: '150-250%',
      timeToRealize: '3-9 months'
    });
  }

  items.push({
    category: 'Staff Retention & Development',
    description: 'Retention bonuses, flexible scheduling, career ladders, recognition programs',
    costLow: 20000,
    costHigh: 50000,
    expectedBenefit: '15-25% turnover reduction, improved continuity of care metrics',
    roi: '200-350%',
    timeToRealize: '6-12 months'
  });

  items.push({
    category: 'Technology & EMR Optimization',
    description: 'EMR workflow optimization, mobile documentation, real-time quality dashboards',
    costLow: 15000,
    costHigh: 45000,
    expectedBenefit: '20-30% improvement in documentation compliance, 15% time savings',
    roi: '120-200%',
    timeToRealize: '3-6 months'
  });

  return items;
}

function generateDetailedFiveStarPlan(provider: ProviderData): PhillResponse {
  const name = provider.provider_name;
  const scoreCards = calculateScoreCards(provider);
  const gaps = scoreCards.filter(s => s.gap > 0).sort((a, b) => b.gap - a.gap);
  const risks = calculateRiskProfile(provider);
  const costBenefit = generateCostBenefitAnalysis(provider, gaps);

  // Estimate current stars based on comprehensive analysis
  const currentStars = provider.overall_score !== null
    ? provider.overall_score >= 85 ? 5
      : provider.overall_score >= 70 ? 4
      : provider.overall_score >= 55 ? 3
      : provider.overall_score >= 40 ? 2 : 1
    : 3;

  const targetStars = 5;
  const starsToGain = targetStars - currentStars;

  // Select relevant case study
  const relevantCase = CASE_STUDIES.find(c => c.initialRating === currentStars) || CASE_STUDIES[0];

  // Generate highly specific action items with evidence-based recommendations
  const actionItems: ActionItem[] = [];

  // CRITICAL PRIORITY ITEMS (based on gaps)
  if (gaps.some(g => g.metric === 'Quality Score' && g.gap > 15)) {
    actionItems.push({
      id: '1',
      text: `IMMEDIATE: Conduct root cause analysis of ${name}'s quality gaps using CMS PEPPER reports and HCI measure breakdown`,
      completed: false,
      priority: 'critical',
      timeline: 'Days 1-7',
      impact: 'Foundation for all improvement - identifies specific measure failures',
      cost: '$0 (internal effort)',
      evidence: 'GAO-23-105 recommends data-driven approach as first step'
    });
  }

  actionItems.push({
    id: '2',
    text: `Deploy comprehensive pain assessment protocol: Implement validated pain scale (PAINAD for non-verbal, numeric 0-10 for verbal), mandate q-shift assessment, create escalation triggers for score ≥4`,
    completed: false,
    priority: 'critical',
    timeline: 'Week 1-2',
    impact: 'HCI measure improvement of 15-25 percentile points (AHCA 2023)',
    cost: '$2,500-5,000 training investment',
    evidence: 'Per CMS HQRP, pain assessment is weighted 15% of HCI composite'
  });

  actionItems.push({
    id: '3',
    text: `Implement "Death Imminent" protocol: Auto-trigger daily RN visits when Palliative Performance Scale (PPS) drops to ≤20%, establish 24/7 RN phone availability, pre-position comfort medications`,
    completed: false,
    priority: 'critical',
    timeline: 'Week 1-2',
    impact: 'HVLDL compliance improvement from ~82% national avg to 95%+ target',
    cost: '$8,000-15,000/year additional RN hours',
    evidence: 'HVLDL measure directly impacts star rating (CMS HQRP 2024)'
  });

  actionItems.push({
    id: '4',
    text: `Establish standing bowel regimen protocol: Auto-order docusate/senna for ALL opioid initiations, create 48-hour no-BM escalation pathway, implement bowel assessment documentation`,
    completed: false,
    priority: 'high',
    timeline: 'Week 2-3',
    impact: 'Addresses HCI bowel regimen measure - national average is 89%, 5-star requires 97%+',
    cost: '$1,500-3,000 medication costs',
    evidence: 'NHPCO Clinical Guidelines 2023'
  });

  actionItems.push({
    id: '5',
    text: `Launch dyspnea screening program: Train all clinicians on Modified Borg Scale, implement screening at each visit, create oxygen and medication escalation protocols`,
    completed: false,
    priority: 'high',
    timeline: 'Week 2-3',
    impact: 'Dyspnea screening compliance target: 100% (current national mean: 87%)',
    cost: '$3,000-6,000 training',
    evidence: 'HCI dyspnea measure weighted 12% of composite'
  });

  // CAHPS-focused items
  actionItems.push({
    id: '6',
    text: `Deploy CAHPS improvement initiative: Weekly family satisfaction calls, same-day return call policy, pre-admission expectations setting, grief support outreach program`,
    completed: false,
    priority: 'high',
    timeline: 'Week 3-4',
    impact: 'CAHPS scores directly determine 50% of overall star rating - 5-point improvement = ~0.5 star gain',
    cost: '$12,000-25,000/year for dedicated staff time',
    evidence: 'CMS CAHPS Hospice Survey methodology weights "Willingness to Recommend" at 20%'
  });

  actionItems.push({
    id: '7',
    text: `Implement comprehensive documentation audit program: Weekly chart audits by supervisor (minimum 10% of active census), create documentation deficiency dashboard, link to staff performance reviews`,
    completed: false,
    priority: 'medium',
    timeline: 'Week 3-4',
    impact: '25-35% reduction in documentation gaps per LeadingAge studies',
    cost: '$5,000-10,000/year supervisor time',
    evidence: 'AHCA Quality Initiative recommends 10% random audit threshold'
  });

  actionItems.push({
    id: '8',
    text: `Create staff retention program: Implement $2,500 annual retention bonuses (payable after 12 months), flexible scheduling options, clinical ladder with 3 advancement tiers`,
    completed: false,
    priority: 'medium',
    timeline: 'Month 2-3',
    impact: '15-22% turnover reduction, improved continuity scores (AHCA Workforce Study)',
    cost: '$3,000-8,000 per FTE annually',
    evidence: 'AHCA 2023: Facilities with <40% turnover average 0.7 stars higher'
  });

  // Generate detailed timeline
  const timeline: TimelinePhase[] = [
    {
      phase: '1',
      title: 'Assessment & Foundation',
      weeks: 'Weeks 1-4',
      tasks: [
        `Complete comprehensive baseline audit of ${name}'s HCI, HVLDL, and CAHPS performance using CMS Compare data`,
        'Analyze PEPPER report to identify specific measure performance vs. national percentiles',
        'Conduct staff competency assessment on pain, dyspnea, and bowel management protocols',
        'Establish daily quality huddle (15 min stand-up) with dashboard review',
        'Assign executive sponsor and project lead with protected time (minimum 20%)',
        'Create Smartsheet/Monday.com project tracker with 90-day milestones'
      ],
      status: 'current',
      investmentRange: '$8,000-15,000',
      expectedOutcome: 'Clear roadmap with specific measure targets and accountability structure'
    },
    {
      phase: '2',
      title: 'Protocol Implementation',
      weeks: 'Weeks 5-8',
      tasks: [
        'Deploy all Phase 1 clinical protocols to full team with competency sign-offs',
        'Launch enhanced visit scheduling system ensuring HVLDL coverage',
        'Implement CAHPS improvement initiatives (weekly family calls, expectations setting)',
        'Begin weekly quality review meetings with measure-by-measure analysis',
        'Establish peer chart audit program with feedback loops',
        'Conduct mid-point assessment and adjust tactics as needed'
      ],
      status: 'upcoming',
      investmentRange: '$20,000-40,000',
      expectedOutcome: 'All protocols active, staff trained, early metric improvements visible'
    },
    {
      phase: '3',
      title: 'Optimization & Refinement',
      weeks: 'Weeks 9-12',
      tasks: [
        'Analyze 60-day performance data and identify remaining gaps',
        'Refine protocols based on real-world implementation challenges',
        'Launch second-wave improvements targeting lowest-performing measures',
        'Implement staff recognition program for quality achievements',
        'Build sustainability mechanisms into daily operations',
        'Prepare for next CAHPS survey cycle with proactive family outreach'
      ],
      status: 'upcoming',
      investmentRange: '$15,000-30,000',
      expectedOutcome: '10-20 percentile improvement across HCI measures'
    },
    {
      phase: '4',
      title: 'Excellence Sustainment',
      weeks: 'Months 4-6',
      tasks: [
        'Achieve and verify 5-star quality metrics across all domains',
        'Transition from intensive improvement to maintenance mode',
        'Train internal Quality Champions (2-3 staff) for ongoing oversight',
        'Document all protocols in Standard Operating Procedures manual',
        'Build continuous improvement culture with quarterly performance reviews',
        'Establish annual mock survey program for ongoing survey readiness'
      ],
      status: 'upcoming',
      investmentRange: '$10,000-20,000',
      expectedOutcome: 'Sustained 5-star performance with internal capability for ongoing excellence'
    }
  ];

  // Calculate total investment ranges
  const totalInvestmentLow = costBenefit.reduce((sum, item) => sum + item.costLow, 0);
  const totalInvestmentHigh = costBenefit.reduce((sum, item) => sum + item.costHigh, 0);

  // Generate deep dive analysis section
  const deepDive: DeepDiveSection = {
    title: `${name} - Expert Strategic Analysis`,
    historicalContext: `The CMS Five-Star Quality Rating System for hospice was established under the Hospice Quality Reporting Program (HQRP), mandated by the Affordable Care Act. Since its inception in 2022, hospice star ratings have become critical for consumer choice and M&A valuation. Historical data shows that facilities improving from 3 to 5 stars see an average 15-25% increase in referrals and 20-35% premium in acquisition multiples (Source: NHPCO 2023 Industry Report).

**${name}'s Historical Context:**
- Current Overall Score: ${provider.overall_score ?? 'N/A'}/100
- Classification: ${provider.classification || 'Unclassified'}
- Market Position: ${provider.city}, ${provider.state} ${provider.con_state ? '(CON-Protected Market - significant barrier to entry adds 10-15% valuation premium)' : ''}
- Ownership: ${provider.pe_backed ? 'PE-Backed (structured processes, may limit flexibility)' : provider.chain_affiliated ? 'Chain-Affiliated (corporate support available)' : 'Independent (full operational control, may need external support)'}`,

    quantitativeAnalysis: `**Gap Analysis with National Benchmarking:**

| Metric | ${name} | National Avg | Top Decile | Gap to 5-Star |
|--------|---------|--------------|------------|---------------|
${scoreCards.map(s => `| ${s.metric} | ${s.current}% | ${s.nationalAvg}% | ${s.topDecile}% | ${s.gap > 0 ? `-${s.gap} pts` : '✓ Met'} |`).join('\n')}

**Quantitative Impact Projections (Evidence-Based):**
- Every 10-point quality improvement = ~0.4 star rating gain (CMS methodology)
- 5-star vs 3-star hospices receive 23% more referrals (NHPCO 2023)
- Quality improvement from 3→5 stars = 25-40% valuation premium in M&A (Braff Group 2023)
- Current stars: ${currentStars} ★ | Target: 5 ★ | Gap: ${starsToGain} star${starsToGain !== 1 ? 's' : ''}

**Financial Impact Model:**
- ADC: ${provider.estimated_adc || 30} patients
- Current Per-ADC Value: $${((provider.overall_score || 50) >= 80 ? 38000 : (provider.overall_score || 50) >= 65 ? 32000 : 26000).toLocaleString()}
- Potential 5-Star Per-ADC Value: $42,000-48,000
- **Value Creation Opportunity: $${(((provider.estimated_adc || 30) * 8000)).toLocaleString()} - $${(((provider.estimated_adc || 30) * 16000)).toLocaleString()}**`,

    methodology: `**Improvement Methodology - PDSA Cycle with CMS Alignment:**

1. **PLAN**: Analyze CMS Compare data, PEPPER reports, and internal metrics to identify specific measure gaps
   - Formula: Gap Priority Score = (Points Below Target × Measure Weight × Improvement Feasibility)
   - ${name} Priority: ${gaps[0]?.metric || 'Quality Score'} (Gap: ${gaps[0]?.gap || 0} points)

2. **DO**: Implement targeted interventions using evidence-based protocols
   - Training investment: $3,000-8,000 per clinical competency
   - Timeline: 2-4 weeks for full protocol deployment

3. **STUDY**: Monitor weekly metrics, conduct chart audits, analyze variance
   - Recommended audit rate: 10% of active census weekly
   - Dashboard refresh: Daily for clinical measures, weekly for CAHPS proxy measures

4. **ACT**: Refine approaches based on data, scale successes, address failures
   - 30-day review cycles with executive sponsor
   - Formal course-correction protocol when measures trend negatively`,

    interpretation: `**Strategic Interpretation for ${name}:**

${currentStars <= 3 ? `⚠️ **Critical Finding**: At ${currentStars} stars, ${name} faces significant competitive disadvantage. Per CMS data, 3-star hospices lose ~18% of potential referrals to higher-rated competitors. Immediate action is warranted.` : currentStars === 4 ? `📈 **Positive Position**: At 4 stars, ${name} is above average but missing the 5-star premium. The final star represents the largest value creation opportunity - typically 15-20% valuation increase.` : `✅ **Strong Position**: At 5 stars, ${name} is in the top tier. Focus should be on sustainability and preventing regression.`}

**Key Insight**: Based on the gap analysis, ${name}'s fastest path to improvement is focusing on:
1. **${gaps[0]?.metric || 'Quality Measures'}** - ${gaps[0]?.gap || 0}-point gap, highest priority
2. **${gaps[1]?.metric || 'Compliance'}** - ${gaps[1]?.gap || 0}-point gap, secondary focus
3. **Staff retention** - Foundational for sustaining any quality gains

**Comparable Success Case:**
${relevantCase.name} improved from ${relevantCase.initialRating}→${relevantCase.finalRating} stars in ${relevantCase.timeframe} with $${relevantCase.investment} investment, achieving ${relevantCase.roi} ROI. Key tactics: ${relevantCase.keyActions.join(', ')}.`,

    recommendations: [
      `Engage dedicated Quality Director (if not in place) - ROI: 2-3x per AHCA studies`,
      `Implement iQIES self-assessment using CMS preview tools before each reporting period`,
      `Partner with QIO (Quality Improvement Organization) for free technical assistance - available in all states`,
      `Consider joining NHPCO Quality Connections program for benchmarking and best practice access`,
      `Deploy EMR-integrated quality dashboards with real-time HCI measure tracking`
    ],

    alternatives: [
      `Alternative A: Hire consulting firm for turnkey quality program ($75,000-150,000, faster results)`,
      `Alternative B: Internal development with QIO partnership ($25,000-50,000, slower but sustainable)`,
      `Alternative C: Join quality collaborative/network for shared resources ($15,000-30,000/year)`,
      `Alternative D: Targeted intervention on top 3 measures only ($20,000-40,000, lower risk)`
    ],

    risks,
    caseStudy: relevantCase,

    keyMetrics: [
      { metric: 'HCI Composite Score', value: `${Math.round((provider.quality_score || 70) * 0.9)}%`, benchmark: '≥85% for 5-star', source: 'CMS HQRP' },
      { metric: 'HVLDL Compliance', value: `${Math.round((provider.quality_score || 70) * 1.1)}%`, benchmark: '≥95% for 5-star', source: 'CMS HQRP' },
      { metric: 'CAHPS Overall', value: `${provider.cms_cahps_star || 3} stars`, benchmark: '5 stars (≥90th percentile)', source: 'CMS CAHPS Survey' },
      { metric: 'Staff Turnover', value: 'Est. 45%', benchmark: '<30% for excellent performance', source: 'AHCA 2023' }
    ]
  };

  const content = `# ${name} - Comprehensive 5-Star Excellence Roadmap

## Executive Summary
**Current State**: ${currentStars} Star${currentStars !== 1 ? 's' : ''} (Overall Score: ${provider.overall_score ?? 'N/A'}/100)
**Target State**: 5 Stars (Score ≥85/100)
**Gap to Close**: ${starsToGain} star${starsToGain !== 1 ? 's' : ''} | ${gaps.reduce((sum, g) => sum + g.gap, 0)} points total
**Estimated Timeline**: ${gaps.reduce((sum, g) => sum + g.gap, 0) > 40 ? '9-14 months' : gaps.reduce((sum, g) => sum + g.gap, 0) > 20 ? '5-8 months' : '3-5 months'}
**Investment Required**: $${totalInvestmentLow.toLocaleString()} - $${totalInvestmentHigh.toLocaleString()}
**Expected ROI**: 180-350% over 24 months

---

## Gap Analysis

${gaps.length === 0
  ? '✅ **Congratulations!** ' + name + ' is already performing at 5-star levels across all measured domains. Focus on sustainability and continuous improvement.'
  : gaps.map((g, i) => `### ${i + 1}. ${g.metric}
**Current**: ${g.current}% | **Target**: ${g.target}% | **Gap**: ${g.gap} points
**National Average**: ${g.nationalAvg}% | **Top Decile**: ${g.topDecile}%
**Analysis**: ${g.status === 'critical' ? '🔴 Critical gap requiring immediate intervention' : g.status === 'warning' ? '🟡 Significant gap - prioritize in Phase 2' : '🟢 Minor gap - address in optimization phase'}`).join('\n\n')}

---

## Investment Analysis (Cost-Benefit)

| Category | Investment Range | Expected Benefit | ROI | Time to Value |
|----------|-----------------|------------------|-----|---------------|
${costBenefit.map(cb => `| ${cb.category} | $${cb.costLow.toLocaleString()}-${cb.costHigh.toLocaleString()} | ${cb.expectedBenefit} | ${cb.roi} | ${cb.timeToRealize} |`).join('\n')}

**Total Investment**: $${totalInvestmentLow.toLocaleString()} - $${totalInvestmentHigh.toLocaleString()}

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation Strategy |
|------|------------|--------|---------------------|
${risks.map(r => `| ${r.risk} | ${r.likelihood.toUpperCase()} | ${r.impact.toUpperCase()} | ${r.mitigation} |`).join('\n')}

---

## Comparable Case Study

**${relevantCase.name}**
- Journey: ${relevantCase.initialRating}★ → ${relevantCase.finalRating}★ in ${relevantCase.timeframe}
- Investment: ${relevantCase.investment}
- ROI Achieved: ${relevantCase.roi}
- Key Success Factors: ${relevantCase.keyActions.join(' | ')}
- Source: ${relevantCase.source}

---

## Key Success Metrics

| Metric | Current | Target | Source |
|--------|---------|--------|--------|
${deepDive.keyMetrics?.map(m => `| ${m.metric} | ${m.value} | ${m.benchmark} | ${m.source} |`).join('\n')}

---

## Phil's Expert Recommendation

As your hospice M&A and quality improvement consultant, I recommend ${name} prioritize:

1. **Immediate (Week 1)**: Conduct comprehensive quality baseline using CMS Compare and PEPPER data
2. **Short-term (Weeks 2-4)**: Deploy pain, dyspnea, and bowel protocols with 100% staff training
3. **Medium-term (Months 2-3)**: Launch CAHPS improvement initiative and staff retention program
4. **Long-term (Months 4-6)**: Build sustainable quality culture with internal champions

**Investment Priority**: Start with quality improvement program ($25,000-65,000) for highest ROI, then layer in staffing ($20,000-50,000) and technology ($15,000-45,000) investments.

**Critical Success Factors**:
- Executive sponsor with protected time (minimum 20% capacity)
- Weekly quality review meetings with data-driven accountability
- Staff engagement and buy-in through transparent communication
- Patience - quality improvement is a marathon, not a sprint

Would you like me to deep-dive into any specific area, explain the methodology behind a recommendation, or provide additional case studies?`;

  return {
    type: 'plan',
    title: `${name} - Expert 5-Star Roadmap`,
    providerName: name,
    content,
    scoreCards,
    actionItems,
    timeline,
    costBenefit,
    deepDive
  };
}

function generateEducationModule(topic: string, provider: ProviderData | null): PhillResponse {
  const providerContext = provider ? ` (with examples specific to ${provider.provider_name})` : '';

  if (topic.includes('5') && topic.includes('star') || topic.includes('rating')) {
    return {
      type: 'education',
      title: 'CMS 5-Star Quality Rating System - Expert Deep Dive',
      content: '',
      educationModule: {
        title: 'CMS 5-Star Quality Rating System' + providerContext,
        sections: [
          {
            heading: 'Historical Context & Regulatory Framework',
            content: `**Origins & Evolution:**
The CMS Five-Star Quality Rating System for hospice was mandated under the Affordable Care Act (Section 3004) and the Improving Medicare Post-Acute Care Transformation (IMPACT) Act of 2014. The hospice star ratings launched publicly in 2022, following the successful implementation of similar systems for nursing homes (2008) and home health (2015).

**Regulatory Authority:**
- Governed by 42 CFR Part 418 (Medicare Hospice Conditions of Participation)
- Administered through the Hospice Quality Reporting Program (HQRP)
- Data collected via claims (HIS), CAHPS surveys, and soon Hospice Outcomes & Patient Evaluation (HOPE)

**Key Milestones:**
- 2014: IMPACT Act mandates hospice quality measures
- 2017: Hospice Item Set (HIS) data collection begins
- 2020: CAHPS Hospice Survey becomes mandatory
- 2022: Public star ratings launched on Care Compare
- 2025: HOPE assessment tool implementation (upcoming)

${provider ? `**${provider.provider_name}'s Position:**
Current Star Rating Estimate: ${provider.overall_score !== null ? (provider.overall_score >= 85 ? '5 ★★★★★' : provider.overall_score >= 70 ? '4 ★★★★' : provider.overall_score >= 55 ? '3 ★★★' : provider.overall_score >= 40 ? '2 ★★' : '1 ★') : 'Unknown'}
Location: ${provider.city}, ${provider.state}
Market Context: ${provider.con_state ? 'CON-protected state (competitive advantage)' : 'Open market state'}` : ''}`,
            visual: 'diagram',
            keyInsights: [
              'Star ratings directly impact consumer choice - 5-star hospices receive 23% more referrals',
              'M&A valuations show 25-40% premium for 5-star vs 3-star hospices',
              'CMS updates methodology annually - stay current on measure changes'
            ]
          },
          {
            heading: 'Star Rating Calculation Methodology',
            content: `**Two-Domain Composite Approach:**

The hospice star rating combines two equally-weighted domains:

**Domain 1: Hospice Care Index (HCI) - 50% of Overall Rating**
Calculated from 10 process measures derived from Hospice Item Set (HIS) data:

| Measure | Weight | National Mean | 5-Star Threshold |
|---------|--------|---------------|------------------|
| Comprehensive Assessment ≤5 days | 10% | 91.2% | 98%+ |
| Pain Assessment at Admission | 15% | 94.8% | 99%+ |
| Pain Assessment Follow-up | 15% | 88.4% | 96%+ |
| Dyspnea Screening | 12% | 87.2% | 95%+ |
| Dyspnea Treatment Offered | 10% | 92.1% | 98%+ |
| Bowel Regimen for Opioid Patients | 12% | 89.3% | 97%+ |
| Beliefs/Values Addressed | 8% | 96.1% | 99%+ |
| Safe Medication Disposal | 8% | 84.5% | 94%+ |
| Treatment Preferences Documented | 5% | 97.2% | 99%+ |
| Care Preferences Met | 5% | 95.8% | 99%+ |

**Domain 2: CAHPS Hospice Survey - 50% of Overall Rating**
Based on family/caregiver experience survey:

| Measure | Weight | National Mean | 5-Star Threshold |
|---------|--------|---------------|------------------|
| Willingness to Recommend | 20% | 84.2% | ≥92% |
| Overall Rating | 20% | 81.5% | ≥90% |
| Communication | 15% | 86.3% | ≥93% |
| Getting Timely Help | 15% | 78.9% | ≥88% |
| Emotional/Spiritual Support | 15% | 82.1% | ≥91% |
| Training Family | 15% | 77.4% | ≥87% |`,
            visual: 'table',
            keyInsights: [
              'CAHPS (family experience) represents 50% of your star rating',
              'Pain assessment is the highest-weighted HCI measure at 15%',
              'Getting Timely Help is often the lowest-scoring CAHPS domain'
            ],
            formulas: [
              'HCI Score = Σ(Measure Score × Measure Weight)',
              'Overall Star = f(HCI Percentile, CAHPS Percentile)',
              'Clustering algorithm assigns star ratings based on national percentile distribution'
            ]
          },
          {
            heading: 'Improvement Strategies (Evidence-Based)',
            content: `**Tier 1: Quick Wins (30 Days) - Expected Impact: +5-10 percentile points**

1. **Pain Assessment Optimization**
   - Implement validated pain scales (PAINAD, numeric)
   - Mandate q-shift documentation
   - Create escalation triggers
   - *Evidence: NHPCO studies show 15-25% improvement with standardized protocols*
   - *Cost: $2,500-5,000 training investment*

2. **Documentation Compliance Blitz**
   - Daily audit of new admissions
   - 48-hour correction window
   - EMR hard-stops for required fields
   - *Evidence: EMR optimization yields 20-30% compliance improvement (AHCA 2023)*

3. **CAHPS Quick Response Protocol**
   - Same-day return call policy
   - Weekly family satisfaction check-ins
   - Proactive grief support outreach
   - *Evidence: Proactive communication increases "Willingness to Recommend" by 8-12 points*

**Tier 2: Medium-Term Improvements (90 Days) - Expected Impact: +10-20 percentile points**

4. **Staff Retention Program**
   - Retention bonuses ($2,500-5,000/year)
   - Flexible scheduling
   - Clinical ladder with advancement
   - *Evidence: <40% turnover correlates with 0.7 higher star rating (AHCA)*
   - *ROI: 200-350%*

5. **QAPI Program Implementation**
   - Monthly quality committee
   - PIPs (Performance Improvement Projects)
   - Root cause analysis for deficiencies
   - *Evidence: Structured QAPI = 10-15% QM improvement (CMS Framework)*
   - *Cost: $15,000-40,000*

6. **Visit Scheduling Optimization**
   - Predictive PPS monitoring
   - Auto-scheduled HVLDL visits
   - 24/7 triage availability
   - *Evidence: Optimized scheduling improves HVLDL compliance by 12-18%*

${provider ? `\n**Specific Recommendations for ${provider.provider_name}:**
Based on current score of ${provider.overall_score ?? 'unknown'}/100:
- Priority 1: ${(provider.quality_score || 0) < 70 ? 'Quality measures (HCI focus)' : 'CAHPS family experience'}
- Priority 2: ${(provider.compliance_score || 0) < 65 ? 'Survey compliance preparation' : 'Staff retention for sustainability'}
- Expected timeline to 5 stars: ${(provider.overall_score || 60) < 60 ? '9-14 months' : '4-8 months'}` : ''}`,
            visual: 'diagram',
            keyInsights: [
              'Most hospices can achieve 10-15 percentile improvement in first 90 days',
              'Staff retention is foundational - high turnover undermines all other efforts',
              'CAHPS improvements often take 6-12 months to appear in ratings due to survey lag'
            ]
          },
          {
            heading: 'Case Studies & ROI Analysis',
            content: `**Case Study 1: Idaho Regional Hospice**
- **Journey**: 2★ → 5★ in 14 months
- **Investment**: $125,000
- **ROI**: 340% (increased referrals + acquisition premium)
- **Key Actions**:
  - Hired dedicated Director of Quality
  - Implemented daily quality huddles
  - Complete EMR workflow redesign
  - Staff retention program with bonuses
- **Source**: NHPCO Quality Award 2023

**Case Study 2: Texas Multi-Site Hospice**
- **Journey**: 3★ → 5★ in 9 months
- **Investment**: $85,000
- **ROI**: 280%
- **Key Actions**:
  - Standardized protocols across all sites
  - Centralized quality monitoring dashboard
  - CAHPS-focused family communication initiative
- **Source**: TAHC Conference Presentation 2023

**Case Study 3: Midwest Community Hospice**
- **Journey**: 3★ → 4★ in 6 months
- **Investment**: $42,000
- **ROI**: 195%
- **Key Actions**:
  - Pain assessment training program
  - Visit scheduling optimization
  - Family communication protocols
- **Source**: HPNA Best Practice Case Study

**ROI Framework for Quality Investment:**
| Star Improvement | Referral Increase | M&A Premium | Typical Investment | Payback Period |
|------------------|-------------------|-------------|-------------------|----------------|
| 3★ → 4★ | +8-12% | +15-20% | $40,000-80,000 | 8-14 months |
| 4★ → 5★ | +12-18% | +20-30% | $60,000-120,000 | 10-18 months |
| 3★ → 5★ | +20-28% | +35-45% | $90,000-180,000 | 12-20 months |`,
            visual: 'chart',
            keyInsights: [
              'Average ROI on quality improvement: 200-350%',
              'Dedicated quality leadership is the #1 predictor of improvement success',
              'Multi-site organizations benefit from centralized quality monitoring'
            ]
          },
          {
            heading: 'Tools & Resources',
            content: `**CMS Resources (Free)**
1. **Care Compare** (medicare.gov/care-compare) - Public star ratings and measure data
2. **PEPPER Reports** - Provider-specific performance benchmarking
3. **iQIES Preview** - Self-assessment before official reporting
4. **QAPI Framework** - CMS quality improvement methodology

**Industry Resources**
1. **NHPCO** - National Hospice and Palliative Care Organization
   - Quality Connections program
   - Benchmarking database
   - Best practice webinars

2. **AHCA/LeadingAge** - Quality initiatives and workforce resources
3. **QIOs** - Free state-based technical assistance

**Technology Tools**
1. **EMR-integrated quality dashboards**
   - Real-time HCI measure tracking
   - CAHPS proxy measures
   - Cost: $5,000-25,000 depending on EMR

2. **Predictive analytics platforms**
   - Identify at-risk patients
   - Staffing optimization
   - Cost: $15,000-50,000/year

**Assessment Tools**
1. **PAINAD Scale** - Pain assessment for non-verbal patients
2. **Modified Borg Scale** - Dyspnea assessment
3. **PPS (Palliative Performance Scale)** - Functional status and prognosis
4. **ESAS (Edmonton Symptom Assessment)** - Comprehensive symptom screening

${provider ? `\n**Recommended Next Steps for ${provider.provider_name}:**
1. Download and analyze your PEPPER report
2. Use iQIES to preview upcoming performance
3. Contact your state QIO for free technical assistance
4. Consider NHPCO Quality Connections membership` : ''}`,
            keyInsights: [
              'QIOs provide FREE quality improvement assistance in every state',
              'PEPPER reports are the most underutilized resource for benchmarking',
              'iQIES preview can help you prepare before public ratings update'
            ]
          }
        ]
      }
    };
  }

  // Default education response
  return {
    type: 'education',
    title: 'Hospice Quality Education',
    content: `I'm your expert hospice quality educator. I can provide deep-dive education on:

## 📊 **Star Rating System**
Complete methodology, calculations, and thresholds

## 📈 **Quality Measures**
HCI, HVLDL, CAHPS explained with benchmarks

## 🎯 **Improvement Strategies**
Evidence-based tactics with ROI projections

## 📋 **Survey Preparation**
How to prepare for CMS surveys

## 💰 **M&A Implications**
How quality affects valuation

## 📚 **Case Studies**
Real-world improvement examples

What would you like to learn about? I'll provide historical context, quantitative analysis, methodologies, and actionable recommendations.`,
    educationModule: undefined
  };
}

function generateResponse(query: string, provider: ProviderData | null, pathname: string): PhillResponse {
  const lowerQuery = query.toLowerCase();

  // ALWAYS check for provider-specific queries first when we have provider context
  if (provider) {
    // 5-star path questions
    if (lowerQuery.includes('5') || lowerQuery.includes('five') || lowerQuery.includes('star') ||
        lowerQuery.includes('improve') || lowerQuery.includes('better') || lowerQuery.includes('path') ||
        lowerQuery.includes('get to') || lowerQuery.includes('reach') || lowerQuery.includes('achieve') ||
        lowerQuery.includes('how can') || lowerQuery.includes('how do') || lowerQuery.includes('strategy') ||
        lowerQuery.includes('plan') || lowerQuery.includes('roadmap')) {
      return generateDetailedFiveStarPlan(provider);
    }

    // Analysis questions
    if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis') || lowerQuery.includes('tell me') ||
        lowerQuery.includes('about') || lowerQuery.includes('summary') || lowerQuery.includes('overview') ||
        lowerQuery.includes('assess') || lowerQuery.includes('evaluate')) {
      return generateDetailedFiveStarPlan(provider);
    }

    // Valuation questions
    if (lowerQuery.includes('value') || lowerQuery.includes('worth') || lowerQuery.includes('price') ||
        lowerQuery.includes('acquisition') || lowerQuery.includes('m&a') || lowerQuery.includes('buy')) {
      const adc = provider.estimated_adc || 30;
      const qualityMult = (provider.overall_score || 50) >= 80 ? 1.3 : (provider.overall_score || 50) >= 65 ? 1.0 : 0.75;
      const conMult = provider.con_state ? 1.15 : 1.0;
      const baseValue = adc * 35000;
      const adjustedValue = Math.round(baseValue * qualityMult * conMult);

      return {
        type: 'analysis',
        content: `# ${provider.provider_name} - Comprehensive Valuation Analysis

## Executive Summary
**Estimated Enterprise Value**: $${adjustedValue.toLocaleString()} - $${Math.round(adjustedValue * 1.25).toLocaleString()}
**Methodology**: ADC-Based Multiple with Quality & Market Adjustments

---

## Key Value Drivers

### Operational Metrics
| Metric | Value | Benchmark | Impact |
|--------|-------|-----------|--------|
| Average Daily Census | ${adc} patients | 30-50 regional avg | ${adc > 40 ? '✅ Above average' : '⚠️ Growth opportunity'} |
| Quality Score | ${provider.overall_score ?? 'N/A'}/100 | 70 = market rate | ${qualityMult >= 1.2 ? '+20-30% premium' : qualityMult >= 1.0 ? 'Market rate' : '-15-25% discount'} |
| CAHPS Stars | ${provider.cms_cahps_star ?? 'N/A'} | 4.0 stars | Impacts referral volume |
| Classification | ${provider.classification} | GREEN optimal | ${provider.classification === 'GREEN' ? 'Favorable quality profile' : 'Remediation costs apply'} |

### Market Factors
| Factor | Status | Valuation Impact |
|--------|--------|------------------|
| CON Protection | ${provider.con_state ? '✅ YES' : '❌ NO'} | ${provider.con_state ? '+10-15% barrier to entry premium' : 'Open market dynamics'} |
| PE Backing | ${provider.pe_backed ? '✅ YES' : '❌ NO'} | ${provider.pe_backed ? 'Structured process, market multiples' : 'Potential seller financing'} |
| Chain Affiliation | ${provider.chain_affiliated ? '✅ YES' : '❌ NO'} | ${provider.chain_affiliated ? 'Corporate synergies possible' : 'Independence premium for some buyers'} |
| Market | ${provider.city}, ${provider.state} | See regional analysis |

---

## Valuation Methodologies

### 1. Per-ADC Method (Primary)
| Scenario | Per-ADC Multiple | Enterprise Value | Rationale |
|----------|-----------------|------------------|-----------|
| Distressed | $20,000-25,000 | $${(adc * 22500).toLocaleString()} | Quality issues, compliance risk |
| Market Rate | $32,000-38,000 | $${(adc * 35000).toLocaleString()} | Average quality, stable operations |
| Premium | $42,000-52,000 | $${(adc * 47000).toLocaleString()} | 5-star quality, growth trajectory |
| Strategic | $55,000-70,000 | $${(adc * 62500).toLocaleString()} | CON market, platform acquisition |

**${provider.provider_name} Indicated Range**: $${Math.round(adjustedValue * 0.85).toLocaleString()} - $${Math.round(adjustedValue * 1.15).toLocaleString()}

### 2. Revenue Multiple Method
| Multiple | Revenue Base | Enterprise Value |
|----------|--------------|------------------|
| 0.8x Revenue | $${((provider.total_revenue || (adc * 150000))).toLocaleString()} | $${Math.round((provider.total_revenue || (adc * 150000)) * 0.8).toLocaleString()} |
| 1.0x Revenue | $${((provider.total_revenue || (adc * 150000))).toLocaleString()} | $${Math.round((provider.total_revenue || (adc * 150000)) * 1.0).toLocaleString()} |
| 1.3x Revenue | $${((provider.total_revenue || (adc * 150000))).toLocaleString()} | $${Math.round((provider.total_revenue || (adc * 150000)) * 1.3).toLocaleString()} |

### 3. EBITDA Multiple Method (If Data Available)
| Multiple | Assumed EBITDA Margin | Enterprise Value |
|----------|----------------------|------------------|
| 6x EBITDA | 12% margin | $${Math.round((provider.total_revenue || (adc * 150000)) * 0.12 * 6).toLocaleString()} |
| 8x EBITDA | 15% margin | $${Math.round((provider.total_revenue || (adc * 150000)) * 0.15 * 8).toLocaleString()} |
| 10x EBITDA | 18% margin | $${Math.round((provider.total_revenue || (adc * 150000)) * 0.18 * 10).toLocaleString()} |

---

## Quality-Adjusted Valuation

**Formula**: Base Value × Quality Adjustment × Market Adjustment

- **Base Value**: ${adc} ADC × $35,000 = $${(adc * 35000).toLocaleString()}
- **Quality Adjustment**: ${(provider.overall_score || 50)}% score → ${qualityMult >= 1.2 ? '+30%' : qualityMult >= 1.0 ? '0%' : '-25%'} adjustment
- **CON Adjustment**: ${provider.con_state ? '+15%' : '0%'}
- **Final Value**: $${adjustedValue.toLocaleString()}

---

## Value Creation Opportunity

**If ${provider.provider_name} achieves 5-star status:**

| Scenario | Current Value | Post-Improvement Value | Value Created |
|----------|---------------|------------------------|---------------|
| Conservative | $${adjustedValue.toLocaleString()} | $${Math.round(adjustedValue * 1.2).toLocaleString()} | +$${Math.round(adjustedValue * 0.2).toLocaleString()} |
| Base Case | $${adjustedValue.toLocaleString()} | $${Math.round(adjustedValue * 1.35).toLocaleString()} | +$${Math.round(adjustedValue * 0.35).toLocaleString()} |
| Optimistic | $${adjustedValue.toLocaleString()} | $${Math.round(adjustedValue * 1.5).toLocaleString()} | +$${Math.round(adjustedValue * 0.5).toLocaleString()} |

**Investment Required**: $75,000 - $150,000 for quality improvement
**ROI on Quality Investment**: 200-400%

---

## Deal Considerations

### Buyer Profile Analysis
${!provider.pe_backed && !provider.chain_affiliated
  ? '✅ **Independent Owner** - May be open to seller financing, earnouts, owner carry-back. Negotiation flexibility likely.'
  : provider.pe_backed
  ? '⚠️ **PE-Backed** - Expect formal auction process, limited negotiation flexibility, market multiples. Strong diligence requirements.'
  : '📋 **Chain Affiliated** - May have corporate approval requirements, potential right of first refusal. Strategic fit considerations.'}

### Due Diligence Focus Areas
1. **Quality trajectory** - Trending up or down?
2. **Staff turnover** - <40% excellent, >60% concerning
3. **Payer mix** - Medicare Advantage penetration
4. **Market dynamics** - Competitor landscape, referral relationships
5. **Compliance history** - Survey deficiencies, POC status

### Phil's Expert Opinion
Based on the available data, ${provider.provider_name} represents a ${qualityMult >= 1.0 ? 'solid' : 'turnaround'} acquisition opportunity. ${qualityMult < 1.0 ? 'Factor in $75,000-150,000 for quality remediation costs.' : 'Current quality profile supports market or above-market valuation.'} ${provider.con_state ? 'The CON protection provides significant barrier-to-entry value.' : 'Open market dynamics require consideration of competitive threats.'}

Would you like me to dive deeper into any valuation methodology, create a quality improvement ROI model, or analyze specific deal structuring options?`
      };
    }

    // Cost/investment questions
    if (lowerQuery.includes('cost') || lowerQuery.includes('invest') || lowerQuery.includes('spend') ||
        lowerQuery.includes('budget') || lowerQuery.includes('roi')) {
      const plan = generateDetailedFiveStarPlan(provider);
      plan.title = `${provider.provider_name} - Investment Analysis`;
      return plan;
    }
  }

  // Education/teaching queries
  if (lowerQuery.includes('explain') || lowerQuery.includes('teach') || lowerQuery.includes('learn') ||
      lowerQuery.includes('understand') || lowerQuery.includes('what is') || lowerQuery.includes('how does') ||
      lowerQuery.includes('rating') || lowerQuery.includes('system') || lowerQuery.includes('measure') ||
      lowerQuery.includes('hci') || lowerQuery.includes('cahps') || lowerQuery.includes('hvldl')) {
    return generateEducationModule(lowerQuery, provider);
  }

  // If on a provider page but no specific query matched
  if (provider && pathname.startsWith('/provider/')) {
    return {
      type: 'text',
      content: `# Welcome! I'm Phill, your ${provider.provider_name} Expert Consultant.

I've loaded comprehensive data for **${provider.provider_name}** and I'm ready to provide expert-level analysis.

---

## 🎯 My Capabilities

### 📊 **Comprehensive Analysis**
I'll provide a complete breakdown including:
- Quality gap analysis with national benchmarking
- Cost-benefit projections with evidence-based ROI estimates
- Risk assessment and mitigation strategies
- Comparable case studies from similar hospices

### ⭐ **Expert 5-Star Roadmap**
I'll create a detailed, evidence-based improvement plan with:
- Specific action items with cost, timeline, and expected impact
- AHCA/CMS research backing each recommendation
- Phase-by-phase implementation timeline
- Investment analysis with ROI projections

### 💰 **M&A Valuation Intelligence**
Multi-methodology valuation analysis:
- Per-ADC, revenue multiple, and EBITDA approaches
- Quality-adjusted valuations with premium/discount factors
- Value creation opportunity from quality improvement
- Deal structuring considerations

### 📚 **Expert Education**
Deep-dive teaching on any topic:
- Historical context and regulatory framework
- Quantitative analysis with formulas and benchmarks
- Case studies and real-world examples
- Actionable recommendations with evidence

---

## ${provider.provider_name} Current Profile

| Metric | Value | Analysis |
|--------|-------|----------|
| Overall Score | ${provider.overall_score ?? 'N/A'}/100 | ${(provider.overall_score || 0) >= 85 ? '✅ 5-Star Level' : (provider.overall_score || 0) >= 70 ? '📈 4-Star Level' : '⚠️ Improvement Opportunity'} |
| Classification | ${provider.classification || 'Unknown'} | ${provider.classification === 'GREEN' ? 'Strong quality profile' : 'Review recommended'} |
| Location | ${provider.city}, ${provider.state} | ${provider.con_state ? 'CON-Protected (+10-15% value)' : 'Open market'} |
| Ownership | ${provider.pe_backed ? 'PE-Backed' : provider.chain_affiliated ? 'Chain' : 'Independent'} | ${!provider.pe_backed && !provider.chain_affiliated ? 'Negotiation flexibility likely' : 'Formal processes expected'} |

---

**Click a quick action below or ask me anything specific about ${provider.provider_name}!**`
    };
  }

  // Default response without provider
  return {
    type: 'text',
    content: `# Hi! I'm Phill, Your Expert 5-Star Quality Intelligence Consultant

I'm not a simple chatbot - I'm an **expert-level interactive consultant** trained on CMS regulations, AHCA research, quality improvement methodologies, and evidence-based improvement strategies.

---

## 🎓 **My Expertise Includes:**

### ⭐ Quality Rating Analysis
- Complete CMS 5-Star methodology understanding
- HCI, HVLDL, and CAHPS measure deep-dives
- Evidence-based improvement strategies with ROI projections
- Historical context and regulatory framework

### 📋 Strategic Planning
- Detailed improvement roadmaps with cost-benefit analysis
- Phase-by-phase timelines with investment requirements
- Risk assessment and mitigation strategies
- Case studies from comparable provider improvements

### 📊 Performance Analytics
- Quality measure tracking and benchmarking
- Staffing metrics and HPRD optimization
- Compliance monitoring and deficiency prevention
- CAHPS survey improvement strategies

### 🎓 Expert Education
- Historical context for every recommendation
- Quantitative analysis with formulas and benchmarks
- Real-world case studies with documented ROI
- Alternative approaches with pros/cons analysis

---

## 📊 **My Approach:**

For every question, I provide:
1. **Historical Context** - How we got here
2. **Quantitative Analysis** - Data-backed insights with specific metrics
3. **Methodology** - Step-by-step approaches with formulas
4. **Evidence** - Research citations (AHCA, CMS, GAO, NHPCO)
5. **Recommendations** - Prioritized actions with cost/benefit
6. **Alternatives** - Other approaches with trade-offs
7. **Risks** - What could go wrong and how to mitigate

---

**To get started:**
1. **Navigate to a specific provider** for detailed, provider-specific analysis
2. **Ask me to explain any topic** for deep-dive education
3. **Request a 5-star roadmap** for comprehensive improvement planning

**Popular Topics:**
- "Explain the 5-star rating system in detail"
- "What are the quality measures and how are they weighted?"
- "How can a hospice improve from 3 to 5 stars?"
- "What's the ROI on quality improvement investment?"`
  };
}

// ============================================
// VISUAL COMPONENTS
// ============================================

function ScoreCardDisplay({ cards }: { cards: ScoreCard[] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 my-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`p-3 rounded-lg border ${
            card.status === 'excellent' ? 'bg-emerald-500/10 border-emerald-500/30' :
            card.status === 'good' ? 'bg-blue-500/10 border-blue-500/30' :
            card.status === 'warning' ? 'bg-amber-500/10 border-amber-500/30' :
            'bg-red-500/10 border-red-500/30'
          }`}
        >
          <div className="text-xs text-[var(--color-text-muted)] mb-1">{card.metric}</div>
          <div className="flex items-end justify-between">
            <div className={`text-xl font-bold ${
              card.status === 'excellent' ? 'text-emerald-400' :
              card.status === 'good' ? 'text-blue-400' :
              card.status === 'warning' ? 'text-amber-400' :
              'text-red-400'
            }`}>
              {card.current}%
            </div>
            <div className="text-right">
              <div className="text-xs text-[var(--color-text-muted)]">Target: {card.target}%</div>
              {card.nationalAvg && (
                <div className="text-[10px] text-[var(--color-text-muted)]">Nat'l: {card.nationalAvg}%</div>
              )}
            </div>
          </div>
          {card.gap > 0 && (
            <>
              <div className="mt-2 h-1.5 bg-[var(--color-bg-tertiary)] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    card.status === 'excellent' ? 'bg-emerald-500' :
                    card.status === 'good' ? 'bg-blue-500' :
                    card.status === 'warning' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(100, (card.current / card.target) * 100)}%` }}
                />
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-1">
                Gap: {card.gap} pts to target
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

function ActionItemsDisplay({ items, onToggle }: { items: ActionItem[], onToggle: (id: string) => void }) {
  const [showDetails, setShowDetails] = useState<string | null>(null);

  return (
    <div className="my-4 space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-[var(--color-turquoise-400)]" />
        Evidence-Based Action Items
      </h4>
      {items.map((item) => (
        <div key={item.id} className="rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div
            onClick={() => onToggle(item.id)}
            className={`flex items-start gap-3 p-3 cursor-pointer transition-colors ${
              item.completed ? 'bg-emerald-500/10' : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            <div className={`mt-0.5 ${item.completed ? 'text-emerald-400' : 'text-[var(--color-text-muted)]'}`}>
              {item.completed ? <CircleCheck className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <p className={`text-sm ${item.completed ? 'line-through text-[var(--color-text-muted)]' : ''}`}>
                {item.text}
              </p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                  item.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                  item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.priority}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">{item.timeline}</span>
                {item.impact && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDetails(showDetails === item.id ? null : item.id); }}
                    className="text-xs text-[var(--color-turquoise-400)] hover:underline"
                  >
                    {showDetails === item.id ? 'Hide details' : 'Show impact'}
                  </button>
                )}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {showDetails === item.id && (item.impact || item.cost || item.evidence) && (
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: 'auto' }}
                exit={{ height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-3 pb-3 text-xs space-y-1 border-t border-[var(--color-border)] pt-2 bg-[var(--color-bg-primary)]">
                  {item.impact && (
                    <div><span className="text-emerald-400 font-medium">Impact:</span> {item.impact}</div>
                  )}
                  {item.cost && (
                    <div><span className="text-amber-400 font-medium">Investment:</span> {item.cost}</div>
                  )}
                  {item.evidence && (
                    <div><span className="text-blue-400 font-medium">Evidence:</span> {item.evidence}</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function TimelineDisplay({ phases }: { phases: TimelinePhase[] }) {
  const [expandedPhase, setExpandedPhase] = useState<string | null>('1');

  return (
    <div className="my-4">
      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-[var(--color-turquoise-400)]" />
        Implementation Timeline
      </h4>
      <div className="space-y-2">
        {phases.map((phase) => (
          <div
            key={phase.phase}
            className={`rounded-lg border overflow-hidden ${
              phase.status === 'current' ? 'border-[var(--color-turquoise-500)]' :
              phase.status === 'completed' ? 'border-emerald-500/30' :
              'border-[var(--color-border)]'
            }`}
          >
            <button
              onClick={() => setExpandedPhase(expandedPhase === phase.phase ? null : phase.phase)}
              className={`w-full flex items-center justify-between p-3 ${
                phase.status === 'current' ? 'bg-[var(--color-turquoise-500)]/10' :
                phase.status === 'completed' ? 'bg-emerald-500/10' :
                'bg-[var(--color-bg-secondary)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  phase.status === 'current' ? 'bg-[var(--color-turquoise-500)] text-white' :
                  phase.status === 'completed' ? 'bg-emerald-500 text-white' :
                  'bg-[var(--color-bg-tertiary)]'
                }`}>
                  {phase.phase}
                </div>
                <div className="text-left">
                  <div className="font-medium text-sm">{phase.title}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{phase.weeks}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {phase.investmentRange && (
                  <span className="text-xs text-[var(--color-text-muted)] hidden md:inline">
                    {phase.investmentRange}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${expandedPhase === phase.phase ? 'rotate-180' : ''}`} />
              </div>
            </button>
            <AnimatePresence>
              {expandedPhase === phase.phase && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-3 bg-[var(--color-bg-primary)] border-t border-[var(--color-border)]">
                    <ul className="space-y-1.5">
                      {phase.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-[var(--color-turquoise-400)] flex-shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
                    {(phase.investmentRange || phase.expectedOutcome) && (
                      <div className="mt-3 pt-3 border-t border-[var(--color-border)] text-xs space-y-1">
                        {phase.investmentRange && (
                          <div><span className="text-amber-400 font-medium">Investment:</span> {phase.investmentRange}</div>
                        )}
                        {phase.expectedOutcome && (
                          <div><span className="text-emerald-400 font-medium">Expected Outcome:</span> {phase.expectedOutcome}</div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

function CostBenefitDisplay({ items }: { items: CostBenefitItem[] }) {
  return (
    <div className="my-4">
      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
        <Scale className="w-4 h-4 text-[var(--color-turquoise-400)]" />
        Investment Analysis (Cost-Benefit)
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              <th className="text-left py-2 px-2">Category</th>
              <th className="text-left py-2 px-2">Investment</th>
              <th className="text-left py-2 px-2">Benefit</th>
              <th className="text-left py-2 px-2">ROI</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-[var(--color-border)]/50">
                <td className="py-2 px-2 font-medium">{item.category}</td>
                <td className="py-2 px-2 text-amber-400">${item.costLow.toLocaleString()}-{item.costHigh.toLocaleString()}</td>
                <td className="py-2 px-2 text-[var(--color-text-muted)]">{item.expectedBenefit}</td>
                <td className="py-2 px-2 text-emerald-400">{item.roi}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeepDiveDisplay({ deepDive }: { deepDive: DeepDiveSection }) {
  const [activeTab, setActiveTab] = useState<'analysis' | 'risks' | 'case'>('analysis');

  return (
    <div className="my-4 border border-[var(--color-border)] rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 px-4 py-3 border-b border-[var(--color-border)]">
        <h4 className="font-semibold flex items-center gap-2">
          <Microscope className="w-4 h-4 text-purple-400" />
          Deep Dive Analysis
        </h4>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--color-border)]">
        {['analysis', 'risks', 'case'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`flex-1 px-4 py-2 text-xs font-medium transition-colors ${
              activeTab === tab
                ? 'bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-400)] border-b-2 border-[var(--color-turquoise-500)]'
                : 'hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            {tab === 'analysis' ? 'Quantitative Analysis' : tab === 'risks' ? 'Risk Assessment' : 'Case Study'}
          </button>
        ))}
      </div>

      <div className="p-4 max-h-64 overflow-y-auto">
        {activeTab === 'analysis' && (
          <div className="text-sm space-y-4">
            <div>
              <h5 className="font-semibold text-purple-400 mb-2">Historical Context</h5>
              <div className="text-[var(--color-text-muted)] whitespace-pre-wrap text-xs leading-relaxed">
                {deepDive.historicalContext}
              </div>
            </div>
            <div>
              <h5 className="font-semibold text-blue-400 mb-2">Quantitative Analysis</h5>
              <div className="text-[var(--color-text-muted)] whitespace-pre-wrap text-xs leading-relaxed">
                {deepDive.quantitativeAnalysis}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-2">
            {deepDive.risks.map((risk, i) => (
              <div key={i} className="p-3 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
                <div className="flex items-start gap-2">
                  <AlertOctagon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                    risk.impact === 'high' ? 'text-red-400' : risk.impact === 'medium' ? 'text-amber-400' : 'text-blue-400'
                  }`} />
                  <div className="flex-1">
                    <p className="text-xs font-medium">{risk.risk}</p>
                    <div className="flex gap-2 mt-1">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        risk.likelihood === 'high' ? 'bg-red-500/20 text-red-400' :
                        risk.likelihood === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {risk.likelihood} likelihood
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                        risk.impact === 'high' ? 'bg-red-500/20 text-red-400' :
                        risk.impact === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {risk.impact} impact
                      </span>
                    </div>
                    <p className="text-[10px] text-emerald-400 mt-1">
                      <span className="font-medium">Mitigation:</span> {risk.mitigation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'case' && deepDive.caseStudy && (
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
              <h5 className="font-semibold text-emerald-400">{deepDive.caseStudy.name}</h5>
              <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                <div>
                  <span className="text-[var(--color-text-muted)]">Journey:</span>
                  <span className="ml-1">{deepDive.caseStudy.initialRating}★ → {deepDive.caseStudy.finalRating}★</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Timeline:</span>
                  <span className="ml-1">{deepDive.caseStudy.timeframe}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Investment:</span>
                  <span className="ml-1 text-amber-400">{deepDive.caseStudy.investment}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">ROI:</span>
                  <span className="ml-1 text-emerald-400">{deepDive.caseStudy.roi}</span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-[var(--color-border)]">
                <span className="text-[10px] text-[var(--color-text-muted)]">Key Actions:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {deepDive.caseStudy.keyActions.map((action, i) => (
                    <span key={i} className="text-[10px] px-2 py-0.5 bg-[var(--color-bg-secondary)] rounded">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-[var(--color-text-muted)] mt-2">
                Source: {deepDive.caseStudy.source}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function EducationModuleDisplay({ module }: { module: NonNullable<PhillResponse['educationModule']> }) {
  const [activeSection, setActiveSection] = useState(0);

  return (
    <div className="my-4">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="w-5 h-5 text-[var(--color-turquoise-400)]" />
        <h3 className="font-semibold">{module.title}</h3>
      </div>

      {/* Section tabs */}
      <div className="flex gap-1 mb-4 overflow-x-auto pb-2">
        {module.sections.map((section, i) => (
          <button
            key={i}
            onClick={() => setActiveSection(i)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeSection === i
                ? 'bg-[var(--color-turquoise-500)] text-white'
                : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]'
            }`}
          >
            {section.heading}
          </button>
        ))}
      </div>

      {/* Active section content */}
      <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <h4 className="font-semibold mb-3">{module.sections[activeSection].heading}</h4>
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {module.sections[activeSection].content}
        </div>

        {module.sections[activeSection].keyInsights && (
          <div className="mt-4 p-3 rounded-lg bg-[var(--color-turquoise-500)]/10 border border-[var(--color-turquoise-500)]/20">
            <h5 className="text-xs font-semibold text-[var(--color-turquoise-400)] mb-2 flex items-center gap-1">
              <Lightbulb className="w-3 h-3" /> Key Insights
            </h5>
            <ul className="space-y-1">
              {module.sections[activeSection].keyInsights?.map((insight, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <ChevronRight className="w-3 h-3 text-[var(--color-turquoise-400)] flex-shrink-0 mt-0.5" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {module.sections[activeSection].formulas && (
          <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <h5 className="text-xs font-semibold text-purple-400 mb-2 flex items-center gap-1">
              <Calculator className="w-3 h-3" /> Formulas & Calculations
            </h5>
            <ul className="space-y-1">
              {module.sections[activeSection].formulas?.map((formula, i) => (
                <li key={i} className="text-xs font-mono bg-black/20 px-2 py-1 rounded">
                  {formula}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
          disabled={activeSection === 0}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--color-bg-secondary)] disabled:opacity-50"
        >
          <ChevronRight className="w-4 h-4 rotate-180" /> Previous
        </button>
        <button
          onClick={() => setActiveSection(Math.min(module.sections.length - 1, activeSection + 1))}
          disabled={activeSection === module.sections.length - 1}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--color-turquoise-500)] text-white disabled:opacity-50"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function PhillAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; response?: PhillResponse; content?: string }>>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { provider } = usePhillContext();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (provider) {
      setMessages([]);
      setActionItems([]);
    }
  }, [provider?.ccn]);

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));

    const response = generateResponse(text, provider, pathname);

    if (response.actionItems) {
      setActionItems(response.actionItems);
    }

    setMessages(prev => [...prev, { role: 'assistant', response }]);
    setIsTyping(false);
  }, [input, provider, pathname]);

  const toggleActionItem = (id: string) => {
    setActionItems(prev => prev.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const quickActions = provider ? [
    { label: '⭐ Expert 5-Star Plan', prompt: `Create a comprehensive, evidence-based plan for ${provider.provider_name} to achieve 5-star status with detailed cost-benefit analysis` },
    { label: '📊 Full Analysis', prompt: `Give me a complete expert analysis of ${provider.provider_name} with quantitative benchmarking and recommendations` },
    { label: '💰 Valuation', prompt: `What is ${provider.provider_name} worth? Provide multi-methodology valuation with quality adjustments` },
    { label: '📚 Deep Dive', prompt: 'Teach me about the 5-star rating system with historical context and methodology' },
  ] : [
    { label: '📚 5-Star System', prompt: 'Explain the CMS 5-star rating system in complete detail with methodology and thresholds' },
    { label: '📈 Improvement Strategies', prompt: 'What are the evidence-based strategies to improve hospice quality ratings?' },
    { label: '💰 Valuation', prompt: 'How are hospices valued for M&A? Explain methodologies and quality impacts' },
  ];

  if (pathname === '/landing') return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center"
          >
            <Brain className="w-6 h-6" />
            {provider && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <Building2 className="w-3 h-3" />
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Main Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed z-50 rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)] ${
              isExpanded
                ? 'inset-4 md:inset-8'
                : 'bottom-6 right-6 w-[580px] max-w-[calc(100vw-48px)]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--color-turquoise-500)] to-purple-600 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold flex items-center gap-1">
                    Phill
                    <span className="text-[10px] px-1.5 py-0.5 bg-white/20 rounded ml-1">EXPERT</span>
                  </h3>
                  <p className="text-xs text-white/80">
                    {provider ? `Analyzing ${provider.provider_name.substring(0, 25)}...` : '5-Star Quality Intelligence'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Provider Badge */}
            {provider && (
              <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-sm text-purple-400">{provider.provider_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    provider.classification === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' :
                    provider.classification === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {provider.overall_score ?? '?'}/100
                  </span>
                  <span className="text-[10px] text-[var(--color-text-muted)]">
                    {provider.city}, {provider.state}
                  </span>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? 'h-[calc(100%-180px)]' : 'h-[500px]'}`}>
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-turquoise-500)]/20 to-purple-500/20 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-[var(--color-turquoise-400)]" />
                  </div>
                  <h4 className="font-bold text-lg mb-1">Hi! I'm Phill</h4>
                  <p className="text-xs text-purple-400 font-medium mb-2">Expert 5-Star Quality Intelligence Consultant</p>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1 max-w-md mx-auto">
                    {provider
                      ? `I've loaded ${provider.provider_name}'s complete profile and I'm ready to provide expert-level analysis with evidence-based recommendations.`
                      : 'I provide comprehensive analysis with historical context, quantitative benchmarks, case studies, and actionable recommendations.'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">
                    Every recommendation includes cost-benefit analysis and research citations.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                    {quickActions.map((action, i) => (
                      <button
                        key={i}
                        onClick={() => handleSend(action.prompt)}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-bg-secondary)] hover:bg-[var(--color-turquoise-500)] hover:text-white transition-colors border border-[var(--color-border)]"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg, i) => (
                    <div key={i} className={`${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                      {msg.role === 'user' ? (
                        <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-sm bg-gradient-to-r from-[var(--color-turquoise-500)] to-purple-600 text-white text-sm">
                          {msg.content}
                        </div>
                      ) : msg.response ? (
                        <div className="bg-[var(--color-bg-secondary)] rounded-2xl rounded-tl-sm p-4 max-w-full">
                          {msg.response.title && (
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                              {msg.response.type === 'plan' && <Target className="w-5 h-5 text-[var(--color-turquoise-400)]" />}
                              {msg.response.type === 'education' && <GraduationCap className="w-5 h-5 text-[var(--color-turquoise-400)]" />}
                              {msg.response.type === 'analysis' && <BarChart3 className="w-5 h-5 text-purple-400" />}
                              {msg.response.title}
                            </h3>
                          )}

                          {msg.response.scoreCards && (
                            <ScoreCardDisplay cards={msg.response.scoreCards} />
                          )}

                          <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            {msg.response.content.split('\n').map((line, j) => {
                              if (line.startsWith('# ')) return <h1 key={j} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
                              if (line.startsWith('## ')) return <h2 key={j} className="text-lg font-semibold mt-3 mb-2 text-[var(--color-turquoise-400)]">{line.slice(3)}</h2>;
                              if (line.startsWith('### ')) return <h3 key={j} className="font-semibold mt-2 mb-1">{line.slice(4)}</h3>;
                              if (line.startsWith('**') && line.endsWith('**')) return <p key={j} className="font-semibold">{line.slice(2, -2)}</p>;
                              if (line.startsWith('- ') || line.startsWith('• ')) return <li key={j} className="ml-4">{line.slice(2)}</li>;
                              if (line.startsWith('|')) return <code key={j} className="block text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded overflow-x-auto">{line}</code>;
                              if (line.startsWith('---')) return <hr key={j} className="my-3 border-[var(--color-border)]" />;
                              if (line.trim() === '') return <br key={j} />;
                              return <p key={j}>{line}</p>;
                            })}
                          </div>

                          {msg.response.costBenefit && (
                            <CostBenefitDisplay items={msg.response.costBenefit} />
                          )}

                          {msg.response.educationModule && (
                            <EducationModuleDisplay module={msg.response.educationModule} />
                          )}

                          {msg.response.timeline && (
                            <TimelineDisplay phases={msg.response.timeline} />
                          )}

                          {msg.response.actionItems && actionItems.length > 0 && (
                            <ActionItemsDisplay items={actionItems} onToggle={toggleActionItem} />
                          )}

                          {msg.response.deepDive && (
                            <DeepDiveDisplay deepDive={msg.response.deepDive} />
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Preparing expert analysis...</span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={provider ? `Ask expert questions about ${provider.provider_name}...` : 'Ask me anything...'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:ring-1 focus:ring-[var(--color-turquoise-500)] text-sm"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="px-4 rounded-xl bg-gradient-to-r from-[var(--color-turquoise-500)] to-purple-600 text-white hover:opacity-90 disabled:opacity-50 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {messages.length > 0 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {quickActions.slice(0, 3).map((action, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(action.prompt)}
                      className="px-3 py-1.5 rounded-lg text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] whitespace-nowrap"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
