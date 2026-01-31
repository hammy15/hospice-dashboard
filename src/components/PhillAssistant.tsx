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
  Gauge, Info, ThumbsUp, ThumbsDown
} from 'lucide-react';
import FiveStarDataset, {
  queryKnowledge,
  getActionPlan,
  getImprovementRecommendations,
  searchKnowledge
} from '@/lib/knowledge';

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
  ownership_type: string | null;
  estimated_adc: number | null;
  // Hospice Quality Measures
  hci_score: number | null;
  hci_percentile: number | null;
  hvldl_score: number | null;
  timely_care_score: number | null;
  beliefs_values_score: number | null;
  communication_score: number | null;
  training_score: number | null;
  overall_rating_score: number | null;
  willing_recommend_score: number | null;
  // Classification and status
  classification: string | null;
  is_con_state: boolean;
  // Additional data
  address?: string | null;
  phone?: string | null;
  chain_organization?: string | null;
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

// Hook to update Phill context from provider pages
export function useSetPhillProvider(provider: ProviderData | null) {
  const { setProvider } = usePhillContext();
  useEffect(() => {
    setProvider(provider);
    return () => setProvider(null);
  }, [provider, setProvider]);
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface QuickAction {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

// ============================================
// PROVIDER-SPECIFIC ANALYSIS ENGINE
// ============================================

function getScoreQuality(score: number | null, benchmarks: { excellent: number; good: number; fair: number }): { level: string; color: string; description: string } {
  if (score === null) return { level: 'Unknown', color: 'gray', description: 'No data available' };
  if (score >= benchmarks.excellent) return { level: 'Excellent', color: 'emerald', description: 'Top performer, well above national average' };
  if (score >= benchmarks.good) return { level: 'Good', color: 'turquoise', description: 'Above average performance' };
  if (score >= benchmarks.fair) return { level: 'Fair', color: 'amber', description: 'Average performance, improvement opportunity' };
  return { level: 'Needs Improvement', color: 'red', description: 'Below average, priority focus area' };
}

function generateProviderSpecificAnalysis(provider: ProviderData, query: string): string | null {
  const lowerQuery = query.toLowerCase();
  const name = provider.provider_name;
  const classification = provider.classification || 'Unclassified';

  // Quality score assessments
  const hciQuality = getScoreQuality(provider.hci_score, { excellent: 85, good: 75, fair: 65 });
  const hvldlQuality = getScoreQuality(provider.hvldl_score, { excellent: 90, good: 80, fair: 70 });
  const commQuality = getScoreQuality(provider.communication_score, { excellent: 85, good: 78, fair: 70 });
  const overallQuality = getScoreQuality(provider.overall_score, { excellent: 85, good: 75, fair: 60 });

  // Full analysis when asking about the provider
  if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis') ||
      lowerQuery.includes('about this') || lowerQuery.includes('this provider') ||
      lowerQuery.includes('this hospice') || lowerQuery.includes('tell me about') ||
      lowerQuery.includes('overview') || lowerQuery.includes('summary')) {

    return `**Comprehensive Analysis: ${name}**

**Location:** ${provider.city}, ${provider.state} ${provider.is_con_state ? '(CON-Protected Market)' : ''}
**CCN:** ${provider.ccn}
**Classification:** ${classification}
**Ownership:** ${provider.ownership_type || 'Not specified'}
${provider.chain_organization ? `**Chain Affiliation:** ${provider.chain_organization}` : '**Chain Affiliation:** Independent (Endemic)'}

---

**EXECUTIVE SUMMARY**

${name} is classified as **${classification}** based on our M&A scoring methodology. ${
  classification === 'GREEN'
    ? 'This provider meets all quality thresholds and represents a prime acquisition candidate with minimal remediation requirements.'
    : classification === 'YELLOW'
    ? 'This provider shows mixed indicators requiring additional due diligence and a post-acquisition improvement plan.'
    : 'This provider presents elevated risk and would require significant remediation post-acquisition.'
}

**Overall Score:** ${provider.overall_score !== null ? `${provider.overall_score}/100 (${overallQuality.level})` : 'Data not available'}

---

**QUALITY METRICS DEEP DIVE**

**1. Hospice Care Index (HCI): ${provider.hci_score !== null ? `${provider.hci_score}%` : 'N/A'}** — ${hciQuality.level}
${provider.hci_score !== null ? `
This composite measure evaluates clinical quality across multiple dimensions:
- Timeliness of care initiation
- Pain assessment completion
- Dyspnea screening
- Bowel regimen documentation
- Comprehensive assessment within 5 days

${provider.hci_score >= 85
  ? '✓ **Strong Performance:** HCI above 85% indicates excellent clinical protocols and documentation. This is a key quality differentiator in the market.'
  : provider.hci_score >= 75
  ? '◐ **Good Performance:** HCI between 75-85% shows solid clinical care. Minor improvements in documentation or protocol adherence could push this into excellence territory.'
  : provider.hci_score >= 65
  ? '⚠️ **Improvement Needed:** HCI below 75% suggests gaps in clinical protocols or documentation. Focus areas: assessment timeliness, symptom management documentation.'
  : '⛔ **Priority Focus:** HCI below 65% indicates significant clinical quality concerns. Comprehensive review of care protocols, staff training, and documentation systems recommended.'
}
${provider.hci_percentile ? `\n**Percentile Rank:** ${provider.hci_percentile}th percentile nationally` : ''}
` : 'No HCI data available. This may indicate a new provider or data reporting issues.'}

**2. Hospice Visits in Last Days of Life (HVLDL): ${provider.hvldl_score !== null ? `${provider.hvldl_score}%` : 'N/A'}** — ${hvldlQuality.level}
${provider.hvldl_score !== null ? `
This critical measure tracks RN and MSW visits in the final 3 days of life:

${provider.hvldl_score >= 90
  ? '✓ **Exceptional:** Above 90% indicates strong commitment to end-of-life presence. Families highly value this, reflected in CAHPS scores.'
  : provider.hvldl_score >= 80
  ? '◐ **Solid:** 80-90% is above average. Consider protocols to ensure visits even on weekends/holidays for further improvement.'
  : provider.hvldl_score >= 70
  ? '⚠️ **Below Average:** 70-80% suggests gaps in end-of-life coverage. Implement 24/7 on-call protocols and predictive models for identifying patients approaching end-of-life.'
  : '⛔ **Critical Gap:** Below 70% significantly impacts family experience and CAHPS scores. Immediate attention needed on staffing coverage and death imminent protocols.'
}
` : 'No HVLDL data available.'}

**3. CAHPS Communication: ${provider.communication_score !== null ? `${provider.communication_score}%` : 'N/A'}** — ${commQuality.level}
${provider.communication_score !== null ? `
Family perception of communication directly impacts referral relationships and overall satisfaction:

${provider.communication_score >= 85
  ? '✓ **Excellent:** Strong communication skills across the team. This drives word-of-mouth referrals and physician trust.'
  : provider.communication_score >= 78
  ? '◐ **Good:** Above average communication. Consider structured family conferences and more proactive updates to reach excellence.'
  : provider.communication_score >= 70
  ? '⚠️ **Average:** Room for improvement. Implement communication training, set family contact frequency standards, improve care plan education.'
  : '⛔ **Priority:** Poor communication scores significantly impact referral relationships. Comprehensive training program needed.'
}
` : 'No communication data available.'}

**4. Overall CAHPS Rating: ${provider.overall_rating_score !== null ? `${provider.overall_rating_score}%` : 'N/A'}**
${provider.overall_rating_score !== null ? `
This is the "bottom line" family satisfaction metric. ${provider.overall_rating_score >= 85 ? 'Excellent performance.' : provider.overall_rating_score >= 75 ? 'Good performance.' : 'Improvement opportunity.'}
` : ''}

**5. Willingness to Recommend: ${provider.willing_recommend_score !== null ? `${provider.willing_recommend_score}%` : 'N/A'}**
${provider.willing_recommend_score !== null ? `
The ultimate loyalty metric. ${provider.willing_recommend_score >= 85 ? 'Strong advocacy from families.' : provider.willing_recommend_score >= 75 ? 'Good recommendation rate.' : 'Focus on service recovery and experience improvement.'}
` : ''}

---

**OPERATIONAL METRICS**

**Estimated Average Daily Census (ADC):** ${provider.estimated_adc !== null ? provider.estimated_adc : 'Not available'}
${provider.estimated_adc !== null ? `
${provider.estimated_adc >= 100
  ? '**Large Provider:** ADC 100+ indicates significant market presence. Benefits from economies of scale, established referral networks, and operational infrastructure.'
  : provider.estimated_adc >= 50
  ? '**Mid-Size Provider:** ADC 50-100 represents a solid operational platform. Good balance of scale and manageability for integration.'
  : provider.estimated_adc >= 25
  ? '**Small-Medium Provider:** ADC 25-50 is typical for regional providers. May benefit from management support post-acquisition.'
  : '**Small Provider:** ADC under 25 suggests limited market penetration or new operation. Higher operational risk but potentially attractive valuation.'
}

**Valuation Estimate (ADC Method):**
- Conservative: $${((provider.estimated_adc || 0) * 25000).toLocaleString()} (ADC × $25K)
- Mid-Range: $${((provider.estimated_adc || 0) * 35000).toLocaleString()} (ADC × $35K)
- Premium: $${((provider.estimated_adc || 0) * 45000).toLocaleString()} (ADC × $45K)
` : ''}

---

**MARKET POSITION**

**State:** ${provider.state}
${provider.is_con_state ? `
✓ **CON-Protected Market**
This hospice operates in a Certificate of Need state, which provides:
- Regulatory barriers to new competitor entry
- Protected market position
- Premium valuation multiple (typically 15-25% above non-CON)
- Acquisition is primary market entry strategy for buyers
` : `
◐ **Non-CON Market**
Open market entry allows new competitors. Competitive dynamics driven by:
- Quality reputation
- Referral relationships
- Geographic coverage
- Payer mix optimization
`}

---

**M&A IMPLICATIONS**

${classification === 'GREEN' ? `
**Investment Thesis:** ${name} is a prime acquisition candidate.

**Strengths:**
${provider.overall_score && provider.overall_score >= 75 ? '✓ Strong overall quality score' : ''}
${provider.hci_score && provider.hci_score >= 75 ? '✓ Good clinical quality (HCI)' : ''}
${provider.is_con_state ? '✓ CON protection provides competitive moat' : ''}
${!provider.chain_organization ? '✓ Independent operator - potential owner carry-back' : ''}

**Suggested Approach:**
1. Initial outreach to gauge seller interest
2. Quality data verification in due diligence
3. Management team assessment
4. Integration planning with minimal disruption focus
` : classification === 'YELLOW' ? `
**Investment Thesis:** ${name} presents a value-add opportunity with improvement potential.

**Considerations:**
- Quality metrics show room for improvement
- Post-acquisition operational enhancement needed
- Pricing should reflect improvement investment
- Timeline: 6-12 months for meaningful rating improvement

**Due Diligence Focus:**
1. Root cause analysis of quality gaps
2. Staffing stability and turnover data
3. Survey history and deficiency patterns
4. Management team capability
` : `
**Investment Thesis:** ${name} requires significant remediation and presents elevated risk.

**Risk Factors:**
- Quality metrics below acceptable thresholds
- May have survey/compliance concerns
- Potential for continued deterioration
- Higher integration complexity

**Recommendation:** Deep due diligence before proceeding. Consider pass unless compelling strategic rationale.
`}

---

What specific aspect would you like me to elaborate on?
- Quality improvement action plan
- Detailed valuation analysis
- Due diligence checklist
- Comparison to market benchmarks`;
  }

  // Quality-specific questions
  if (lowerQuery.includes('quality') || lowerQuery.includes('score') || lowerQuery.includes('rating') ||
      lowerQuery.includes('measure') || lowerQuery.includes('metric')) {
    return `**Quality Analysis: ${name}**

**Overall Quality Position:** ${overallQuality.level}

${provider.overall_score !== null ? `
**Composite Score:** ${provider.overall_score}/100

This score incorporates multiple quality dimensions weighted by M&A relevance:
` : ''}

**CAHPS Survey Results (Family Experience)**

| Measure | Score | Assessment |
|---------|-------|------------|
| Overall Rating | ${provider.overall_rating_score ?? 'N/A'}% | ${provider.overall_rating_score ? (provider.overall_rating_score >= 85 ? 'Excellent' : provider.overall_rating_score >= 75 ? 'Good' : 'Needs Work') : '—'} |
| Would Recommend | ${provider.willing_recommend_score ?? 'N/A'}% | ${provider.willing_recommend_score ? (provider.willing_recommend_score >= 85 ? 'Strong' : provider.willing_recommend_score >= 75 ? 'Good' : 'Concern') : '—'} |
| Communication | ${provider.communication_score ?? 'N/A'}% | ${commQuality.level} |
| Training Family | ${provider.training_score ?? 'N/A'}% | ${provider.training_score ? (provider.training_score >= 80 ? 'Good' : 'Opportunity') : '—'} |
| Beliefs/Values | ${provider.beliefs_values_score ?? 'N/A'}% | ${provider.beliefs_values_score ? (provider.beliefs_values_score >= 85 ? 'Excellent' : 'Review') : '—'} |

**Clinical Quality Measures**

| Measure | Score | Assessment |
|---------|-------|------------|
| HCI (Composite) | ${provider.hci_score ?? 'N/A'}% | ${hciQuality.level} |
| HVLDL | ${provider.hvldl_score ?? 'N/A'}% | ${hvldlQuality.level} |
| Timely Care | ${provider.timely_care_score ?? 'N/A'}% | ${provider.timely_care_score ? (provider.timely_care_score >= 80 ? 'Good' : 'Review') : '—'} |

**Key Observations:**
${provider.hci_score !== null && provider.hci_score < 75 ? '⚠️ HCI below 75% indicates clinical documentation or protocol gaps\n' : ''}${provider.hvldl_score !== null && provider.hvldl_score < 80 ? '⚠️ HVLDL below 80% suggests end-of-life coverage issues\n' : ''}${provider.communication_score !== null && provider.communication_score < 78 ? '⚠️ Communication scores below average affect referral relationships\n' : ''}${provider.overall_score !== null && provider.overall_score >= 80 ? '✓ Overall strong quality profile\n' : ''}

**Improvement Priority:**
${provider.hci_score !== null && provider.communication_score !== null && provider.hci_score < provider.communication_score ?
  '1. Focus on clinical quality (HCI) first - biggest impact on overall rating' :
  '1. Focus on family experience (CAHPS) - drives referrals'
}

Would you like specific action plans for any of these measures?`;
  }

  // Valuation questions
  if (lowerQuery.includes('value') || lowerQuery.includes('worth') || lowerQuery.includes('valuation') ||
      lowerQuery.includes('price') || lowerQuery.includes('multiple') || lowerQuery.includes('buy')) {
    const adc = provider.estimated_adc || 0;
    const qualityMultiplier = (provider.overall_score || 50) >= 80 ? 1.2 : (provider.overall_score || 50) >= 65 ? 1.0 : 0.85;
    const conMultiplier = provider.is_con_state ? 1.15 : 1.0;

    return `**Valuation Analysis: ${name}**

**Key Value Drivers**

1. **Average Daily Census (ADC):** ${adc > 0 ? adc : 'Unknown'}
   ${adc > 0 ? `- Annual Patient Days: ~${(adc * 365).toLocaleString()}` : ''}
   ${adc > 0 ? `- Estimated Annual Revenue: $${((adc * 365 * 185 * 0.85)).toLocaleString()} (assuming $185/day, 85% Medicare)` : ''}

2. **Quality Score:** ${provider.overall_score || 'N/A'}
   - Quality Premium/Discount: ${qualityMultiplier >= 1.1 ? '+20% (Premium)' : qualityMultiplier >= 1.0 ? 'Market rate' : '-15% (Discount)'}

3. **Market Position:** ${provider.state}
   - CON Protection: ${provider.is_con_state ? 'Yes (+15% premium)' : 'No (market rate)'}
   - Ownership: ${provider.chain_organization ? 'Chain-affiliated' : 'Independent'}

---

**VALUATION METHODOLOGIES**

**Method 1: Per-ADC Valuation**
${adc > 0 ? `
| Scenario | Per-ADC | Value |
|----------|---------|-------|
| Conservative | $25,000 | $${(adc * 25000).toLocaleString()} |
| Market Rate | $35,000 | $${(adc * 35000).toLocaleString()} |
| Premium | $45,000 | $${(adc * 45000).toLocaleString()} |

**Adjusted for Quality & Market:**
- Base (Market): $${(adc * 35000).toLocaleString()}
- Quality Adjustment: ${qualityMultiplier >= 1.1 ? '+20%' : qualityMultiplier >= 1.0 ? '+0%' : '-15%'}
- CON Adjustment: ${provider.is_con_state ? '+15%' : '+0%'}
- **Indicated Value: $${Math.round(adc * 35000 * qualityMultiplier * conMultiplier).toLocaleString()}**
` : 'ADC data required for this analysis'}

**Method 2: Revenue Multiple**
${adc > 0 ? `
Estimated Annual Revenue: $${((adc * 365 * 185 * 0.85)).toLocaleString()}
| Multiple | Value |
|----------|-------|
| 0.8x | $${Math.round(adc * 365 * 185 * 0.85 * 0.8).toLocaleString()} |
| 1.0x | $${Math.round(adc * 365 * 185 * 0.85 * 1.0).toLocaleString()} |
| 1.2x | $${Math.round(adc * 365 * 185 * 0.85 * 1.2).toLocaleString()} |
` : 'Revenue data required for this analysis'}

**Method 3: EBITDA Multiple**
Assuming 15-18% EBITDA margin on revenue:
${adc > 0 ? `
- Estimated EBITDA: $${Math.round(adc * 365 * 185 * 0.85 * 0.16).toLocaleString()}
- At 4.0x: $${Math.round(adc * 365 * 185 * 0.85 * 0.16 * 4).toLocaleString()}
- At 5.0x: $${Math.round(adc * 365 * 185 * 0.85 * 0.16 * 5).toLocaleString()}
` : 'Financial data required'}

---

**VALUATION CONSIDERATIONS**

${classification === 'GREEN' ? `
✓ **Premium Candidate**
- Strong quality metrics support premium valuation
- Lower integration risk
- Immediate accretive potential
` : classification === 'YELLOW' ? `
◐ **Value-Add Opportunity**
- Quality improvement potential adds value
- Factor in improvement investment ($50-150K typically)
- Timeline: 6-12 months to see rating improvement
` : `
⚠️ **Discount Required**
- Quality concerns require remediation
- Factor in turnaround costs and timeline
- Higher execution risk
`}

**Negotiation Considerations:**
- ${provider.chain_organization ? 'Chain sale process likely more formal' : 'Independent owner may offer more flexibility (owner carry-back potential)'}
- ${provider.is_con_state ? 'CON certificate is key asset - verify transferability' : 'Non-CON market means easier competitor entry'}

Would you like a detailed term sheet framework for this acquisition?`;
  }

  // Improvement questions
  if (lowerQuery.includes('improve') || lowerQuery.includes('better') || lowerQuery.includes('action') ||
      lowerQuery.includes('strategy') || lowerQuery.includes('plan') || lowerQuery.includes('fix')) {

    // Find the weakest areas
    const metrics = [
      { name: 'HCI', score: provider.hci_score, target: 85 },
      { name: 'HVLDL', score: provider.hvldl_score, target: 90 },
      { name: 'Communication', score: provider.communication_score, target: 85 },
      { name: 'Overall Rating', score: provider.overall_rating_score, target: 85 },
      { name: 'Recommend', score: provider.willing_recommend_score, target: 85 },
    ].filter(m => m.score !== null).sort((a, b) => (a.score || 0) - (b.score || 0));

    const weakest = metrics[0];
    const second = metrics[1];

    return `**Improvement Action Plan: ${name}**

**Current Classification:** ${classification}
**Target:** ${classification === 'GREEN' ? 'Maintain excellence' : classification === 'YELLOW' ? 'Move to GREEN' : 'Rapid quality improvement'}

---

**PRIORITY IMPROVEMENT AREAS**

Based on ${name}'s current metrics, here are the prioritized improvement opportunities:

${weakest ? `
**#1 Priority: ${weakest.name}**
Current: ${weakest.score}% | Target: ${weakest.target}% | Gap: ${weakest.target - (weakest.score || 0)} points

${weakest.name === 'HCI' ? `
**Hospice Care Index Action Plan:**

1. **Timeliness of Care (30 days)**
   - Implement same-day admission visits
   - Create admission readiness checklists
   - Pre-schedule comprehensive assessments
   - Track time-to-first-visit metric daily

2. **Pain Assessment (30 days)**
   - Standardize pain assessment tool usage
   - Train all staff on pain scales
   - Implement PRN documentation reminders
   - Audit 100% of charts monthly

3. **Dyspnea Screening (30 days)**
   - Add dyspnea to admission checklist
   - Create standing orders for dyspnea management
   - Train on breathlessness assessment tools

4. **Comprehensive Assessment (60 days)**
   - Calendar comprehensive assessments
   - Supervisor review within 24 hours
   - Create assessment completion dashboards
   - Weekly compliance reports

5. **Documentation Excellence (Ongoing)**
   - EHR template optimization
   - Real-time documentation (at bedside)
   - Quality assurance review process
   - Peer chart audits monthly

**Expected Outcome:** 10-15 point improvement in 90 days
` : weakest.name === 'HVLDL' ? `
**Hospice Visits in Last Days of Life Action Plan:**

1. **Predictive Identification (Immediate)**
   - Train staff on death-imminent indicators
   - Daily census review for active phase patients
   - Create "imminent" flags in EHR
   - Twice-daily care coordinator huddles

2. **Coverage Protocol (30 days)**
   - 24/7 on-call RN availability
   - Weekend/holiday visit schedules
   - Per-diem pool for surge coverage
   - Backup staff call lists

3. **Visit Scheduling (30 days)**
   - Auto-schedule daily visits for imminent patients
   - Minimum 2 visits/day in last 3 days
   - MSW visit in final 72 hours
   - Chaplain engagement protocol

4. **Family Communication (30 days)**
   - Proactive "what to expect" conversations
   - Daily family updates protocol
   - After-hours family callback system

5. **Monitoring (Ongoing)**
   - Weekly HVLDL metric tracking
   - Post-death chart review
   - Staff feedback and coaching

**Expected Outcome:** 15-20 point improvement in 60 days
` : `
**${weakest.name} Improvement Plan:**

1. **Assessment (Week 1-2)**
   - Root cause analysis of current gaps
   - Staff surveys on barriers
   - Process mapping current workflows

2. **Quick Wins (Week 2-4)**
   - Training on communication best practices
   - Family engagement protocols
   - Feedback loop implementation

3. **Sustained Improvement (Month 2-3)**
   - Regular performance monitoring
   - Coaching and recognition programs
   - Process refinement based on data

**Expected Outcome:** 8-12 point improvement in 90 days
`}
` : 'No metrics available for prioritization'}

${second ? `
**#2 Priority: ${second.name}**
Current: ${second.score}% | Target: ${second.target}% | Gap: ${second.target - (second.score || 0)} points

This should be addressed after initial progress on Priority #1.
` : ''}

---

**IMPLEMENTATION TIMELINE**

| Phase | Timeline | Focus | Expected Impact |
|-------|----------|-------|-----------------|
| Stabilize | Weeks 1-4 | Quick wins, stop deterioration | Prevent further decline |
| Improve | Months 2-3 | Systematic improvements | 10-15 point gains |
| Sustain | Months 4-6 | Lock in gains, culture change | Rating improvement |
| Excel | Months 6-12 | Best-in-class operations | GREEN classification |

---

**INVESTMENT REQUIRED**

- **Training:** $5,000-15,000 (staff education)
- **Technology:** $10,000-25,000 (EHR optimization, dashboards)
- **Staffing:** $25,000-75,000/year (coverage improvements)
- **Consulting:** $15,000-40,000 (QI expertise)

**Total Year 1:** $55,000-155,000
**ROI:** 3-5x through improved referrals, reduced compliance risk

---

Would you like detailed protocols for any specific improvement area?`;
  }

  // Due diligence questions
  if (lowerQuery.includes('due diligence') || lowerQuery.includes('diligence') || lowerQuery.includes('investigate') ||
      lowerQuery.includes('research') || lowerQuery.includes('checklist')) {
    return `**Due Diligence Checklist: ${name}**

**Provider:** ${name}
**Location:** ${provider.city}, ${provider.state}
**CCN:** ${provider.ccn}

---

**1. QUALITY & CLINICAL (Critical)**

☐ **CMS Quality Measure History (3 years)**
  - Current HCI: ${provider.hci_score ?? 'Request'}%
  - Current HVLDL: ${provider.hvldl_score ?? 'Request'}%
  - Trend analysis: improving/stable/declining

☐ **CAHPS Survey Results (3 years)**
  - Overall Rating: ${provider.overall_rating_score ?? 'Request'}%
  - Recommend: ${provider.willing_recommend_score ?? 'Request'}%
  - Communication: ${provider.communication_score ?? 'Request'}%

☐ **Survey History**
  - Last state survey date
  - Deficiency count and severity
  - Plans of correction status
  - Any enforcement actions

☐ **Complaint Investigations**
  - Substantiated complaints (2 years)
  - Patterns or repeat issues
  - Resolution documentation

---

**2. OPERATIONAL**

☐ **Census Data**
  - Estimated ADC: ${provider.estimated_adc ?? 'Request'}
  - ADC trend (3 years)
  - Seasonality patterns
  - Payer mix breakdown

☐ **Staffing**
  - Current staffing levels by discipline
  - Turnover rates (RN, aide)
  - Vacancy rates
  - Contractor utilization

☐ **Service Area**
  - Counties/ZIP codes served
  - Drive time mapping
  - Competitor analysis
  - Referral source geography

---

**3. FINANCIAL**

☐ **Revenue Analysis**
  - 3 years financial statements
  - Revenue per patient day
  - Payer mix trends
  - Medicare cap liability history

☐ **Cost Structure**
  - Labor cost ratios
  - G&A as % of revenue
  - Technology/infrastructure costs
  - Marketing spend

☐ **Profitability**
  - EBITDA margins
  - Adjusted EBITDA (owner normalization)
  - Working capital needs
  - CapEx requirements

---

**4. COMPLIANCE & LEGAL**

☐ **Regulatory Status**
  - Medicare certification current
  - State license current
  ${provider.is_con_state ? '- CON certificate review and transferability' : ''}
  - Accreditation status (if applicable)

☐ **Legal Review**
  - Pending litigation
  - OIG exclusion list check (all employees)
  - Previous settlements or fines
  - Billing compliance review

☐ **Corporate Structure**
  - Entity formation documents
  - Operating agreements
  - Management contracts
  - Related party transactions

---

**5. HUMAN CAPITAL**

☐ **Key Personnel**
  - Administrator credentials
  - Medical Director qualifications
  - Clinical Director experience
  - Key staff retention risk

☐ **Employment Matters**
  - Employee count by classification
  - Wage/benefit analysis
  - Union status
  - Non-compete agreements

---

**6. STRATEGIC**

☐ **Market Position**
  - Market share estimate
  - Competitive differentiation
  - Referral relationships
  - Brand/reputation assessment

☐ **Growth Potential**
  - Expansion opportunities
  - New county/market potential
  - Service line additions
  - Synergy identification

---

**RED FLAGS TO WATCH FOR:**

${provider.overall_score !== null && provider.overall_score < 60 ? '⚠️ Low quality scores may indicate systemic issues\n' : ''}${provider.hci_score !== null && provider.hci_score < 65 ? '⚠️ HCI below 65% suggests clinical protocol gaps\n' : ''}${!provider.chain_organization ? '' : '⚠️ Chain affiliation may mean less deal flexibility\n'}• Declining ADC trend
• High staff turnover (>50% annual)
• Recent enforcement actions
• Pending litigation
• Medicare cap overpayment history
• Owner unwilling to provide data

---

Would you like me to elaborate on any section?`;
  }

  // Comparison/benchmark questions
  if (lowerQuery.includes('compare') || lowerQuery.includes('benchmark') || lowerQuery.includes('vs') ||
      lowerQuery.includes('how does') || lowerQuery.includes('stack up')) {
    return `**Benchmark Analysis: ${name}**

**Quality Score Benchmarking**

| Metric | ${name} | National Avg | Top 10% | Assessment |
|--------|---------|--------------|---------|------------|
| HCI | ${provider.hci_score ?? 'N/A'}% | 78% | 92%+ | ${provider.hci_score ? (provider.hci_score >= 92 ? 'Top 10%' : provider.hci_score >= 78 ? 'Above Avg' : 'Below Avg') : '—'} |
| HVLDL | ${provider.hvldl_score ?? 'N/A'}% | 82% | 95%+ | ${provider.hvldl_score ? (provider.hvldl_score >= 95 ? 'Top 10%' : provider.hvldl_score >= 82 ? 'Above Avg' : 'Below Avg') : '—'} |
| Communication | ${provider.communication_score ?? 'N/A'}% | 79% | 88%+ | ${provider.communication_score ? (provider.communication_score >= 88 ? 'Top 10%' : provider.communication_score >= 79 ? 'Above Avg' : 'Below Avg') : '—'} |
| Overall Rating | ${provider.overall_rating_score ?? 'N/A'}% | 80% | 90%+ | ${provider.overall_rating_score ? (provider.overall_rating_score >= 90 ? 'Top 10%' : provider.overall_rating_score >= 80 ? 'Above Avg' : 'Below Avg') : '—'} |
| Recommend | ${provider.willing_recommend_score ?? 'N/A'}% | 83% | 92%+ | ${provider.willing_recommend_score ? (provider.willing_recommend_score >= 92 ? 'Top 10%' : provider.willing_recommend_score >= 83 ? 'Above Avg' : 'Below Avg') : '—'} |

**Market Position: ${provider.state}**

- CON State: ${provider.is_con_state ? 'Yes (protected market)' : 'No (open market)'}
- Estimated ADC: ${provider.estimated_adc ?? 'Unknown'} ${provider.estimated_adc ? (provider.estimated_adc >= 75 ? '(Large)' : provider.estimated_adc >= 35 ? '(Mid-size)' : '(Small)') : ''}
- Classification: ${classification}

**Competitive Context:**
${provider.overall_score !== null ? `
With an overall score of ${provider.overall_score}, ${name} is positioned ${
  provider.overall_score >= 80 ? 'as a quality leader in the market' :
  provider.overall_score >= 65 ? 'competitively with opportunity for differentiation' :
  'below market leaders, requiring improvement to compete effectively'
}.
` : 'Quality data needed for competitive positioning.'}

**Strategic Implications:**
${classification === 'GREEN' ?
  '✓ Premium positioning supports strong valuation and easier integration' :
  classification === 'YELLOW' ?
  '◐ Middle-tier positioning requires improvement plan for competitive strength' :
  '⚠️ Below-market quality requires significant investment to compete'
}

Would you like a detailed competitive analysis for the ${provider.state} market?`;
  }

  return null;
}

// ============================================
// GENERAL KNOWLEDGE RESPONSE ENGINE
// ============================================

function generateGeneralResponse(input: string, pathname: string, provider: ProviderData | null): string {
  const lowerInput = input.toLowerCase();

  // If we have provider context and they ask a general question, contextualize it
  if (provider && (pathname.startsWith('/provider/') || lowerInput.includes('this'))) {
    const specificResponse = generateProviderSpecificAnalysis(provider, input);
    if (specificResponse) return specificResponse;
  }

  // ============================================
  // HEALTH INSPECTIONS DOMAIN
  // ============================================
  if (lowerInput.includes('health inspection') || lowerInput.includes('survey') ||
      lowerInput.includes('deficien') || lowerInput.includes('citation')) {
    const domain = FiveStarDataset.Domains.HealthInspections;

    if (lowerInput.includes('scor') || lowerInput.includes('point') || lowerInput.includes('how')) {
      return `**Health Inspection Deficiency Scoring**

Each citation receives points based on a **Scope × Severity** grid:

**Severity Levels:**
- **No Harm** (Potential for harm): Low points
- **Actual Harm**: Medium points
- **Immediate Jeopardy**: Highest points (100-150)

**Scope Levels:**
- **Isolated**: Single occurrence
- **Pattern**: Multiple occurrences
- **Widespread**: Systemic issue

**Point Examples:**
${domain.CalculationSteps[0].Examples?.slice(0, 6).map(e => `- Level **${e.Level}** (${e.Description}): **${e.Points} points**`).join('\n')}

**Important Multipliers:**
- ${domain.CalculationSteps[0].AbuseMultiplier}
- Repeat deficiencies add 50% extra points

${provider ? `\n**For ${provider.provider_name}:** Check survey history in due diligence.` : ''}`;
    }

    return `**Health Inspections Domain**

${domain.Description}

**Star Cut Points:**
${domain.StarCutPoints.map(s => `- **${s.Stars} Stars**: ${s.ScoreRange} points`).join('\n')}

**Key Facts:**
- Annual surveys + complaint investigations
- 3-year weighted average (60%/30%/10%)
- Abuse citations double the point value`;
  }

  // ============================================
  // STAFFING DOMAIN
  // ============================================
  if (lowerInput.includes('staff') || lowerInput.includes('hprd') || lowerInput.includes('nurse') ||
      lowerInput.includes('pbj') || lowerInput.includes('payroll')) {
    const domain = FiveStarDataset.Domains.Staffing;

    if (lowerInput.includes('weekend')) {
      return `**Weekend Staffing Requirements (2023+)**

Starting in 2023, CMS requires weekend RN coverage for 4+ star ratings.

**Requirement:** ${domain.Post2023Rules[0]}

**Strategy:**
1. Ensure at least 1 RN on duty every weekend day
2. Document weekend hours in PBJ accurately
3. Per-diem RN pools for coverage

**Impact:** Facilities with zero weekend RN hours capped at 3 stars.`;
    }

    if (lowerInput.includes('turnover')) {
      return `**Staff Turnover Metrics (2023+)**

**New Rule:** ${domain.Post2023Rules[1]}

**Turnover Thresholds:**
- >60% annual turnover = potential 1-star deduction
- Data from PBJ submissions

**Reduction Strategies:**
1. Competitive wages
2. Flexible scheduling
3. Recognition programs
4. Career advancement
5. Better ratios
6. Supportive management`;
    }

    return `**Staffing Domain**

**Metrics:**
${domain.Metrics.map(m => `- ${m}`).join('\n')}

**Formula:** \`${domain.Formula}\`

**Star Thresholds:**
${domain.StarThresholds.map(s => `- **${s.Stars} Stars**: RN ${s.RNPoints}pts, Total ${s.TotalPoints}pts`).join('\n')}

**2023 Changes:**
${domain.Post2023Rules.map(r => `⚠️ ${r}`).join('\n')}`;
  }

  // ============================================
  // QUALITY MEASURES
  // ============================================
  if (lowerInput.includes('quality measure') || lowerInput.includes('qm') ||
      lowerInput.includes('hci') || lowerInput.includes('hospice care index') ||
      lowerInput.includes('hvldl') || lowerInput.includes('cahps')) {
    return `**Hospice Quality Measures**

**Core Measures:**

1. **Hospice Care Index (HCI)** - Composite clinical quality
   - Timeliness of care
   - Pain assessment
   - Dyspnea screening
   - Bowel regimen
   - Comprehensive assessment
   - **Target:** ≥85% for excellence

2. **HVLDL** - Visits in Last Days of Life
   - RN/MSW visits in final 3 days
   - **Target:** ≥90% for excellence

3. **CAHPS Survey** - Family experience
   - Communication
   - Symptom management
   - Emotional support
   - Overall rating
   - Would recommend
   - **Target:** ≥85% across measures

${provider ? `\n**${provider.provider_name} Scores:**
- HCI: ${provider.hci_score ?? 'N/A'}%
- HVLDL: ${provider.hvldl_score ?? 'N/A'}%
- Communication: ${provider.communication_score ?? 'N/A'}%
- Overall: ${provider.overall_rating_score ?? 'N/A'}%` : ''}

Ask about specific measures for detailed improvement strategies!`;
  }

  // ============================================
  // M&A AND VALUATION
  // ============================================
  if (lowerInput.includes('value') || lowerInput.includes('valuation') || lowerInput.includes('m&a') ||
      lowerInput.includes('acquisition') || lowerInput.includes('buy') || lowerInput.includes('deal')) {
    return `**Hospice M&A Valuation**

**Valuation Methods:**

1. **Per-ADC Method**
   - Conservative: $25,000/ADC
   - Market: $35,000/ADC
   - Premium: $45,000/ADC

2. **Revenue Multiple**
   - 0.8-1.2x trailing revenue
   - Premium for 4+ star quality

3. **EBITDA Multiple**
   - 3.5-5.5x adjusted EBITDA
   - Higher for scale (ADC 75+)

**Value Drivers:**
✓ Quality scores (15-25% premium/discount range)
✓ CON state location (+15%)
✓ ADC growth trajectory
✓ Payer mix (Medicare %)
✓ Staffing stability
✓ Market position

${provider ? `\n**For ${provider.provider_name}:**
- ADC: ${provider.estimated_adc ?? 'Unknown'}
- Quality Score: ${provider.overall_score ?? 'Unknown'}
- CON Protected: ${provider.is_con_state ? 'Yes' : 'No'}
- Classification: ${provider.classification}` : ''}

Would you like a detailed valuation analysis?`;
  }

  // ============================================
  // IMPROVEMENT STRATEGIES
  // ============================================
  if (lowerInput.includes('improve') || lowerInput.includes('better') || lowerInput.includes('increase') ||
      lowerInput.includes('boost') || lowerInput.includes('raise')) {
    const strategies = FiveStarDataset.ImprovementStrategies.EffectivePaths;

    return `**Quality Improvement Strategies**

**Quick Wins (30 days):**
1. Documentation audit and training
2. Same-day admission visits
3. Daily active phase huddles
4. Family communication protocols
5. Pain assessment standardization

**Medium-Term (90 days):**
1. Comprehensive staff training
2. EHR workflow optimization
3. Quality dashboard implementation
4. Care coordinator oversight
5. Peer chart reviews

**Long-Term (6-12 months):**
1. Culture transformation
2. Best-practice adoption
3. Sustained monitoring
4. Continuous improvement

**ROI Expectations:**
- 10-15 point improvement in 90 days achievable
- Full program: $50-150K investment
- Return: 3-5x through better referrals, lower risk

${provider ? `\n**For ${provider.provider_name}:** I can create a specific improvement plan based on their metrics. Ask me to "create an improvement plan for this provider."` : ''}`;
  }

  // ============================================
  // DEFAULT RESPONSE
  // ============================================
  return `Hi! I'm **Phill**, your hospice M&A intelligence assistant.

${provider ? `**Currently viewing:** ${provider.provider_name} (${provider.city}, ${provider.state})
**Classification:** ${provider.classification}
**Overall Score:** ${provider.overall_score ?? 'N/A'}

I can provide specific analysis for this provider. Try:
- "Analyze this provider"
- "What's the valuation?"
- "Create an improvement plan"
- "Run due diligence"
- "Compare to benchmarks"

---

` : ''}**I can help with:**

📊 **Quality Analysis**
- Hospice Care Index (HCI)
- CAHPS survey measures
- Quality improvement strategies

💰 **M&A Intelligence**
- Valuation methodologies
- Due diligence guidance
- Market analysis

📈 **Improvement Planning**
- Specific action plans
- ROI analysis
- Timeline projections

**Try asking:**
- "How is HCI calculated?"
- "What are the staffing requirements?"
- "Explain hospice quality measures"
- "How do quality scores affect value?"`;
}

// ============================================
// QUICK ACTIONS
// ============================================

function getQuickActions(pathname: string, provider: ProviderData | null): QuickAction[] {
  // Provider-specific quick actions
  if (provider && pathname.startsWith('/provider/')) {
    return [
      { label: 'Full Analysis', prompt: 'Give me a comprehensive analysis of this provider', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Valuation', prompt: 'What is the estimated valuation for this hospice?', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Improve', prompt: 'Create an improvement action plan for this provider', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Due Diligence', prompt: 'Generate a due diligence checklist for this acquisition', icon: <FileText className="w-4 h-4" /> },
    ];
  }

  // Quality measures page
  if (pathname === '/quality-measures') {
    return [
      { label: 'HCI Explained', prompt: 'Explain the Hospice Care Index in detail', icon: <Activity className="w-4 h-4" /> },
      { label: 'CAHPS Guide', prompt: 'How do CAHPS surveys work?', icon: <Star className="w-4 h-4" /> },
      { label: 'Improve QM', prompt: 'How can I improve quality measure scores?', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Thresholds', prompt: 'What are the star rating thresholds?', icon: <Target className="w-4 h-4" /> },
    ];
  }

  // Deals/valuation pages
  if (pathname === '/deals' || pathname === '/valuation') {
    return [
      { label: 'Valuation Methods', prompt: 'Explain hospice valuation methodologies', icon: <Calculator className="w-4 h-4" /> },
      { label: 'Due Diligence', prompt: 'What should I look for in due diligence?', icon: <FileText className="w-4 h-4" /> },
      { label: 'Quality Impact', prompt: 'How do quality scores affect valuation?', icon: <Star className="w-4 h-4" /> },
      { label: 'Deal Structure', prompt: 'What deal structures work for hospice M&A?', icon: <DollarSign className="w-4 h-4" /> },
    ];
  }

  // Default actions
  return [
    { label: 'Quality Measures', prompt: 'Explain hospice quality measures', icon: <Activity className="w-4 h-4" /> },
    { label: 'Improve Ratings', prompt: 'How can I improve quality ratings?', icon: <TrendingUp className="w-4 h-4" /> },
    { label: 'Valuation', prompt: 'How are hospices valued for M&A?', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'M&A Strategy', prompt: 'What makes a good acquisition target?', icon: <Target className="w-4 h-4" /> },
  ];
}

// ============================================
// PHILL ASSISTANT COMPONENT
// ============================================

export function PhillAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const { provider } = usePhillContext();

  const quickActions = getQuickActions(pathname, provider);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Reset messages when provider changes
  useEffect(() => {
    if (provider) {
      setMessages([]);
    }
  }, [provider?.ccn]);

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking time
    await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 600));

    // Generate response with provider context
    let response: string;

    if (provider) {
      const specificResponse = generateProviderSpecificAnalysis(provider, text);
      response = specificResponse || generateGeneralResponse(text, pathname, provider);
    } else {
      response = generateGeneralResponse(text, pathname, null);
    }

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  }, [input, pathname, provider]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (pathname === '/landing') return null;

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center group"
          >
            <MessageSquare className="w-6 h-6" />
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full text-xs font-bold flex items-center justify-center border-2 border-white">
              P
            </span>
            {provider && (
              <span className="absolute -bottom-1 -left-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                <Building2 className="w-3 h-3 text-white" />
              </span>
            )}
            <div className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-sm font-medium">
                {provider ? `Ask about ${provider.provider_name}` : 'Ask Phill - M&A Expert'}
              </span>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[480px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]"
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
                    {provider ? `Analyzing ${provider.provider_name.substring(0, 25)}...` : 'M&A Intelligence Assistant'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Provider Context Banner */}
            {provider && !isMinimized && (
              <div className="px-4 py-2 bg-purple-500/10 border-b border-purple-500/20">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-purple-400">{provider.provider_name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    provider.classification === 'GREEN' ? 'bg-emerald-500/20 text-emerald-400' :
                    provider.classification === 'YELLOW' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {provider.classification}
                  </span>
                </div>
              </div>
            )}

            {/* Chat Body */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  {/* Messages */}
                  <div className="h-[420px] overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-turquoise-500)]/10 flex items-center justify-center">
                          <Brain className="w-8 h-8 text-[var(--color-turquoise-500)]" />
                        </div>
                        <h4 className="font-semibold mb-2">Hi, I'm Phill!</h4>
                        <p className="text-sm text-[var(--color-text-muted)] mb-1">
                          {provider
                            ? `I've loaded ${provider.provider_name}'s data. Ask me anything specific about this provider.`
                            : 'Your hospice M&A intelligence assistant.'
                          }
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mb-4">
                          {provider
                            ? 'I can analyze quality, estimate value, create improvement plans, and generate due diligence checklists.'
                            : 'I know quality measures, valuation, improvement strategies, and M&A best practices.'
                          }
                        </p>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {quickActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(action.prompt)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors border border-[var(--color-border)]"
                            >
                              {action.icon}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {messages.map((msg) => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[90%] p-3 rounded-2xl ${
                                msg.role === 'user'
                                  ? 'bg-[var(--color-turquoise-500)] text-white rounded-tr-sm'
                                  : 'bg-[var(--color-bg-secondary)] rounded-tl-sm'
                              }`}
                            >
                              <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                {msg.content.split(/(\*\*.*?\*\*|\`.*?\`|\|.*\|)/g).map((part, i) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                                  }
                                  if (part.startsWith('`') && part.endsWith('`')) {
                                    return <code key={i} className="px-1 py-0.5 rounded bg-black/20 text-xs font-mono">{part.slice(1, -1)}</code>;
                                  }
                                  if (part.startsWith('|') && part.endsWith('|')) {
                                    return <span key={i} className="font-mono text-xs">{part}</span>;
                                  }
                                  return part;
                                })}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-[var(--color-bg-secondary)] p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-[var(--color-turquoise-500)]" />
                              <span className="text-xs text-[var(--color-text-muted)]">Analyzing...</span>
                            </div>
                          </div>
                        )}

                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t border-[var(--color-border)]">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={provider ? `Ask about ${provider.provider_name}...` : 'Ask about quality, value, M&A...'}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:ring-1 focus:ring-[var(--color-turquoise-500)] transition-colors text-sm"
                      />
                      <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isTyping}
                        className="p-2.5 rounded-xl bg-[var(--color-turquoise-500)] text-white hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quick Actions when chat has messages */}
                    {messages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {quickActions.slice(0, 3).map((action, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(action.prompt)}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                          >
                            {action.icon}
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
