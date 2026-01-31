'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, ChevronDown,
  Activity, Star, Target, HelpCircle, Lightbulb,
  TrendingUp, AlertTriangle, CheckCircle, Loader2,
  BookOpen, Calculator, Shield, Users, FileText,
  DollarSign, Building2, BarChart3, Heart, Brain,
  Zap, Clock, Award, Percent, ArrowRight
} from 'lucide-react';
import FiveStarDataset, {
  queryKnowledge,
  getActionPlan,
  getImprovementRecommendations,
  searchKnowledge
} from '@/lib/knowledge';

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
// COMPREHENSIVE KNOWLEDGE RESPONSE ENGINE
// ============================================

function generateResponse(input: string, pathname: string): string {
  const lowerInput = input.toLowerCase();
  const words = lowerInput.split(/\s+/);

  // ============================================
  // HEALTH INSPECTIONS DOMAIN
  // ============================================
  if (lowerInput.includes('health inspection') || lowerInput.includes('survey') ||
      lowerInput.includes('deficien') || lowerInput.includes('citation') ||
      lowerInput.includes('casper') || lowerInput.includes('complaint')) {
    const domain = FiveStarDataset.Domains.HealthInspections;

    // Deficiency scoring details
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
- Substantiated complaints count at full weight

**Cycle Weighting Formula:**
\`Total = (Cycle1 × 0.6) + (Cycle2 × 0.3) + (Cycle3 × 0.1)\`

Would you like strategies to reduce deficiency points?`;
    }

    return `**Health Inspections Domain** (Foundation of Overall Rating)

**Data Source:** ${domain.DataSource}

${domain.Description}

**Star Cut Points (Current):**
${domain.StarCutPoints.map(s => `- **${s.Stars} Stars**: ${s.ScoreRange} points - ${s.Description}`).join('\n')}

**Calculation Process:**
${domain.CalculationSteps.map((step, i) => `${i + 1}. **${step.Name}**: ${step.Details}`).join('\n')}

**Key Facts:**
- Annual surveys + complaint investigations + infection control surveys
- 3-year weighted average (60%/30%/10%)
- Abuse citations double the point value
- Top 10% = 5 stars, Bottom 10% = 1 star

**Quick Win:** Mock surveys identify citation-prone areas before state visits.

Ask about specific deficiency types or reduction strategies!`;
  }

  // ============================================
  // STAFFING DOMAIN - COMPREHENSIVE
  // ============================================
  if (lowerInput.includes('staff') || lowerInput.includes('hprd') || lowerInput.includes('nurse') ||
      lowerInput.includes('rn hour') || lowerInput.includes('pbj') || lowerInput.includes('payroll')) {
    const domain = FiveStarDataset.Domains.Staffing;

    // Weekend staffing specific
    if (lowerInput.includes('weekend')) {
      return `**Weekend Staffing Requirements (2023+)**

Starting in 2023, CMS added weekend staffing to the rating:

**New Rule:**
${domain.Post2023Rules[0]}

**Why This Matters:**
- Many facilities reduced weekend RN coverage
- CMS found correlation with worse outcomes
- Now required for 4+ star ratings

**Strategy:**
1. Ensure at least 1 RN on duty every weekend day
2. Document weekend hours in PBJ accurately
3. Consider per-diem RN pools for coverage

**Impact:** Facilities with zero weekend RN hours are capped at 3 stars overall.`;
    }

    // Turnover specific
    if (lowerInput.includes('turnover')) {
      return `**Staff Turnover Metrics (Added 2023)**

CMS now tracks and penalizes high turnover:

**New Rule:**
${domain.Post2023Rules[1]}

**Turnover Calculation:**
- Annual RN turnover rate
- Annual total nurse turnover rate
- Aide turnover rate

**Impact:**
- >60% annual turnover = potential 1-star deduction
- Data comes from PBJ submissions
- Retention now directly affects ratings

**Strategies to Reduce Turnover:**
1. Competitive wages (market analysis)
2. Flexible scheduling
3. Recognition programs
4. Career advancement paths
5. Better nurse-to-patient ratios
6. Supportive management culture

**ROI:** Every percentage point reduction in turnover saves ~$4,000-$5,000 per nurse per year.`;
    }

    return `**Staffing Domain** (Critical for Star Rating)

**Data Source:** ${domain.DataSource}

**Key Metrics Tracked:**
${domain.Metrics.map(m => `- ${m}`).join('\n')}

**HPRD Calculation:**
\`${domain.Formula}\`

**Case-Mix Adjustment:** ${domain.CaseMixAdjustment}

**Star Thresholds:**
${domain.StarThresholds.map(s => `- **${s.Stars} Stars**: RN Points ${s.RNPoints}, Total Points ${s.TotalPoints}`).join('\n')}

**2023 Rule Changes (Important!):**
${domain.Post2023Rules.map(r => `⚠️ ${r}`).join('\n')}

**Practical Targets:**
- RN: 0.75+ HPRD for 5 stars
- Total: 4.10+ HPRD for 5 stars
- Weekend RN coverage: Required for 4+ stars
- Turnover: Keep below 60% annual

**Quick Win:** PBJ audit to ensure all hours are captured correctly (many facilities under-report).`;
  }

  // ============================================
  // QUALITY MEASURES - INDIVIDUAL MEASURES
  // ============================================

  // Falls (Long-Stay and Short-Stay)
  if (lowerInput.includes('fall')) {
    const longStayMeasure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Falls'));
    const shortStayMeasure = FiveStarDataset.Domains.QualityMeasures.ShortStayMeasuresList.find(m => m.Name.includes('Falls'));
    const actions = getActionPlan('falls');

    return `**Falls with Major Injury** - THE HIGHEST IMPACT MEASURE

This is the **most heavily weighted** quality measure. Improving falls can have the biggest impact on your QM star rating.

**Long-Stay Measure:**
- **Weight:** ${longStayMeasure?.Weight} (HIGHEST)
- **National Average:** ${longStayMeasure?.NationalAverage}
- **5 Stars:** ${longStayMeasure?.Thresholds.FiveStar}
- **4 Stars:** ${longStayMeasure?.Thresholds.FourStar}
- **3 Stars:** ${longStayMeasure?.Thresholds.ThreeStar}
- **2 Stars:** ${longStayMeasure?.Thresholds.TwoStar}
- **1 Star:** ${longStayMeasure?.Thresholds.OneStar}

**Short-Stay Measure:**
- **Weight:** ${shortStayMeasure?.Weight}
- **National Average:** ${shortStayMeasure?.NationalAverage}
- **5 Stars:** ${shortStayMeasure?.Thresholds.FiveStar}

**Action Plan:**
${actions.map(a => a).join('\n')}

**Quick Wins (Free/Low-Cost):**
✓ Hourly rounding protocols
✓ Medication reviews (sedatives, blood pressure meds)
✓ Non-slip footwear requirements
✓ Low beds for high-risk residents
✓ Bed/chair alarms
✓ Clear pathways (remove clutter)

**ROI:** Reducing falls by 1% can improve QM rating by 0.3-0.5 stars.`;
  }

  // Pressure Ulcers
  if (lowerInput.includes('pressure') || lowerInput.includes('ulcer') || lowerInput.includes('wound') ||
      lowerInput.includes('skin') || lowerInput.includes('bedsore')) {
    const longStayMeasure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Pressure'));
    const shortStayMeasure = FiveStarDataset.Domains.QualityMeasures.ShortStayMeasuresList.find(m => m.Name.includes('Pressure'));
    const actions = getActionPlan('pressure');

    return `**Pressure Ulcers** - HIGH IMPACT MEASURE

**Long-Stay (High Risk Residents):**
- **Weight:** ${longStayMeasure?.Weight}
- **National Average:** ${longStayMeasure?.NationalAverage}
- **Formula:** ${longStayMeasure?.Formula}
- **5 Stars:** ${longStayMeasure?.Thresholds.FiveStar}
- **4 Stars:** ${longStayMeasure?.Thresholds.FourStar}
- **3 Stars:** ${longStayMeasure?.Thresholds.ThreeStar}
- **1 Star:** ${longStayMeasure?.Thresholds.OneStar}

**Short-Stay (New or Worsened):**
- **Weight:** ${shortStayMeasure?.Weight}
- **National Average:** ${shortStayMeasure?.NationalAverage}
- **5 Stars:** ${shortStayMeasure?.Thresholds.FiveStar}
- Risk-adjusted: Yes

**Action Plan:**
${actions.map(a => a).join('\n')}

**Prevention Protocol:**
1. **Repositioning** - Every 2 hours (document it!)
2. **Surfaces** - Pressure-redistributing mattresses
3. **Nutrition** - Protein, vitamin C, zinc optimization
4. **Moisture** - Manage incontinence promptly
5. **Assessment** - Daily skin checks, Braden Scale
6. **Documentation** - Photo at admission (establishes baseline)

**Key Insight:** Many pressure ulcers are "acquired" at admission but not documented. Photo documentation protects your rates.`;
  }

  // UTI
  if (lowerInput.includes('uti') || lowerInput.includes('urinary tract') ||
      (lowerInput.includes('urinary') && lowerInput.includes('infection'))) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('UTI'));
    const actions = getActionPlan('uti');

    return `**Urinary Tract Infections (UTI)** - HIGH IMPACT MEASURE

- **Weight:** ${measure?.Weight}
- **Impact:** HIGH
- **National Average:** ${measure?.NationalAverage}
- **Formula:** ${measure?.Formula}

**Star Thresholds:**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Action Plan:**
${actions.map(a => a).join('\n')}

**Prevention Strategies:**
1. **Minimize catheter use** - Single biggest impact
2. **Remove catheters ASAP** - Daily assessment for removal
3. **Catheter care protocols** - Proper insertion and maintenance
4. **Hydration tracking** - Adequate fluids prevent UTIs
5. **Perineal care** - Proper hygiene protocols

**Key Insight:** Catheter-associated UTIs (CAUTIs) are the most common. Reducing catheter days is the fastest path to improvement.`;
  }

  // Catheter (separate from UTI)
  if (lowerInput.includes('catheter') && !lowerInput.includes('infection') && !lowerInput.includes('uti')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Catheter'));
    const actions = getActionPlan('catheter');

    return `**Catheter Use** - MEDIUM IMPACT MEASURE

- **Weight:** ${measure?.Weight}
- **National Average:** ${measure?.NationalAverage}
- **Formula:** ${measure?.Formula}

**Star Thresholds:**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Action Plan:**
${actions.map(a => a).join('\n')}

**Removal Protocol:**
1. Daily catheter necessity review
2. Nurse-driven removal protocol
3. Bladder training programs
4. Intermittent catheterization option
5. Condom catheters for appropriate patients

**Quick Win:** Many catheters remain in place due to inertia, not medical necessity. Implement daily "catheter necessity" rounds.`;
  }

  // Antipsychotics
  if (lowerInput.includes('antipsychotic') || lowerInput.includes('psych') ||
      lowerInput.includes('behavior') || lowerInput.includes('dementia')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Antipsychotic'));
    const actions = getActionPlan('antipsychotic');

    return `**Antipsychotic Medication Use** - MEDIUM IMPACT MEASURE

- **Weight:** ${measure?.Weight}
- **National Average:** ${measure?.NationalAverage}
- **Formula:** ${measure?.Formula}

**Star Thresholds:**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Note:** ${measure?.Notes}

**Action Plan:**
${actions.map(a => a).join('\n')}

**Non-Pharmacological Alternatives:**
✓ Person-centered dementia care
✓ Environmental modifications (calm spaces)
✓ Activity programming (music, art therapy)
✓ Pain management (behaviors often indicate pain)
✓ Sleep hygiene improvements
✓ Staff training on redirection techniques

**Gradual Dose Reduction (GDR):**
- Required by CMS for ongoing antipsychotic use
- Try reduction every 6 months unless contraindicated
- Document medical necessity if continued`;
  }

  // Restraints
  if (lowerInput.includes('restraint')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Restraint'));
    const actions = getActionPlan('restraint');

    return `**Physical Restraints** - MEDIUM IMPACT MEASURE

- **Weight:** ${measure?.Weight}
- **National Average:** ${measure?.NationalAverage}
- **Formula:** ${measure?.Formula}

**Star Thresholds:**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Action Plan:**
${actions.map(a => a).join('\n')}

**Restraint-Free Alternatives:**
✓ Low beds with floor mats
✓ Motion sensors and alarms
✓ Increased supervision/rounding
✓ 1:1 observation when needed
✓ Environmental modifications
✓ Address root causes (pain, delirium)

**Key Insight:** Most restraint use can be eliminated with proper alternatives. CMS targets restraint-free care.`;
  }

  // Depression
  if (lowerInput.includes('depress') || lowerInput.includes('mood') || lowerInput.includes('mental health')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Depress'));

    return `**Depressive Symptoms** - MEDIUM IMPACT MEASURE

- **Weight:** ${measure?.Weight}
- **National Average:** ${measure?.NationalAverage}
- **Formula:** ${measure?.Formula}

**Star Thresholds:**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Detection:**
- PHQ-9 screening on admission
- Quarterly rescreening
- Staff trained to recognize signs

**Treatment Strategies:**
✓ Meaningful activity programs
✓ Social engagement opportunities
✓ Natural light exposure
✓ Exercise programs
✓ Psychiatric consultation
✓ Medication review (some meds cause depression)
✓ Family involvement

**Key Insight:** Depression is under-recognized in SNFs. Better screening often reveals higher rates initially, but enables treatment.`;
  }

  // ADL Decline
  if (lowerInput.includes('adl') || lowerInput.includes('function') || lowerInput.includes('self-care') ||
      lowerInput.includes('decline') || lowerInput.includes('mobility')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('ADL'));

    return `**ADL Decline (Self-Care)** - MEDIUM IMPACT MEASURE

- **Weight:** ${measure?.Weight}
- **National Average:** ${measure?.NationalAverage}
- **Formula:** ${measure?.Formula}

**Star Thresholds:**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Prevention Strategies:**
✓ Restorative nursing programs
✓ Physical therapy referrals
✓ Occupational therapy for ADLs
✓ Avoid "doing for" residents
✓ Adaptive equipment provision
✓ Ambulation programs

**Key Insight:** Maintaining function requires active effort. Without intervention, decline is the default trajectory.`;
  }

  // Rehospitalization
  if (lowerInput.includes('rehospital') || lowerInput.includes('readmission') ||
      lowerInput.includes('hospital') || lowerInput.includes('transfer')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.ShortStayMeasuresList.find(m => m.Name.includes('Rehospital'));

    return `**Rehospitalizations** - SHORT-STAY MEASURE (HIGH IMPACT)

- **Weight:** ${measure?.Weight}
- **National Average:** ${measure?.NationalAverage}
- **Formula:** ${measure?.Formula}
- **Risk Adjusted:** Yes

**Star Thresholds:**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Reduction Strategies:**
1. **INTERACT Program** - Interventions to Reduce Acute Care Transfers
2. Thorough admission assessments
3. Medication reconciliation
4. Early warning sign recognition
5. On-site physician/NP coverage
6. Family education on expectations

**Key Programs:**
- INTERACT: evidence-based toolkit to reduce transfers
- Hospital partnerships for warm handoffs
- Telehealth for after-hours consultations

**ROI:** Each avoided hospitalization saves $15,000-$25,000 and improves your measure.`;
  }

  // Functional Improvement (Short-Stay)
  if (lowerInput.includes('improvement') && (lowerInput.includes('function') || lowerInput.includes('rehab'))) {
    const measure = FiveStarDataset.Domains.QualityMeasures.ShortStayMeasuresList.find(m => m.Name.includes('Functional'));

    return `**Functional Improvement** - SHORT-STAY MEASURE (HIGHER IS BETTER)

- **Weight:** ${measure?.Weight}
- **Impact:** HIGH
- **National Average:** ${measure?.NationalAverage}
- **Risk Adjusted:** Yes

**Star Thresholds (Higher is Better!):**
- **5 Stars:** ${measure?.Thresholds.FiveStar}
- **4 Stars:** ${measure?.Thresholds.FourStar}
- **3 Stars:** ${measure?.Thresholds.ThreeStar}
- **2 Stars:** ${measure?.Thresholds.TwoStar}
- **1 Star:** ${measure?.Thresholds.OneStar}

**Improvement Strategies:**
✓ Intensive therapy programs
✓ Individualized rehab goals
✓ Motivational interviewing
✓ Family involvement in therapy
✓ Restorative nursing carry-over
✓ Proper equipment provision

**Key Insight:** This is one of the few "higher is better" measures. Strong therapy programs directly improve this metric.`;
  }

  // ============================================
  // QUALITY MEASURES OVERVIEW
  // ============================================
  if (lowerInput.includes('quality measure') || lowerInput.includes('qm') ||
      (lowerInput.includes('measure') && lowerInput.includes('list')) ||
      lowerInput.includes('28 measure') || lowerInput.includes('all measure')) {
    const qm = FiveStarDataset.Domains.QualityMeasures;

    return `**CMS Quality Measures Overview**

There are **${qm.TotalMeasures} measures** total:
- **${qm.LongStayMeasures} Long-Stay** (residents >100 days)
- **${qm.ShortStayMeasures} Short-Stay** (post-acute/rehab)

**Data Source:** ${qm.DataSource}
**Risk Adjustment:** ${qm.RiskAdjustment}
**Max Points:** ${qm.TotalPointsMax}

**Long-Stay Measures by Impact:**
${qm.LongStayMeasuresList.map(m => `- **${m.Name}** - Weight: ${m.Weight} (${m.Impact})`).join('\n')}

**Short-Stay Measures by Impact:**
${qm.ShortStayMeasuresList.map(m => `- **${m.Name}** - Weight: ${m.Weight} (${m.Impact})`).join('\n')}

**QM Star Cut Points:**
${qm.StarCutPoints.map(s => `- **${s.Stars} Stars**: ${s.ScoreRange} points`).join('\n')}

**Topped-Out Measures (Not Scored):**
${qm.ToppedOutMeasures.map(m => `- ${m}`).join('\n')}

**Focus Areas for Maximum Impact:**
1. Falls with Major Injury (weight 3.0)
2. Pressure Ulcers (weight 2.5)
3. UTIs (weight 2.0)
4. Rehospitalizations (weight 1.5)

Ask about any specific measure for detailed thresholds and action plans!`;
  }

  // ============================================
  // OVERALL RATING CALCULATION
  // ============================================
  if (lowerInput.includes('overall') || lowerInput.includes('calculate') ||
      (lowerInput.includes('how') && lowerInput.includes('star') && lowerInput.includes('rating')) ||
      lowerInput.includes('combined') || lowerInput.includes('total rating')) {
    const overall = FiveStarDataset.Domains.Overall;

    return `**Overall Star Rating Calculation**

The overall rating combines all three domains:

**${overall.Integration}**

**Calculation Steps:**
${overall.CalculationMethod.map((s, i) => `${i + 1}. ${s}`).join('\n')}

**Point Conversion to Stars:**
${overall.PointConversion.map(p => `- **${p.TotalPoints} points** → ${p.OverallStars} stars`).join('\n')}

**Important Caps & Limits:**
${overall.Caps.map(c => `⚠️ ${c}`).join('\n')}

**Key Insights:**
1. Health Inspections is the BASE - you can only improve from there
2. Poor staffing OR poor QM can cap your rating
3. Special Focus Facilities are limited to 1 star
4. Weekend RN coverage required for 4+ stars (2023+)

**Strategic Implication:**
If your Health Inspection rating is low, that's your ceiling. Fix citations first, then optimize Staffing and QM.`;
  }

  // ============================================
  // IMPROVEMENT STRATEGIES
  // ============================================
  if (lowerInput.includes('improve') && (lowerInput.includes('star') || lowerInput.includes('rating'))) {
    const strategies = FiveStarDataset.ImprovementStrategies.EffectivePaths;

    return `**Star Rating Improvement Strategies**

${strategies.slice(0, 3).map(s => `**${s.FromTo} Stars** (${s.Timeline}):
${s.Focus}

Key Actions:
${s.KeyActions.slice(0, 4).map((a, i) => `${i + 1}. ${a}`).join('\n')}`).join('\n\n')}

**Universal Quick Wins:**
1. **MDS Coding Audit** - Errors can drop scores 10-20%
2. **Fall Prevention** - Highest-weight QM
3. **Catheter Reduction** - Easy wins available
4. **Mock Surveys** - Find citations before state does

**Evidence:**
- 1-star improvement → $50K+ annual revenue (better referrals)
- 5-star facilities have 5-10% higher occupancy

What's your current star rating? I can give specific recommendations.`;
  }

  // Cost-effective strategies
  if (lowerInput.includes('cost') || lowerInput.includes('budget') || lowerInput.includes('cheap') ||
      lowerInput.includes('afford') || lowerInput.includes('free') || lowerInput.includes('low cost')) {
    const tactics = FiveStarDataset.ImprovementStrategies.CostEffectiveTactics;

    return `**Cost-Effective Improvement Strategies**

**Low-Cost (Under $10K/year):**
${tactics[0].Examples.map(e => `✓ ${e}`).join('\n')}
**ROI:** ${tactics[0].ROI}

**Medium-Cost ($10K-$50K/year):**
${tactics[1].Examples.map(e => `✓ ${e}`).join('\n')}

**Free Resources:**
- CMS webinars and YouTube tutorials
- QIO technical assistance (free consulting!)
- AHCA Quality Initiative materials
- State association resources

**Pitfalls to Avoid:**
${FiveStarDataset.ImprovementStrategies.AvoidPitfalls.map(p => `✗ ${p}`).join('\n')}

**Best ROI Investments:**
1. MDS coding training (immediate impact)
2. Fall prevention program (highest-weight QM)
3. Wound care protocols
4. Catheter reduction initiative

**Fact:** Staffing investments return 2-3x via lower penalties and reduced turnover costs.`;
  }

  // ============================================
  // M&A AND VALUATION CONTEXT
  // ============================================
  if (lowerInput.includes('value') || lowerInput.includes('valuation') || lowerInput.includes('acquisition') ||
      lowerInput.includes('m&a') || lowerInput.includes('buy') || lowerInput.includes('sell') ||
      lowerInput.includes('deal') || lowerInput.includes('invest')) {
    return `**Star Ratings & Facility Valuation**

Star ratings directly impact facility value through multiple channels:

**Occupancy Impact:**
- 5-star: Premium occupancy, waitlists common
- 3-star: Market-rate occupancy
- 1-2 star: Occupancy challenges, discounting needed
- **Spread:** 5-10% occupancy difference between 1★ and 5★

**Revenue Impact:**
- Higher occupancy = more revenue
- Better payer mix (Medicare/private pay vs. Medicaid)
- SNF VBP payments (up to 2% Medicare adjustment)
- Premium rates possible with quality reputation

**Valuation Multiples:**
- 5-star facilities: Premium multiples (1.2-1.5x typical)
- 1-2 star facilities: Discounted multiples (0.6-0.8x)
- Turnaround potential: Buy low-star, improve, exit at premium

**Due Diligence Focus Areas:**
1. Current star ratings (overall and component)
2. Trajectory (improving or declining?)
3. Specific deficiency types
4. Staffing stability
5. QM trends over 4 quarters

**M&A Strategy:**
- **Value-Add Play:** Acquire 2-3 star facility, implement improvements, exit at 4-5 stars
- **Timeline:** 12-24 months for meaningful improvement
- **Risk:** Regulatory issues can cap upside

Want details on specific valuation factors?`;
  }

  // ============================================
  // COMPLIANCE AND REGULATORY
  // ============================================
  if (lowerInput.includes('compliance') || lowerInput.includes('regulat') || lowerInput.includes('cms') ||
      lowerInput.includes('sff') || lowerInput.includes('special focus')) {
    return `**Compliance & Regulatory Information**

**Special Focus Facility (SFF) Program:**
- Facilities with poor inspection history
- Subject to increased survey frequency
- Limited to 1-star overall rating
- Candidacy status also public

**Key Regulatory Requirements:**
1. Annual standard surveys
2. Complaint investigations (any time)
3. PBJ quarterly submissions
4. MDS timely submission
5. QAPI program

**Compliance Best Practices:**
✓ Mock surveys quarterly
✓ Self-reported incident analysis
✓ QAPI committee active
✓ Staff competency training
✓ Policy and procedure updates

**CMS Enforcement Actions:**
- Civil Money Penalties (CMPs)
- Denial of Payment for New Admissions (DPNA)
- Termination from Medicare/Medicaid
- State monitoring

**Resources:**
- CMS State Operations Manual
- F-Tag Interpretive Guidelines
- QIO consultation (free)

**Key Insight:** Proactive compliance is far cheaper than reactive penalties.`;
  }

  // ============================================
  // RESOURCES AND REFERENCES
  // ============================================
  if (lowerInput.includes('resource') || lowerInput.includes('guide') || lowerInput.includes('document') ||
      lowerInput.includes('reference') || lowerInput.includes('where can i') || lowerInput.includes('link')) {
    const resources = FiveStarDataset.Resources;

    return `**CMS Five-Star Resources & References**

**Official CMS Documents:**
${resources.OfficialCMS.slice(0, 4).map(r => `- [${r.Title}](${r.URL})`).join('\n')}

**Guides and Tools:**
${resources.GuidesAndTools.slice(0, 3).map(r => `- [${r.Title}](${r.URL})`).join('\n')}

**Research & Studies:**
${resources.ResearchAndStudies.map(r => `- [${r.Title}](${r.URL})`).join('\n')}

**Training:**
${resources.TrainingAndWebinars.map(r => `- [${r.Title}](${r.URL})`).join('\n')}

**Free Assistance:**
- Quality Improvement Organizations (QIOs) - Free consulting
- State health department resources
- AHCA/NCAL quality resources

Visit our **/learn** page for a comprehensive knowledge base!`;
  }

  // What-if simulator help
  if (lowerInput.includes('what-if') || lowerInput.includes('simulator') || lowerInput.includes('simulate') ||
      lowerInput.includes('project') || lowerInput.includes('forecast')) {
    return `**What-If Simulator**

Our simulator lets you model star rating improvements:

**How to Use:**
1. Go to **Quality Measures** page (/quality-measures)
2. Select **"What-If Simulator"** tab
3. Adjust sliders for each QM
4. Watch projected rating update in real-time

**Strategy Tips:**
1. **Focus on high-weight measures first:**
   - Falls with Major Injury (3.0 weight)
   - Pressure Ulcers (2.5 weight)
   - UTIs (2.0 weight)

2. **Model realistic improvements:**
   - 10-20% improvement in 6 months is realistic
   - 50% improvement takes 12-18 months

3. **Consider diminishing returns:**
   - Moving from 3% to 2% is easier than 1% to 0.5%

4. **Factor in seasonal variation:**
   - Some measures have seasonal patterns

**Use Case:** Before investing in a program, model the expected QM impact to justify ROI.`;
  }

  // ============================================
  // SPECIFIC STAR LEVEL RECOMMENDATIONS
  // ============================================
  const starMatch = lowerInput.match(/(\d)\s*star/);
  if (starMatch || lowerInput.includes('current rating') || lowerInput.includes('my rating') ||
      lowerInput.includes('our rating') || lowerInput.includes('specific')) {
    const starLevel = starMatch ? parseInt(starMatch[1]) : 3;
    const recs = getImprovementRecommendations(starLevel);

    return `**Recommendations for ${recs.fromTo} Improvement**

**Timeline:** ${recs.timeline}

**Priority Actions:**
${recs.priorityActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

**Key Focus Areas:**
${recs.focus.slice(0, 6).map(f => `✓ ${f}`).join('\n')}

**Expected ROI:** ${recs.expectedROI}

**Monitoring:**
- Track QM trends monthly
- Review staffing reports weekly
- Mock surveys quarterly

What specific area would you like to focus on first?`;
  }

  // ============================================
  // CONTEXT-AWARE RESPONSES
  // ============================================

  // Quality Measures page
  if (pathname === '/quality-measures') {
    return `I see you're on the **Quality Measures** page!

**This page lets you:**
1. **Overview Tab** - See priority improvement areas ranked by impact
2. **Long-Stay/Short-Stay Tabs** - Drill into each measure with thresholds
3. **What-If Simulator** - Model improvements and see projected star changes
4. **Action Plan** - Get specific, actionable recommendations
5. **CMS Methodology** - Learn exactly how ratings are calculated

**Quick Tips:**
- Focus on **highest-weight measures** first (Falls, Pressure Ulcers)
- Use the **simulator** to see projected star changes before investing
- Each measure has **5+ concrete action steps**
- The **threshold table** shows exactly what you need to hit

What specific measure or area would you like help with?`;
  }

  // Learn page
  if (pathname === '/learn') {
    return `Welcome to the **CMS Five-Star Knowledge Base**!

**What You'll Find Here:**
- **Overview** - System fundamentals and history
- **Health Inspections** - Deficiency scoring, cut points
- **Staffing** - HPRD requirements, 2023 rules
- **Quality Measures** - All 28 measures with thresholds
- **Overall Rating** - How it all combines
- **Improvement Strategies** - Evidence-based paths
- **Resources** - Links to official CMS documents

**Pro Tip:** Use the tabs to explore each domain in depth. Each section has:
- Exact thresholds and cut points
- Action plans for improvement
- Key formulas and calculations

Ask me specific questions anytime!`;
  }

  // Provider detail page
  if (pathname.startsWith('/provider/')) {
    return `Looking at a **specific provider**? I can help you understand:

**Quality Analysis:**
- What's driving their current star rating
- Which QMs are strengths vs. weaknesses
- How they compare to state/national benchmarks

**Improvement Opportunities:**
- Specific measures to target
- Expected impact of improvements
- Cost-benefit analysis

**M&A Considerations:**
- Valuation impact of star ratings
- Turnaround potential
- Regulatory risk factors

**What would you like to explore?**
- "Show me their QM breakdown"
- "What could improve their rating?"
- "How does this affect valuation?"`;
  }

  // Deals page
  if (pathname === '/deals') {
    return `Managing your **deal pipeline**? Star ratings are critical for:

**Due Diligence:**
- Overall rating trend (improving/declining)
- Component ratings (HI, Staffing, QM)
- Specific deficiency patterns
- Pending survey results

**Valuation Adjustments:**
- 5-star: Premium multiple
- 3-star: Market rate
- 1-2 star: Discount for turnaround work

**Integration Planning:**
- Timeline to improve ratings post-acquisition
- Investment needed for improvements
- Key staffing/operational changes

**Ask me about:**
- "How do stars affect valuation multiples?"
- "What's the turnaround timeline for a 2-star?"
- "What due diligence should I request?"`;
  }

  // Map page
  if (pathname === '/map') {
    return `Exploring the **geographic view**? Here's what to look for:

**Market Dynamics:**
- Star rating distribution by market
- Consolidation opportunities
- Competitive positioning

**Opportunity Identification:**
- Low-star facilities in strong markets
- Clustering of similar-rated facilities
- Rural vs. urban rating patterns

**M&A Insights:**
- Markets with improvement potential
- Competition from high-rated players
- Regulatory environment by state

**Tip:** CON (Certificate of Need) states often have different dynamics than non-CON states.`;
  }

  // Insights page
  if (pathname === '/insights') {
    return `Viewing **market insights**? Star ratings provide context:

**Market Analysis:**
- Average star rating by market
- Rating trends over time
- Best/worst performing segments

**Competitive Intelligence:**
- Competitor star ratings
- Market positioning opportunities
- Quality leaders vs. laggards

**Investment Thesis:**
- Where are ratings improving?
- Turnaround opportunities
- Premium quality markets

Ask about specific markets or trends!`;
  }

  // Valuation page
  if (pathname === '/valuation') {
    return `Working on **valuations**? Star ratings impact value through:

**Direct Revenue Impact:**
- Occupancy correlation (5-10% spread)
- Payer mix quality
- SNF VBP payments (up to 2%)
- Managed care contract access

**Risk Factors:**
- SFF status = significant discount
- Declining ratings = risk premium
- Staffing instability = operational risk

**Valuation Adjustments:**
- 5-star: 1.2-1.5x typical multiple
- 3-star: Market multiple
- 1-2 star: 0.6-0.8x with turnaround plan

**Model Inputs:**
- Current rating and trend
- Time/cost to improve
- Market competition quality

What specific valuation aspect can I help with?`;
  }

  // ============================================
  // DEFAULT COMPREHENSIVE RESPONSE
  // ============================================
  return `Hi! I'm **Phill**, your CMS Five-Star expert. I have comprehensive knowledge of the entire rating system.

**I can help you with:**

📊 **Quality Measures (28 total)**
- All Long-Stay and Short-Stay measures
- Exact star thresholds for each
- Specific action plans to improve

⭐ **Star Rating Calculation**
- Health Inspection scoring
- Staffing requirements (including 2023 rules)
- Overall rating computation

📈 **Improvement Strategies**
- Evidence-based paths from 1→5 stars
- Cost-effective tactics (many free!)
- ROI data and timelines

💰 **M&A & Valuation**
- How ratings affect facility value
- Due diligence guidance
- Turnaround potential analysis

**Try asking me:**
- "How do I reduce falls?"
- "What are the staffing requirements?"
- "How is the overall rating calculated?"
- "What's the ROI of improving to 4 stars?"
- "Explain pressure ulcer thresholds"
- "How do stars affect valuation?"

Or visit **/learn** for the full knowledge base!`;
}

// ============================================
// CONTEXT-AWARE QUICK ACTIONS
// ============================================

function getQuickActions(pathname: string): QuickAction[] {
  const baseActions: QuickAction[] = [
    { label: 'QM Overview', prompt: 'Give me an overview of all quality measures', icon: <Activity className="w-4 h-4" /> },
    { label: 'Improve Stars', prompt: 'How can I improve star ratings cost-effectively?', icon: <Star className="w-4 h-4" /> },
  ];

  if (pathname === '/quality-measures') {
    return [
      { label: 'Falls Plan', prompt: 'Give me the complete action plan to reduce falls', icon: <AlertTriangle className="w-4 h-4" /> },
      { label: 'What-If Help', prompt: 'How do I use the What-If Simulator?', icon: <Calculator className="w-4 h-4" /> },
      { label: 'QM Thresholds', prompt: 'What are all the star thresholds for quality measures?', icon: <Target className="w-4 h-4" /> },
      { label: 'Methodology', prompt: 'Explain the CMS calculation methodology', icon: <BookOpen className="w-4 h-4" /> },
    ];
  }

  if (pathname === '/learn') {
    return [
      { label: 'Health Inspections', prompt: 'Explain the Health Inspections domain with scoring details', icon: <Shield className="w-4 h-4" /> },
      { label: 'Staffing Rules', prompt: 'Explain staffing requirements including 2023 changes', icon: <Users className="w-4 h-4" /> },
      { label: 'All 28 QMs', prompt: 'List all 28 quality measures with their weights', icon: <Activity className="w-4 h-4" /> },
      { label: 'Resources', prompt: 'What CMS resources and guides are available?', icon: <BookOpen className="w-4 h-4" /> },
    ];
  }

  if (pathname.startsWith('/provider/')) {
    return [
      { label: 'Rating Impact', prompt: 'How do star ratings affect facility value?', icon: <TrendingUp className="w-4 h-4" /> },
      { label: 'Quick Wins', prompt: 'What are quick wins to improve star ratings?', icon: <Zap className="w-4 h-4" /> },
      { label: 'QM Analysis', prompt: 'How do I analyze a facility\'s QM performance?', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'Due Diligence', prompt: 'What star rating due diligence should I do?', icon: <FileText className="w-4 h-4" /> },
    ];
  }

  if (pathname === '/deals' || pathname === '/valuation') {
    return [
      { label: 'Valuation Impact', prompt: 'How do star ratings affect valuation multiples?', icon: <DollarSign className="w-4 h-4" /> },
      { label: 'Turnaround Timeline', prompt: 'How long does it take to improve star ratings?', icon: <Clock className="w-4 h-4" /> },
      { label: 'Due Diligence', prompt: 'What rating data should I request in due diligence?', icon: <FileText className="w-4 h-4" /> },
      { label: 'Risk Factors', prompt: 'What regulatory risks affect facility value?', icon: <AlertTriangle className="w-4 h-4" /> },
    ];
  }

  if (pathname === '/map' || pathname === '/insights') {
    return [
      { label: 'Market Analysis', prompt: 'How do star ratings vary by market?', icon: <BarChart3 className="w-4 h-4" /> },
      { label: 'CON States', prompt: 'How do CON states affect quality ratings?', icon: <Building2 className="w-4 h-4" /> },
      ...baseActions,
    ];
  }

  return [
    ...baseActions,
    { label: 'Calculation', prompt: 'How is the overall star rating calculated?', icon: <Calculator className="w-4 h-4" /> },
    { label: 'Resources', prompt: 'What resources and guides are available?', icon: <FileText className="w-4 h-4" /> },
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

  const quickActions = getQuickActions(pathname);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

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

    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    const response = generateResponse(text, pathname);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsTyping(false);
  }, [input, pathname]);

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
            <div className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-sm font-medium">Ask Phill - Five-Star Expert</span>
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
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Phill</h3>
                  <p className="text-xs text-white/80">CMS Five-Star Expert</p>
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
                  <div className="h-[400px] overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-turquoise-500)]/10 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-[var(--color-turquoise-500)]" />
                        </div>
                        <h4 className="font-semibold mb-2">Hi, I'm Phill!</h4>
                        <p className="text-sm text-[var(--color-text-muted)] mb-1">
                          Your CMS Five-Star rating expert.
                        </p>
                        <p className="text-xs text-[var(--color-text-muted)] mb-4">
                          I know all 28 quality measures, star thresholds, improvement strategies, and M&A implications.
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
                                {msg.content.split(/(\*\*.*?\*\*|\`.*?\`)/g).map((part, i) => {
                                  if (part.startsWith('**') && part.endsWith('**')) {
                                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                                  }
                                  if (part.startsWith('`') && part.endsWith('`')) {
                                    return <code key={i} className="px-1 py-0.5 rounded bg-black/20 text-xs font-mono">{part.slice(1, -1)}</code>;
                                  }
                                  return part;
                                })}
                              </div>
                            </div>
                          </motion.div>
                        ))}

                        {isTyping && (
                          <div className="flex justify-start">
                            <div className="bg-[var(--color-bg-secondary)] p-3 rounded-2xl rounded-tl-sm">
                              <Loader2 className="w-5 h-5 animate-spin text-[var(--color-turquoise-500)]" />
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
                        placeholder="Ask about quality measures, star ratings, M&A..."
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
