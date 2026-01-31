'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, ChevronDown,
  Activity, Star, Target, HelpCircle, Lightbulb,
  TrendingUp, AlertTriangle, CheckCircle, Loader2,
  BookOpen, Calculator, Shield, Users, FileText
} from 'lucide-react';
import FiveStarDataset, { queryKnowledge, getActionPlan, getImprovementRecommendations } from '@/lib/knowledge';

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

// Generate comprehensive responses using the knowledge base
function generateResponse(input: string, pathname: string): string {
  const lowerInput = input.toLowerCase();

  // Health Inspections
  if (lowerInput.includes('health inspection') || lowerInput.includes('survey') || lowerInput.includes('deficien')) {
    const domain = FiveStarDataset.Domains.HealthInspections;
    return `**Health Inspections Domain**

The Health Inspections domain is the **foundation** of the overall star rating (40% implicit weight).

**Data Source:** State surveys via CASPER system

**How Deficiencies Are Scored:**
${domain.CalculationSteps[0].Examples?.slice(0, 5).map(e => `- Level ${e.Level}: ${e.Description} = ${e.Points} points`).join('\n')}

**Calculation Formula:**
\`Total = (Cycle1 × 0.6) + (Cycle2 × 0.3) + (Cycle3 × 0.1)\`

**Star Cut Points (Q4 2023):**
${domain.StarCutPoints.map(s => `- ${s.Stars} Stars: ${s.ScoreRange} points`).join('\n')}

**Key Facts:**
- Abuse citations double the point value
- Repeat deficiencies add 50% extra points
- Substantiated complaints count at full weight

Would you like specific strategies to reduce deficiencies?`;
  }

  // Staffing Domain
  if (lowerInput.includes('staff') && (lowerInput.includes('domain') || lowerInput.includes('rating') || lowerInput.includes('hprd') || lowerInput.includes('hour'))) {
    const domain = FiveStarDataset.Domains.Staffing;
    return `**Staffing Domain**

**Data Source:** PBJ (Payroll-Based Journal) quarterly submissions (mandatory since 2016)

**Key Metrics Tracked:**
${domain.Metrics.map(m => `- ${m}`).join('\n')}

**How HPRD is Calculated:**
\`Adjusted HPRD = Actual Hours / Expected Hours (case-mix adjusted)\`

**Star Thresholds:**
${domain.StarThresholds.map(s => `- ${s.Stars} Stars: RN ${s.RNPoints} pts, Total ${s.TotalPoints} pts`).join('\n')}

**2023 Rule Changes:**
${domain.Post2023Rules.map(r => `- ${r}`).join('\n')}

**Pro Tips:**
1. Weekend RN staffing is now required for 4+ stars
2. High turnover (>60%) can cost you a star
3. Data is audited - accuracy matters

Would you like strategies to improve staffing scores?`;
  }

  // Falls QM
  if (lowerInput.includes('fall')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Falls'));
    const actions = getActionPlan('falls');
    return `**Falls with Major Injury** - Weight: ${measure?.Weight} (HIGHEST IMPACT)

This is the **most heavily weighted** quality measure. Improving falls can significantly boost your star rating.

**Star Thresholds (Long-Stay):**
- 5 Stars: ${measure?.Thresholds.FiveStar}
- 4 Stars: ${measure?.Thresholds.FourStar}
- 3 Stars: ${measure?.Thresholds.ThreeStar}
- 2 Stars: ${measure?.Thresholds.TwoStar}
- 1 Star: ${measure?.Thresholds.OneStar}

**National Average:** ${measure?.NationalAverage}

**Action Plan to Reduce Falls:**
${actions.map((a, i) => a).join('\n')}

**Quick Wins:**
- Hourly rounding protocols (FREE)
- Medication reviews for fall-risk drugs
- Non-slip footwear requirement
- Low beds for high-risk residents`;
  }

  // Pressure Ulcers QM
  if (lowerInput.includes('pressure') || lowerInput.includes('ulcer') || lowerInput.includes('wound')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Pressure'));
    const actions = getActionPlan('pressure');
    return `**Pressure Ulcers (High Risk)** - Weight: ${measure?.Weight} (HIGH IMPACT)

**Star Thresholds:**
- 5 Stars: ${measure?.Thresholds.FiveStar}
- 4 Stars: ${measure?.Thresholds.FourStar}
- 3 Stars: ${measure?.Thresholds.ThreeStar}
- 2 Stars: ${measure?.Thresholds.TwoStar}
- 1 Star: ${measure?.Thresholds.OneStar}

**National Average:** ${measure?.NationalAverage}

**Action Plan:**
${actions.map(a => a).join('\n')}

**Key Prevention Strategies:**
- Repositioning every 2 hours (document it!)
- Pressure-redistributing surfaces
- Nutrition optimization (protein, vitamin C, zinc)
- Daily skin assessments`;
  }

  // UTI QM
  if (lowerInput.includes('uti') || lowerInput.includes('urinary') || lowerInput.includes('catheter') && lowerInput.includes('infection')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('UTI'));
    const actions = getActionPlan('uti');
    return `**Urinary Tract Infections** - Weight: ${measure?.Weight}

**Star Thresholds:**
- 5 Stars: ${measure?.Thresholds.FiveStar}
- 4 Stars: ${measure?.Thresholds.FourStar}
- 3 Stars: ${measure?.Thresholds.ThreeStar}
- 2 Stars: ${measure?.Thresholds.TwoStar}
- 1 Star: ${measure?.Thresholds.OneStar}

**National Average:** ${measure?.NationalAverage}

**Action Plan:**
${actions.map(a => a).join('\n')}

**Key Strategies:**
- Minimize catheter use (biggest impact)
- Remove catheters as soon as possible
- Proper catheter care protocols
- Hydration tracking`;
  }

  // Antipsychotics QM
  if (lowerInput.includes('antipsychotic') || lowerInput.includes('medication') || lowerInput.includes('psych')) {
    const measure = FiveStarDataset.Domains.QualityMeasures.LongStayMeasuresList.find(m => m.Name.includes('Antipsychotic'));
    const actions = getActionPlan('antipsychotic');
    return `**Antipsychotic Medication Use** - Weight: ${measure?.Weight}

**Star Thresholds:**
- 5 Stars: ${measure?.Thresholds.FiveStar}
- 4 Stars: ${measure?.Thresholds.FourStar}
- 3 Stars: ${measure?.Thresholds.ThreeStar}
- 2 Stars: ${measure?.Thresholds.TwoStar}
- 1 Star: ${measure?.Thresholds.OneStar}

**National Average:** ${measure?.NationalAverage}

**Note:** Excludes residents with schizophrenia, Huntington's, or Tourette's.

**Action Plan:**
${actions.map(a => a).join('\n')}

**Non-Pharmacological Alternatives:**
- Person-centered dementia care
- Environmental modifications
- Activity programming
- Music/art therapy`;
  }

  // Quality Measures Overview
  if (lowerInput.includes('quality measure') || lowerInput.includes('qm') || (lowerInput.includes('measure') && lowerInput.includes('list'))) {
    const qm = FiveStarDataset.Domains.QualityMeasures;
    return `**CMS Quality Measures Overview**

There are **${qm.TotalMeasures} measures** total (${qm.LongStayMeasures} Long-Stay + ${qm.ShortStayMeasures} Short-Stay).

**Long-Stay Measures (residents >100 days):**
${qm.LongStayMeasuresList.map(m => `- **${m.Name}** - Weight: ${m.Weight} (${m.Impact})`).join('\n')}

**Short-Stay Measures (post-acute):**
${qm.ShortStayMeasuresList.map(m => `- **${m.Name}** - Weight: ${m.Weight} (${m.Impact})`).join('\n')}

**QM Star Cut Points:**
${qm.StarCutPoints.map(s => `- ${s.Stars} Stars: ${s.ScoreRange} points`).join('\n')}

**Highest Impact Measures to Focus On:**
1. Falls with Major Injury (Long-Stay) - Weight 3.0
2. Pressure Ulcers - Weight 2.5
3. UTIs - Weight 2.0

Ask me about any specific measure for detailed thresholds and action plans!`;
  }

  // Star Rating Improvement
  if (lowerInput.includes('improve') && (lowerInput.includes('star') || lowerInput.includes('rating'))) {
    const strategies = FiveStarDataset.ImprovementStrategies.EffectivePaths;
    return `**How to Improve Star Ratings**

${strategies.map(s => `**${s.FromTo} Stars:**
Timeline: ${s.Timeline}
Key Actions:
${s.KeyActions.slice(0, 4).map(a => `- ${a}`).join('\n')}
`).join('\n')}

**High-ROI Quick Wins:**
1. MDS coding audit (errors drop scores 10-20%)
2. Fall prevention protocols (highest-weight QM)
3. Catheter removal initiative
4. Antipsychotic reduction program

**Evidence:** Per AHCA data, a 1-star improvement yields $50K+ annual revenue from better referrals.

What's your current star rating? I can give specific recommendations.`;
  }

  // Cost-effective improvements
  if (lowerInput.includes('cost') || lowerInput.includes('budget') || lowerInput.includes('cheap') || lowerInput.includes('afford')) {
    const tactics = FiveStarDataset.ImprovementStrategies.CostEffectiveTactics;
    return `**Cost-Effective Improvement Strategies**

**Low-Cost (Under $10K/year):**
${tactics[0].Examples.map(e => `- ${e}`).join('\n')}
ROI: ${tactics[0].ROI}

**Medium-Cost ($10K-$50K/year):**
${tactics[1].Examples.map(e => `- ${e}`).join('\n')}

**Avoid These Pitfalls:**
${FiveStarDataset.ImprovementStrategies.AvoidPitfalls.map(p => `- ${p}`).join('\n')}

**Free Resources:**
- CMS webinars and YouTube tutorials
- QIO technical assistance (free consulting)
- AHCA Quality Initiative materials

**ROI Fact:** Staffing investments return 2-3x via lower penalties and reduced turnover costs.`;
  }

  // Overall Rating Calculation
  if (lowerInput.includes('overall') || lowerInput.includes('calculate') || (lowerInput.includes('how') && lowerInput.includes('star'))) {
    const overall = FiveStarDataset.Domains.Overall;
    return `**Overall Star Rating Calculation**

The overall rating combines all three domains:

**Calculation Steps:**
${overall.CalculationMethod.map(s => s).join('\n')}

**Point Conversion:**
${overall.PointConversion.map(p => `- ${p.TotalPoints} points = ${p.OverallStars} stars`).join('\n')}

**Important Caps:**
${overall.Caps.map(c => `- ${c}`).join('\n')}

**Key Insight:** Health Inspections is the BASE - you can only go up from there based on Staffing and QM performance.

Would you like help with a specific domain?`;
  }

  // Resources
  if (lowerInput.includes('resource') || lowerInput.includes('guide') || lowerInput.includes('document') || lowerInput.includes('reference')) {
    const resources = FiveStarDataset.Resources;
    return `**CMS Five-Star Resources**

**Official CMS Documents:**
${resources.OfficialCMS.slice(0, 3).map(r => `- [${r.Title}](${r.URL})`).join('\n')}

**Guides and Tools:**
${resources.GuidesAndTools.slice(0, 3).map(r => `- [${r.Title}](${r.URL})`).join('\n')}

**Research Studies:**
${resources.ResearchAndStudies.map(r => `- [${r.Title}](${r.URL})`).join('\n')}

**Training:**
${resources.TrainingAndWebinars.map(r => `- [${r.Title}](${r.URL})`).join('\n')}

Visit our **/learn** page for a comprehensive walkthrough of the entire system!`;
  }

  // What-if simulator
  if (lowerInput.includes('what-if') || lowerInput.includes('simulator') || lowerInput.includes('simulate')) {
    return `**What-If Simulator**

Located on the **Quality Measures page**, the simulator lets you:

1. **Adjust individual QM performance** with sliders
2. **See real-time projected star changes**
3. **Identify highest-impact improvements**
4. **Model scenarios before investing**

**How to Use:**
1. Go to Quality Measures page (/quality-measures)
2. Select "What-If Simulator" tab
3. Adjust sliders for each measure
4. Watch the projected rating update

**Pro Tip:** Focus on high-weight measures first:
- Falls with Major Injury (weight: 3.0)
- Pressure Ulcers (weight: 2.5)
- UTIs (weight: 2.0)

These give you the biggest bang for your improvement efforts!`;
  }

  // Specific star level recommendations
  const starMatch = lowerInput.match(/(\d)\s*star/);
  if (starMatch || lowerInput.includes('current') || lowerInput.includes('my rating')) {
    const starLevel = starMatch ? parseInt(starMatch[1]) : 3;
    const recs = getImprovementRecommendations(starLevel);
    return `**Recommendations for ${recs.fromTo}**

**Timeline:** ${recs.timeline}

**Priority Actions:**
${recs.priorityActions.map((a, i) => `${i + 1}. ${a}`).join('\n')}

**Expected ROI:** ${recs.expectedROI}

**Focus Areas:**
${recs.focus.slice(0, 5).map(f => `- ${f}`).join('\n')}

Would you like details on any specific improvement area?`;
  }

  // Context-aware responses based on current page
  if (pathname === '/quality-measures') {
    return `I see you're on the **Quality Measures page**!

This page lets you:
1. **Overview Tab**: See priority improvement areas ranked by impact
2. **Long-Stay/Short-Stay Tabs**: Drill into each measure with thresholds
3. **What-If Simulator**: Model improvements in real-time
4. **Action Plan**: Get specific, actionable recommendations

**Quick Tips:**
- Focus on highest-weight measures first (Falls, Pressure Ulcers)
- Use the simulator to see projected star changes
- Each measure has 5+ concrete action steps

What would you like to know more about?`;
  }

  if (pathname === '/learn') {
    return `Welcome to the **CMS Five-Star Knowledge Base**!

Here you can learn about:
- How ratings are calculated
- Health Inspection scoring methodology
- Staffing requirements and thresholds
- All 28 Quality Measures with specific thresholds
- Improvement strategies and timelines
- Cost-effective tactics

Use the tabs to explore each domain in depth. Ask me specific questions anytime!`;
  }

  if (pathname.startsWith('/provider/')) {
    return `Looking at a **specific provider**? I can help you understand:

- **Quality Scores**: What drives their current rating
- **Improvement Opportunities**: Where they can gain stars
- **Valuation Impact**: How stars affect facility value
- **Benchmarking**: How they compare to peers

What aspect would you like to explore?`;
  }

  // Default comprehensive response
  return `Hi! I'm **Phill**, your CMS Five-Star expert.

I have comprehensive knowledge of the entire rating system, including:

**Quality Measures (28 total):**
- All Long-Stay and Short-Stay measures
- Exact star thresholds for each
- Specific action plans to improve

**Star Rating Calculation:**
- Health Inspection scoring methodology
- Staffing requirements and formulas
- Overall rating computation

**Improvement Strategies:**
- Evidence-based paths from 1→5 stars
- Cost-effective tactics (many free!)
- ROI data and timelines

**Try asking me:**
- "How do I reduce falls?"
- "What are the staffing requirements?"
- "How is the overall rating calculated?"
- "Give me cost-effective improvement ideas"
- "Explain pressure ulcer thresholds"

Or visit **/learn** for the full knowledge base!`;
}

// Quick action buttons based on context
function getQuickActions(pathname: string): QuickAction[] {
  const baseActions: QuickAction[] = [
    {
      label: 'QM Overview',
      prompt: 'Give me an overview of all quality measures',
      icon: <Activity className="w-4 h-4" />
    },
    {
      label: 'Improve Stars',
      prompt: 'How can I improve star ratings cost-effectively?',
      icon: <Star className="w-4 h-4" />
    },
  ];

  if (pathname === '/quality-measures') {
    return [
      {
        label: 'Falls Action Plan',
        prompt: 'Give me the complete action plan to reduce falls',
        icon: <AlertTriangle className="w-4 h-4" />
      },
      {
        label: 'What-If Help',
        prompt: 'How do I use the What-If Simulator?',
        icon: <Calculator className="w-4 h-4" />
      },
      {
        label: 'QM Thresholds',
        prompt: 'What are all the star thresholds for quality measures?',
        icon: <Target className="w-4 h-4" />
      },
    ];
  }

  if (pathname === '/learn') {
    return [
      {
        label: 'Health Inspections',
        prompt: 'Explain the Health Inspections domain in detail',
        icon: <Shield className="w-4 h-4" />
      },
      {
        label: 'Staffing',
        prompt: 'Explain the Staffing domain and HPRD requirements',
        icon: <Users className="w-4 h-4" />
      },
      {
        label: 'Resources',
        prompt: 'What CMS resources and guides are available?',
        icon: <BookOpen className="w-4 h-4" />
      },
    ];
  }

  if (pathname.startsWith('/provider/')) {
    return [
      {
        label: 'Rating Impact',
        prompt: 'How do star ratings affect facility value?',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        label: 'Quick Wins',
        prompt: 'What are quick wins to improve star ratings?',
        icon: <Lightbulb className="w-4 h-4" />
      },
      ...baseActions,
    ];
  }

  return [
    ...baseActions,
    {
      label: 'Calculation',
      prompt: 'How is the overall star rating calculated?',
      icon: <Calculator className="w-4 h-4" />
    },
    {
      label: 'Resources',
      prompt: 'What resources and guides are available?',
      icon: <FileText className="w-4 h-4" />
    },
  ];
}

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

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleSend = useCallback(async (messageText?: string) => {
    const text = messageText || input.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay for natural feel
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));

    // Generate response using knowledge base
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

  // Don't show on landing page
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
                          I know all 28 quality measures, star thresholds, and improvement strategies.
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
                                {msg.content.split('**').map((part, i) =>
                                  i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                                )}
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
                        placeholder="Ask about quality measures, star ratings..."
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
