'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Sparkles, ChevronDown,
  Activity, Star, Target, HelpCircle, Lightbulb,
  TrendingUp, AlertTriangle, CheckCircle, Loader2
} from 'lucide-react';

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

// Knowledge base for Phill - context-aware responses
const phillKnowledge = {
  qualityMeasures: {
    overview: `Quality Measures (QMs) are standardized metrics CMS uses to evaluate nursing home care quality. There are 13 key measures:

**Long-Stay Measures (8):**
1. Falls with Major Injury - Weight: 3.0 (HIGH impact)
2. Pressure Ulcers (High Risk) - Weight: 2.5
3. UTIs - Weight: 2.0
4. Antipsychotic Medication Use - Weight: 1.5
5. Physical Restraints - Weight: 1.5
6. Catheter Use - Weight: 1.5
7. ADL Decline - Weight: 1.0
8. Depressive Symptoms - Weight: 1.0

**Short-Stay Measures (5):**
1. Pressure Ulcers - Weight: 2.5
2. Falls with Major Injury - Weight: 2.0
3. Functional Improvement - Weight: 2.0
4. Rehospitalizations - Weight: 1.5
5. ED Visits - Weight: 1.5

Higher weights mean bigger impact on overall star rating.`,

    falls: `**Falls with Major Injury** is the highest-weighted QM (3.0).

**Star Thresholds:**
- 5 Stars: < 0.5%
- 4 Stars: 0.5-1.0%
- 3 Stars: 1.0-2.0%
- 2 Stars: 2.0-3.5%
- 1 Star: > 3.5%

**Improvement Strategies:**
1. Implement hourly rounding protocols
2. Install bed/chair sensor alarms
3. Review medications monthly for fall-risk drugs (benzodiazepines, opioids, antihypertensives)
4. Ensure adequate lighting in all areas
5. Require non-slip footwear for all residents
6. Physical therapy for balance training
7. Hip protectors for high-risk residents`,

    pressureUlcers: `**Pressure Ulcers (High Risk)** - Weight: 2.5

**Star Thresholds:**
- 5 Stars: < 2.0%
- 4 Stars: 2.0-4.0%
- 3 Stars: 4.0-7.0%
- 2 Stars: 7.0-10.0%
- 1 Star: > 10.0%

**Improvement Strategies:**
1. Reposition immobile residents every 2 hours
2. Use pressure-redistributing mattresses and cushions
3. Keep skin clean and dry
4. Ensure adequate nutrition (protein, vitamin C, zinc)
5. Daily skin assessments
6. Document turning schedules
7. Use heel protectors and specialty beds for high-risk patients`,

    utis: `**Urinary Tract Infections (UTIs)** - Weight: 2.0

**Star Thresholds:**
- 5 Stars: < 1.5%
- 4 Stars: 1.5-3.0%
- 3 Stars: 3.0-5.0%
- 2 Stars: 5.0-7.5%
- 1 Star: > 7.5%

**Improvement Strategies:**
1. Minimize catheter use - remove as soon as medically appropriate
2. Maintain proper catheter care protocols
3. Ensure adequate hydration (8+ glasses daily)
4. Proper perineal hygiene
5. Cranberry supplementation where appropriate
6. Monitor for early symptoms
7. Staff education on infection prevention`,

    antipsychotics: `**Antipsychotic Medication Use** - Weight: 1.5

**Star Thresholds:**
- 5 Stars: < 10%
- 4 Stars: 10-15%
- 3 Stars: 15-22%
- 2 Stars: 22-30%
- 1 Star: > 30%

**Improvement Strategies:**
1. Implement behavioral interventions first
2. Use person-centered dementia care approaches
3. Gradual dose reduction protocols
4. Regular medication reviews by pharmacist
5. Staff training on non-pharmacological interventions
6. Document behaviors and alternatives tried
7. Consult with geriatric psychiatry when needed`,
  },

  starRatings: {
    overview: `**CMS 5-Star Rating System**

The overall rating combines three components:

1. **Health Inspections** (Most heavily weighted)
   - Based on annual surveys and complaint investigations
   - Includes scope and severity of deficiencies

2. **Quality Measures** (13 measures)
   - Long-stay and short-stay metrics
   - Updated quarterly

3. **Staffing**
   - RN hours per resident day
   - Total nursing hours

**Rating Distribution:**
- 5 Stars: Top 10% performers
- 4 Stars: Next 20% (10-30th percentile)
- 3 Stars: Middle 40% (30-70th percentile)
- 2 Stars: Next 20% (70-90th percentile)
- 1 Star: Bottom 10%`,

    improving: `**Strategies to Improve Star Ratings:**

**Quick Wins (1-3 months):**
1. Focus on highest-weighted QMs first
2. Reduce antipsychotic use through care conferences
3. Implement fall prevention program
4. Catheter removal initiative

**Medium-Term (3-6 months):**
1. Staff training on QM documentation
2. Pressure ulcer prevention protocols
3. UTI reduction program
4. Increase RN staffing if below thresholds

**Long-Term (6-12 months):**
1. Culture change to person-centered care
2. Quality improvement infrastructure
3. Prepare for annual survey
4. Address recurring deficiency patterns`,
  },

  mna: {
    valuation: `**Hospice Valuation Methods:**

1. **Revenue Multiple: 1.0-1.5x**
   - Premium for 4-5 star ratings
   - Discount for compliance issues

2. **EBITDA Multiple: 4-6x**
   - Higher for profitable, growing agencies
   - Lower for turnaround situations

3. **ADC Multiple: $15,000-$25,000 per ADC**
   - Sweet spot: ADC 20-60 for tuck-ins
   - Platform candidates: ADC 60+

**Value Drivers:**
- Star ratings (4-5 stars = premium)
- CON state location (regulatory moat)
- Clean compliance record
- Independent ownership (easier negotiation)
- Growth market demographics`,

    ownerCarryBack: `**Owner Carry-Back Financing:**

Seller financing is common in hospice M&A. Ideal candidates:
- Single or simple ownership structure
- ADC 20-60 (not too large for personal deal)
- Non-PE backed (no institutional sellers)
- Aging owner looking for liquidity
- Independent operator (not chain)

**Typical Terms:**
- 10-20% of purchase price as seller note
- 5-7 year term
- Interest rate: 5-8%
- Often subordinated to senior debt

Use our Owner Carry-Back page to find prime candidates.`,

    conStates: `**Certificate of Need (CON) States:**

CON states require regulatory approval for new hospice agencies, creating barriers to entry.

**CON States for Hospice:**
Washington, Oregon, Montana, Hawaii, Georgia, North Carolina, South Carolina, Kentucky, Tennessee, and others.

**Why CON Matters:**
1. Protects existing operators from competition
2. More predictable market share
3. Premium valuations (10-20% higher)
4. Regulatory moat for acquirers

**Strategy:**
Focus on GREEN targets in CON states for best risk-adjusted opportunities.`,
  },

  platform: {
    navigation: `**Platform Navigation:**

- **Dashboard**: Overview of all targets and metrics
- **Top 10**: Best acquisition opportunities
- **Search**: Advanced filtering by any criteria
- **Map**: Geographic visualization
- **Quality Measures**: QM drill-down and What-If simulator
- **Deal Pipeline**: Track opportunities
- **Valuation**: Calculate enterprise value
- **Reports**: Generate PDF due diligence reports
- **Export**: Download data as CSV/Excel

**Pro Tip:** Use the Demo button in the nav to take a guided tour.`,

    whatIf: `**What-If Simulator:**

Located on the Quality Measures page, the simulator lets you:

1. Adjust individual QM performance with sliders
2. See real-time projected star rating changes
3. Identify which improvements have biggest impact
4. Model improvement scenarios before investing

**How to Use:**
1. Go to Quality Measures page
2. Select "What-If Simulator" tab
3. Adjust sliders for each measure
4. Watch the projected rating update
5. Prioritize improvements with highest ROI`,
  },
};

// Generate contextual responses
function generateResponse(input: string, pathname: string): string {
  const lowerInput = input.toLowerCase();

  // Quality Measures questions
  if (lowerInput.includes('quality measure') || lowerInput.includes('qm')) {
    if (lowerInput.includes('fall')) return phillKnowledge.qualityMeasures.falls;
    if (lowerInput.includes('pressure') || lowerInput.includes('ulcer')) return phillKnowledge.qualityMeasures.pressureUlcers;
    if (lowerInput.includes('uti') || lowerInput.includes('urinary')) return phillKnowledge.qualityMeasures.utis;
    if (lowerInput.includes('antipsychotic') || lowerInput.includes('medication')) return phillKnowledge.qualityMeasures.antipsychotics;
    return phillKnowledge.qualityMeasures.overview;
  }

  // Star rating questions
  if (lowerInput.includes('star') || lowerInput.includes('rating')) {
    if (lowerInput.includes('improve') || lowerInput.includes('increase')) return phillKnowledge.starRatings.improving;
    return phillKnowledge.starRatings.overview;
  }

  // Valuation questions
  if (lowerInput.includes('valuation') || lowerInput.includes('value') || lowerInput.includes('worth') || lowerInput.includes('multiple')) {
    return phillKnowledge.mna.valuation;
  }

  // Owner carry-back
  if (lowerInput.includes('carry') || lowerInput.includes('seller') || lowerInput.includes('financing')) {
    return phillKnowledge.mna.ownerCarryBack;
  }

  // CON states
  if (lowerInput.includes('con') || lowerInput.includes('certificate')) {
    return phillKnowledge.mna.conStates;
  }

  // What-if simulator
  if (lowerInput.includes('what-if') || lowerInput.includes('simulator') || lowerInput.includes('simulate')) {
    return phillKnowledge.platform.whatIf;
  }

  // Navigation help
  if (lowerInput.includes('how') && (lowerInput.includes('find') || lowerInput.includes('use') || lowerInput.includes('navigate'))) {
    return phillKnowledge.platform.navigation;
  }

  // Context-aware responses based on current page
  if (pathname === '/quality-measures') {
    return `I see you're on the Quality Measures page! Here you can:

1. **Overview Tab**: See priority improvement areas
2. **Long-Stay/Short-Stay Tabs**: Drill into each measure
3. **What-If Simulator**: Model improvements
4. **Action Plan**: Get specific recommendations

What would you like to know more about? You can ask me about specific measures like falls, pressure ulcers, or UTIs.`;
  }

  if (pathname.startsWith('/provider/')) {
    return `Looking at a specific provider? I can help you understand:

- **Quality Scores**: What drives their rating
- **Improvement Opportunities**: Where they can improve
- **Valuation**: What this provider might be worth
- **Carry-Back Potential**: Likelihood of seller financing

What aspect would you like to explore?`;
  }

  if (pathname === '/valuation') {
    return phillKnowledge.mna.valuation;
  }

  // Default helpful response
  return `I'm Phill, your quality measures and M&A assistant! I can help with:

**Quality Measures:**
- Explain any of the 13 QMs
- Star rating thresholds
- Improvement strategies

**Star Ratings:**
- How ratings are calculated
- What drives improvements
- Quick wins vs long-term strategies

**M&A & Valuation:**
- Valuation multiples
- Owner carry-back opportunities
- CON state strategy

**Platform Help:**
- How to use the What-If Simulator
- Finding best acquisition targets
- Navigating the platform

What would you like to know?`;
}

// Quick action buttons based on context
function getQuickActions(pathname: string): QuickAction[] {
  const baseActions: QuickAction[] = [
    {
      label: 'Quality Measures',
      prompt: 'Explain quality measures and how they work',
      icon: <Activity className="w-4 h-4" />
    },
    {
      label: 'Improve Stars',
      prompt: 'How can I improve star ratings?',
      icon: <Star className="w-4 h-4" />
    },
  ];

  if (pathname === '/quality-measures') {
    return [
      {
        label: 'What-If Simulator',
        prompt: 'How do I use the What-If Simulator?',
        icon: <TrendingUp className="w-4 h-4" />
      },
      {
        label: 'Falls Prevention',
        prompt: 'How do I reduce falls with major injury?',
        icon: <AlertTriangle className="w-4 h-4" />
      },
      {
        label: 'Quick Wins',
        prompt: 'What are the quickest ways to improve star ratings?',
        icon: <Lightbulb className="w-4 h-4" />
      },
    ];
  }

  if (pathname.startsWith('/provider/')) {
    return [
      {
        label: 'Valuation',
        prompt: 'How is this provider valued?',
        icon: <Target className="w-4 h-4" />
      },
      {
        label: 'Carry-Back',
        prompt: 'Is this a good owner carry-back candidate?',
        icon: <Sparkles className="w-4 h-4" />
      },
      ...baseActions,
    ];
  }

  if (pathname === '/valuation') {
    return [
      {
        label: 'Multiples',
        prompt: 'What valuation multiples should I use?',
        icon: <Target className="w-4 h-4" />
      },
      {
        label: 'Seller Financing',
        prompt: 'Tell me about owner carry-back financing',
        icon: <Sparkles className="w-4 h-4" />
      },
      ...baseActions,
    ];
  }

  return [
    ...baseActions,
    {
      label: 'CON States',
      prompt: 'What are CON states and why do they matter?',
      icon: <Target className="w-4 h-4" />
    },
    {
      label: 'Find Targets',
      prompt: 'How do I find the best acquisition targets?',
      icon: <HelpCircle className="w-4 h-4" />
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

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

    // Generate response
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
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full text-xs font-bold flex items-center justify-center">
              P
            </span>
            <div className="absolute right-full mr-3 px-3 py-1.5 rounded-lg bg-[var(--color-bg-primary)] border border-[var(--color-border)] shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <span className="text-sm">Ask Phill</span>
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
            className="fixed bottom-6 right-6 z-50 w-[400px] max-w-[calc(100vw-48px)] rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)] bg-[var(--color-bg-primary)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold">Phill</h3>
                  <p className="text-xs text-white/80">Quality Measures Expert</p>
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
                  <div className="h-[350px] overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--color-turquoise-500)]/10 flex items-center justify-center">
                          <Sparkles className="w-8 h-8 text-[var(--color-turquoise-500)]" />
                        </div>
                        <h4 className="font-semibold mb-2">Hi, I'm Phill!</h4>
                        <p className="text-sm text-[var(--color-text-muted)] mb-4">
                          I'm your expert on quality measures, star ratings, and hospice M&A.
                          Ask me anything!
                        </p>

                        {/* Quick Actions */}
                        <div className="flex flex-wrap justify-center gap-2">
                          {quickActions.map((action, i) => (
                            <button
                              key={i}
                              onClick={() => handleSend(action.prompt)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
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
                              className={`max-w-[85%] p-3 rounded-2xl ${
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
                        placeholder="Ask Phill anything..."
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
