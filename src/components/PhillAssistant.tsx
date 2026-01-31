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
  ChevronUp, Maximize2, Minimize2, RefreshCw
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
// TYPES FOR INTERACTIVE COMPONENTS
// ============================================

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  timeline: string;
}

interface ScoreCard {
  metric: string;
  current: number;
  target: number;
  gap: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
}

interface TimelinePhase {
  phase: string;
  title: string;
  weeks: string;
  tasks: string[];
  status: 'completed' | 'current' | 'upcoming';
}

interface PhillResponse {
  type: 'text' | 'plan' | 'scorecard' | 'timeline' | 'education' | 'comparison';
  content: string;
  title?: string;
  providerName?: string;
  scoreCards?: ScoreCard[];
  actionItems?: ActionItem[];
  timeline?: TimelinePhase[];
  educationModule?: {
    title: string;
    sections: Array<{
      heading: string;
      content: string;
      visual?: 'chart' | 'table' | 'diagram';
    }>;
  };
}

// ============================================
// INTELLIGENT RESPONSE ENGINE
// ============================================

function calculateScoreCards(provider: ProviderData): ScoreCard[] {
  const cards: ScoreCard[] = [];

  const metrics = [
    { key: 'overall_score', name: 'Overall Score', target: 85 },
    { key: 'quality_score', name: 'Quality Score', target: 85 },
    { key: 'compliance_score', name: 'Compliance', target: 80 },
    { key: 'operational_score', name: 'Operations', target: 75 },
    { key: 'market_score', name: 'Market Position', target: 70 },
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
        status: current >= m.target ? 'excellent' : current >= m.target - 10 ? 'good' : current >= m.target - 20 ? 'warning' : 'critical'
      });
    }
  });

  return cards;
}

function generateFiveStarPlan(provider: ProviderData): PhillResponse {
  const name = provider.provider_name;
  const scoreCards = calculateScoreCards(provider);

  // Calculate gaps and priorities
  const gaps = scoreCards.filter(s => s.gap > 0).sort((a, b) => b.gap - a.gap);
  const topPriority = gaps[0];
  const secondPriority = gaps[1];

  // Estimate current stars
  const currentStars = provider.overall_score !== null
    ? provider.overall_score >= 85 ? 5
      : provider.overall_score >= 70 ? 4
      : provider.overall_score >= 55 ? 3
      : provider.overall_score >= 40 ? 2 : 1
    : 3;

  // Generate specific action items based on gaps
  const actionItems: ActionItem[] = [];

  if (topPriority) {
    if (topPriority.metric === 'Quality Score' || topPriority.metric === 'Overall Score') {
      actionItems.push(
        { id: '1', text: `Conduct comprehensive quality audit for ${name} - identify top 3 documentation gaps`, completed: false, priority: 'critical', timeline: 'Week 1' },
        { id: '2', text: `Implement daily pain assessment compliance tracking - target 100% completion`, completed: false, priority: 'critical', timeline: 'Week 1-2' },
        { id: '3', text: `Train all RNs on dyspnea screening protocol using Borg Scale`, completed: false, priority: 'high', timeline: 'Week 2' },
        { id: '4', text: `Create "Death Imminent" protocol with auto-triggered daily RN visits`, completed: false, priority: 'high', timeline: 'Week 2-3' },
        { id: '5', text: `Establish standing bowel regimen orders for all opioid patients`, completed: false, priority: 'high', timeline: 'Week 3' },
        { id: '6', text: `Launch weekly family satisfaction calls for active patients`, completed: false, priority: 'medium', timeline: 'Week 3-4' },
      );
    }
    if (topPriority.metric === 'Compliance') {
      actionItems.push(
        { id: '1', text: `Review last 3 years of survey history - identify repeat deficiency patterns`, completed: false, priority: 'critical', timeline: 'Week 1' },
        { id: '2', text: `Create Plan of Correction tracker with assigned owners and deadlines`, completed: false, priority: 'critical', timeline: 'Week 1' },
        { id: '3', text: `Implement mock survey program - monthly internal audits`, completed: false, priority: 'high', timeline: 'Week 2-4' },
        { id: '4', text: `Train staff on Conditions of Participation (CoP) requirements`, completed: false, priority: 'high', timeline: 'Week 2-3' },
      );
    }
    if (topPriority.metric === 'Operations') {
      actionItems.push(
        { id: '1', text: `Analyze current staffing patterns - identify weekend/evening gaps`, completed: false, priority: 'critical', timeline: 'Week 1' },
        { id: '2', text: `Create 24/7 RN on-call coverage schedule with <2 hour response SLA`, completed: false, priority: 'critical', timeline: 'Week 1-2' },
        { id: '3', text: `Implement visit productivity tracking by clinician`, completed: false, priority: 'high', timeline: 'Week 2-3' },
        { id: '4', text: `Establish referral-to-admission conversion tracking`, completed: false, priority: 'medium', timeline: 'Week 3-4' },
      );
    }
  }

  // Generate timeline
  const timeline: TimelinePhase[] = [
    {
      phase: '1',
      title: 'Foundation',
      weeks: 'Weeks 1-4',
      tasks: [
        `Complete baseline audit of ${name}'s quality metrics`,
        'Assign executive sponsor and project lead',
        'Set up daily tracking dashboards',
        'Launch quick-win improvements',
        'Begin staff training program'
      ],
      status: 'current'
    },
    {
      phase: '2',
      title: 'Acceleration',
      weeks: 'Weeks 5-8',
      tasks: [
        'Deploy all Phase 1 protocols to full team',
        'Implement peer accountability system',
        'Weekly quality review meetings',
        'Address secondary improvement areas',
        'Mid-point progress assessment'
      ],
      status: 'upcoming'
    },
    {
      phase: '3',
      title: 'Optimization',
      weeks: 'Weeks 9-12',
      tasks: [
        'Refine processes based on data',
        'Build sustainability into daily ops',
        'Prepare for next CAHPS survey cycle',
        'Document best practices',
        'Final progress review'
      ],
      status: 'upcoming'
    },
    {
      phase: '4',
      title: 'Excellence',
      weeks: 'Months 4-6',
      tasks: [
        'Achieve 5-star quality metrics',
        'Sustain improvements long-term',
        'Train internal quality champions',
        'Build continuous improvement culture',
        'Prepare for ongoing excellence'
      ],
      status: 'upcoming'
    }
  ];

  // Calculate investment
  const totalGap = gaps.reduce((sum, g) => sum + g.gap, 0);
  const investmentLow = Math.round(totalGap * 1500);
  const investmentHigh = Math.round(totalGap * 3000);

  const content = `
# ${name} - Path to 5-Star Excellence

## Current State
**Estimated Rating:** ${currentStars} Star${currentStars !== 1 ? 's' : ''}
**Overall Score:** ${provider.overall_score ?? 'N/A'}/100
**Classification:** ${provider.classification || 'Unclassified'}
**Location:** ${provider.city}, ${provider.state} ${provider.con_state ? '(CON Protected)' : ''}

## Gap Analysis
${gaps.length === 0 ? '✅ **Congratulations!** ' + name + ' is already performing at or near 5-star levels.' :
  gaps.map((g, i) => `**${i + 1}. ${g.metric}:** ${g.current}% → ${g.target}% (Gap: ${g.gap} pts)`).join('\n')}

## Investment Required
**Estimated Total:** $${investmentLow.toLocaleString()} - $${investmentHigh.toLocaleString()}

- Training & Education: $15,000 - $30,000
- Process Improvement: $10,000 - $20,000
- Staffing Adjustments: $20,000 - $50,000
- Technology/Tools: $5,000 - $15,000

## Expected Timeline
${totalGap > 60 ? '**8-12 months** to achieve 5-star status' :
  totalGap > 30 ? '**4-6 months** to achieve 5-star status' :
  '**2-4 months** to achieve 5-star status'}

## Key Success Factors
1. **Executive Commitment** - Administrator must champion quality daily
2. **Staff Engagement** - Everyone understands WHY each measure matters
3. **Data Visibility** - Real-time dashboards for all to see
4. **Accountability** - Clear ownership with consequences
5. **Celebration** - Recognize progress, not just final achievement
`;

  return {
    type: 'plan',
    title: `${name} - 5-Star Roadmap`,
    providerName: name,
    content,
    scoreCards,
    actionItems,
    timeline
  };
}

function generateEducationModule(topic: string, provider: ProviderData | null): PhillResponse {
  const providerContext = provider ? ` (with examples specific to ${provider.provider_name})` : '';

  if (topic.includes('5') && topic.includes('star')) {
    return {
      type: 'education',
      title: 'Understanding the 5-Star Rating System',
      content: '',
      educationModule: {
        title: 'CMS 5-Star Quality Rating System' + providerContext,
        sections: [
          {
            heading: 'What is the 5-Star System?',
            content: `The CMS 5-Star Quality Rating System helps consumers, families, and caregivers compare healthcare providers. For hospice, ratings are based on quality measures derived from clinical data and family surveys (CAHPS).

${provider ? `**${provider.provider_name}'s Current Position:**
• Overall Score: ${provider.overall_score ?? 'N/A'}/100
• CAHPS Star Rating: ${provider.cms_cahps_star ?? 'N/A'} stars
• Quality Star Rating: ${provider.cms_quality_star ?? 'N/A'} stars` : ''}`,
            visual: 'chart'
          },
          {
            heading: 'The Three Pillars of Quality',
            content: `**1. Clinical Quality Measures (HCI)**
The Hospice Care Index measures:
• Pain assessment completion (100% target)
• Dyspnea screening and treatment
• Bowel regimen for opioid patients
• Comprehensive assessment within 5 days
• Timely initiation of care

**2. Visits in Last Days of Life (HVLDL)**
Measures RN/MSW visits in patient's final 3 days:
• 5-Star Threshold: ≥95%
• National Average: ~82%
${provider ? `• ${provider.provider_name}: Track and improve end-of-life presence` : ''}

**3. CAHPS Family Experience Survey**
Measures family satisfaction across:
• Communication with hospice team
• Getting help quickly
• Treating patient with respect
• Emotional and spiritual support
• Training family to care for patient`,
            visual: 'diagram'
          },
          {
            heading: 'How Ratings Are Calculated',
            content: `**Star Rating Thresholds:**
| Stars | Score Range | Interpretation |
|-------|-------------|----------------|
| ⭐⭐⭐⭐⭐ | 85-100 | Much above average |
| ⭐⭐⭐⭐ | 70-84 | Above average |
| ⭐⭐⭐ | 55-69 | Average |
| ⭐⭐ | 40-54 | Below average |
| ⭐ | 0-39 | Much below average |

${provider ? `**${provider.provider_name}'s Position:**
Current Score: ${provider.overall_score ?? 'N/A'} = ${
  provider.overall_score !== null
    ? provider.overall_score >= 85 ? '5 Stars ⭐⭐⭐⭐⭐'
    : provider.overall_score >= 70 ? '4 Stars ⭐⭐⭐⭐'
    : provider.overall_score >= 55 ? '3 Stars ⭐⭐⭐'
    : provider.overall_score >= 40 ? '2 Stars ⭐⭐'
    : '1 Star ⭐'
    : 'Unknown'
}` : ''}`,
            visual: 'table'
          },
          {
            heading: 'Path to 5 Stars',
            content: `**Quick Wins (30 Days):**
1. Audit current documentation compliance
2. Implement same-day admission visits
3. Train staff on pain assessment tools
4. Create death-imminent protocols

**Medium-Term (90 Days):**
1. Launch comprehensive training program
2. Optimize EHR workflows
3. Implement quality dashboards
4. Peer chart audits monthly

**Long-Term (6-12 Months):**
1. Build continuous improvement culture
2. Sustain excellence through accountability
3. Prepare for ongoing CAHPS cycles

${provider ? `\n**Specific for ${provider.provider_name}:**
Focus first on ${provider.quality_score !== null && provider.quality_score < 70 ? 'quality measures' : provider.compliance_score !== null && provider.compliance_score < 70 ? 'compliance' : 'sustaining current performance'}` : ''}`
          }
        ]
      }
    };
  }

  // Default education response
  return {
    type: 'education',
    title: 'Hospice Quality Education',
    content: `I can teach you about:
• **5-Star Rating System** - How ratings work and what they mean
• **Quality Measures** - HCI, HVLDL, CAHPS explained
• **Improvement Strategies** - Proven tactics to boost scores
• **Survey Preparation** - How to prepare for CMS surveys
• **M&A Implications** - How quality affects valuation

What would you like to learn about?`,
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
        lowerQuery.includes('how can') || lowerQuery.includes('how do')) {
      return generateFiveStarPlan(provider);
    }

    // Analysis questions
    if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis') || lowerQuery.includes('tell me') ||
        lowerQuery.includes('about') || lowerQuery.includes('summary') || lowerQuery.includes('overview')) {
      const plan = generateFiveStarPlan(provider);
      plan.title = `${provider.provider_name} - Complete Analysis`;
      return plan;
    }

    // Valuation questions
    if (lowerQuery.includes('value') || lowerQuery.includes('worth') || lowerQuery.includes('price')) {
      const adc = provider.estimated_adc || 30;
      const qualityMult = (provider.overall_score || 50) >= 80 ? 1.2 : (provider.overall_score || 50) >= 65 ? 1.0 : 0.85;
      const conMult = provider.con_state ? 1.15 : 1.0;
      const baseValue = adc * 35000;
      const adjustedValue = Math.round(baseValue * qualityMult * conMult);

      return {
        type: 'text',
        content: `# ${provider.provider_name} - Valuation Analysis

## Key Value Drivers
- **ADC:** ${adc} patients
- **Quality Score:** ${provider.overall_score ?? 'N/A'}/100 (${qualityMult >= 1.1 ? '+20% premium' : qualityMult >= 1.0 ? 'market rate' : '-15% discount'})
- **CON State:** ${provider.con_state ? 'Yes (+15% premium)' : 'No'}
- **Classification:** ${provider.classification}

## Valuation Estimates

### Per-ADC Method
| Scenario | Per-ADC | Total Value |
|----------|---------|-------------|
| Conservative | $25,000 | $${(adc * 25000).toLocaleString()} |
| Market Rate | $35,000 | $${(adc * 35000).toLocaleString()} |
| Premium | $45,000 | $${(adc * 45000).toLocaleString()} |

### Quality-Adjusted Value
**Indicated Value: $${adjustedValue.toLocaleString()}**
(Base × Quality Adj × CON Adj)

## Deal Considerations
${!provider.pe_backed && !provider.chain_affiliated ? '✅ **Independent Owner** - May be open to seller financing / owner carry-back' :
  provider.pe_backed ? '⚠️ **PE-Backed** - Expect formal process, limited negotiation flexibility' :
  '📋 **Chain Affiliated** - May have corporate approval requirements'}

${provider.classification === 'GREEN' ? '✅ Quality profile supports premium valuation' :
  provider.classification === 'YELLOW' ? '⚠️ Factor in quality improvement costs ($50-150K)' :
  '🔴 Significant discount warranted for quality remediation'}`
      };
    }
  }

  // Education/teaching queries
  if (lowerQuery.includes('explain') || lowerQuery.includes('teach') || lowerQuery.includes('learn') ||
      lowerQuery.includes('understand') || lowerQuery.includes('what is') || lowerQuery.includes('how does') ||
      lowerQuery.includes('rating') || lowerQuery.includes('system')) {
    return generateEducationModule(lowerQuery, provider);
  }

  // If on a provider page but no specific query matched, give provider-specific intro
  if (provider && pathname.startsWith('/provider/')) {
    return {
      type: 'text',
      content: `# Welcome! I'm Phill, your ${provider.provider_name} expert.

I've loaded all available data for **${provider.provider_name}** and I'm ready to help you with:

## 🎯 What I Can Do For You

### 📊 **Analyze This Provider**
Get a complete breakdown of quality scores, market position, and M&A potential.

### ⭐ **5-Star Roadmap**
I'll create a detailed, week-by-week plan showing exactly how ${provider.provider_name} can achieve 5-star status, including:
- Specific action items (not generic advice)
- Investment requirements
- Timeline with milestones
- Priority-ranked improvements

### 💰 **Valuation Analysis**
Understand what ${provider.provider_name} is worth using ADC, revenue, and EBITDA multiples.

### 📚 **Learn & Understand**
I can teach you about quality measures, the 5-star system, and what drives hospice value.

---

**Quick Start:** Click "5-Star Path" below or ask me anything about ${provider.provider_name}!

**Current Status:**
- Score: ${provider.overall_score ?? 'N/A'}/100
- Classification: ${provider.classification || 'Unknown'}
- Location: ${provider.city}, ${provider.state}`
    };
  }

  // Default response without provider
  return {
    type: 'text',
    content: `# Hi! I'm Phill, your Hospice M&A Intelligence Expert.

I'm not just a chatbot - I'm an interactive teaching and planning tool that can:

## 🎓 **Teach & Educate**
- Explain the 5-star rating system in depth
- Break down quality measures (HCI, HVLDL, CAHPS)
- Show you exactly how ratings are calculated

## 📋 **Create Detailed Plans**
- Generate provider-specific improvement roadmaps
- Build week-by-week action plans
- Calculate investment requirements and ROI

## 💰 **Analyze & Value**
- Valuation using multiple methodologies
- Due diligence checklists
- Market and competitive analysis

---

**To get started:**
1. Navigate to a specific provider page for provider-specific analysis
2. Or ask me to explain any topic (try: "explain the 5-star system")

**Popular Topics:**
- "How does the 5-star rating work?"
- "What are the quality measures?"
- "How can a hospice improve its rating?"`
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
            <div className="text-xs text-[var(--color-text-muted)]">
              Target: {card.target}%
            </div>
          </div>
          {card.gap > 0 && (
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
          )}
        </div>
      ))}
    </div>
  );
}

function ActionItemsDisplay({ items, onToggle }: { items: ActionItem[], onToggle: (id: string) => void }) {
  return (
    <div className="my-4 space-y-2">
      <h4 className="font-semibold text-sm flex items-center gap-2 mb-3">
        <ClipboardList className="w-4 h-4 text-[var(--color-turquoise-400)]" />
        Action Items
      </h4>
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onToggle(item.id)}
          className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
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
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2 py-0.5 rounded ${
                item.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                item.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                item.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                'bg-blue-500/20 text-blue-400'
              }`}>
                {item.priority}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">{item.timeline}</span>
            </div>
          </div>
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
              <ChevronDown className={`w-4 h-4 transition-transform ${expandedPhase === phase.phase ? 'rotate-180' : ''}`} />
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
                    <ul className="space-y-1">
                      {phase.tasks.map((task, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="w-4 h-4 text-[var(--color-turquoise-400)] flex-shrink-0 mt-0.5" />
                          <span>{task}</span>
                        </li>
                      ))}
                    </ul>
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

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));

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
    { label: '⭐ 5-Star Path', prompt: `Create a detailed plan for ${provider.provider_name} to achieve 5-star status` },
    { label: '📊 Full Analysis', prompt: `Give me a complete analysis of ${provider.provider_name}` },
    { label: '💰 Valuation', prompt: `What is ${provider.provider_name} worth?` },
    { label: '📚 Learn', prompt: 'Teach me about the 5-star rating system' },
  ] : [
    { label: '📚 5-Star System', prompt: 'Explain how the 5-star rating system works' },
    { label: '📈 Improvement', prompt: 'How can a hospice improve its quality rating?' },
    { label: '💰 Valuation', prompt: 'How are hospices valued for M&A?' },
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
                : 'bottom-6 right-6 w-[520px] max-w-[calc(100vw-48px)]'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Phill</h3>
                  <p className="text-xs text-white/80">
                    {provider ? `Analyzing ${provider.provider_name.substring(0, 30)}` : 'M&A Intelligence Expert'}
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
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  provider.classification === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' :
                  provider.classification === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {provider.overall_score ?? '?'}/100
                </span>
              </div>
            )}

            {/* Messages */}
            <div className={`overflow-y-auto p-4 space-y-4 ${isExpanded ? 'h-[calc(100%-180px)]' : 'h-[450px]'}`}>
              {messages.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--color-turquoise-500)]/20 to-purple-500/20 flex items-center justify-center">
                    <Brain className="w-10 h-10 text-[var(--color-turquoise-400)]" />
                  </div>
                  <h4 className="font-bold text-lg mb-2">Hi! I'm Phill</h4>
                  <p className="text-sm text-[var(--color-text-muted)] mb-1">
                    {provider
                      ? `I've loaded ${provider.provider_name}'s data and I'm ready to create a detailed 5-star roadmap.`
                      : 'Your interactive hospice M&A intelligence expert.'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] mb-6">
                    I can teach, analyze, and create detailed action plans.
                  </p>

                  <div className="flex flex-wrap justify-center gap-2">
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
                        <div className="max-w-[85%] p-3 rounded-2xl rounded-tr-sm bg-[var(--color-turquoise-500)] text-white text-sm">
                          {msg.content}
                        </div>
                      ) : msg.response ? (
                        <div className="bg-[var(--color-bg-secondary)] rounded-2xl rounded-tl-sm p-4 max-w-full">
                          {msg.response.title && (
                            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                              {msg.response.type === 'plan' && <Target className="w-5 h-5 text-[var(--color-turquoise-400)]" />}
                              {msg.response.type === 'education' && <GraduationCap className="w-5 h-5 text-[var(--color-turquoise-400)]" />}
                              {msg.response.title}
                            </h3>
                          )}

                          {msg.response.scoreCards && (
                            <ScoreCardDisplay cards={msg.response.scoreCards} />
                          )}

                          <div className="text-sm whitespace-pre-wrap leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                            {msg.response.content.split('\n').map((line, j) => {
                              if (line.startsWith('# ')) return <h1 key={j} className="text-xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
                              if (line.startsWith('## ')) return <h2 key={j} className="text-lg font-semibold mt-3 mb-2">{line.slice(3)}</h2>;
                              if (line.startsWith('### ')) return <h3 key={j} className="font-semibold mt-2 mb-1">{line.slice(4)}</h3>;
                              if (line.startsWith('**') && line.endsWith('**')) return <p key={j} className="font-semibold">{line.slice(2, -2)}</p>;
                              if (line.startsWith('- ') || line.startsWith('• ')) return <li key={j} className="ml-4">{line.slice(2)}</li>;
                              if (line.startsWith('|')) return <code key={j} className="block text-xs font-mono bg-black/20 px-2 py-1 rounded">{line}</code>;
                              if (line.trim() === '') return <br key={j} />;
                              return <p key={j}>{line}</p>;
                            })}
                          </div>

                          {msg.response.educationModule && (
                            <EducationModuleDisplay module={msg.response.educationModule} />
                          )}

                          {msg.response.timeline && (
                            <TimelineDisplay phases={msg.response.timeline} />
                          )}

                          {msg.response.actionItems && actionItems.length > 0 && (
                            <ActionItemsDisplay items={actionItems} onToggle={toggleActionItem} />
                          )}
                        </div>
                      ) : null}
                    </div>
                  ))}

                  {isTyping && (
                    <div className="flex items-center gap-2 text-[var(--color-text-muted)]">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Analyzing...</span>
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
                  placeholder={provider ? `Ask about ${provider.provider_name}...` : 'Ask me anything...'}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:ring-1 focus:ring-[var(--color-turquoise-500)] text-sm"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  className="px-4 rounded-xl bg-[var(--color-turquoise-500)] text-white hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 transition-colors"
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
