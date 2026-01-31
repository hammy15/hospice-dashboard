'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronRight, ChevronLeft, Play, SkipForward,
  LayoutDashboard, Search, Map, Target, Trophy, Flame,
  Briefcase, Users, Calculator, FileText, Building2,
  TrendingUp, DollarSign, Shield, Sparkles, CheckCircle,
  ArrowRight, Zap, Globe, PieChart, Activity, HelpCircle,
  MessageSquare, Star, Sliders
} from 'lucide-react';

interface DemoStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  highlight?: string;
  stats?: { label: string; value: string }[];
  tip?: string;
}

const demoSteps: DemoStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Hospice Tracker',
    description: 'The M&A intelligence platform built for Aavencare to identify, analyze, and acquire hospice agencies across the United States. Let\'s walk through how to find your next acquisition opportunity.',
    icon: <Sparkles className="w-8 h-8" />,
    stats: [
      { label: 'Providers Tracked', value: '4,800+' },
      { label: 'States Covered', value: '50' },
      { label: 'Data Points', value: '100+' },
    ],
  },
  {
    id: 'dashboard',
    title: 'Executive Dashboard',
    description: 'Start here for a bird\'s-eye view of the entire market. See GREEN (best), YELLOW (good), and RED (avoid) targets at a glance. The dashboard shows your deal pipeline, top opportunities, and market trends.',
    icon: <LayoutDashboard className="w-8 h-8" />,
    highlight: '/',
    tip: 'GREEN targets are acquisition-ready with strong scores across quality, compliance, and operations.',
  },
  {
    id: 'insights',
    title: 'Market Insights',
    description: 'Deep-dive analytics on the hospice market. Understand regional trends, ownership patterns, and consolidation opportunities. Identify markets with the most independent operators ripe for acquisition.',
    icon: <TrendingUp className="w-8 h-8" />,
    highlight: '/insights',
    stats: [
      { label: 'PE Penetration', value: '~25%' },
      { label: 'Independent', value: '~60%' },
      { label: 'Opportunity', value: 'HIGH' },
    ],
  },
  {
    id: 'search',
    title: 'Advanced Search',
    description: 'Find exactly what you\'re looking for. Filter by state, classification, ADC range, ownership type, CON status, and more. Export results for your team or save searches for later.',
    icon: <Search className="w-8 h-8" />,
    highlight: '/search',
    tip: 'Use ADC 20-60 filter to find "sweet spot" targets perfect for tuck-in acquisitions.',
  },
  {
    id: 'map',
    title: 'Interactive Map',
    description: 'Visualize every hospice in America. See provider density, identify white space opportunities, and plan your geographic expansion strategy. Click any marker for instant provider details.',
    icon: <Map className="w-8 h-8" />,
    highlight: '/map',
  },
  {
    id: 'top10',
    title: 'Top 10 Opportunities',
    description: 'Our algorithm surfaces the 10 best acquisition targets based on your criteria. These are the providers with the highest overall scores, best market positions, and cleanest compliance records.',
    icon: <Trophy className="w-8 h-8" />,
    highlight: '/top-10',
    tip: 'Review Top 10 weekly — new opportunities surface as data refreshes.',
  },
  {
    id: 'hotmarkets',
    title: 'Hot Markets',
    description: 'Priority states with the best opportunities. Each market page shows local providers, competitive landscape, and county-level demographics. Focus on CON states for regulatory protection.',
    icon: <Flame className="w-8 h-8" />,
    highlight: '/market/wa',
    stats: [
      { label: 'WA Targets', value: '20' },
      { label: 'OR Targets', value: '18' },
      { label: 'MT Targets', value: '12' },
    ],
  },
  {
    id: 'pipeline',
    title: 'Deal Pipeline',
    description: 'Track every deal from lead to close. Drag-and-drop kanban board or list view. Add notes, set stages, assign values, and never lose track of an opportunity again.',
    icon: <Briefcase className="w-8 h-8" />,
    highlight: '/deals',
    tip: 'Move deals through: Lead → Qualified → LOI → Due Diligence → Closed',
  },
  {
    id: 'contacts',
    title: 'Contacts CRM',
    description: 'Manage relationships with owners, administrators, and brokers. Track outreach history, schedule follow-ups, and maintain a complete contact database for every target.',
    icon: <Users className="w-8 h-8" />,
    highlight: '/contacts',
  },
  {
    id: 'valuation',
    title: 'Valuation Calculator',
    description: 'Instantly value any target using industry multiples. Input ADC, revenue, and margin to get enterprise value ranges. Model seller notes and SBA scenarios.',
    icon: <Calculator className="w-8 h-8" />,
    highlight: '/valuation',
    stats: [
      { label: 'Revenue Multiple', value: '1.0-1.5x' },
      { label: 'EBITDA Multiple', value: '4-6x' },
      { label: 'ADC Multiple', value: '$15-25K' },
    ],
  },
  {
    id: 'reports',
    title: 'Due Diligence Reports',
    description: 'Generate comprehensive PDF reports for any provider. Includes scores, financials, ownership, competitors, and market demographics. Perfect for investment committee presentations.',
    icon: <FileText className="w-8 h-8" />,
    highlight: '/reports',
  },
  {
    id: 'ownercarry',
    title: 'Owner Carry-Back Finder',
    description: 'Identify targets most likely to accept seller financing. Our algorithm scores providers based on ownership structure, size, and other factors that indicate willingness to carry paper.',
    icon: <DollarSign className="w-8 h-8" />,
    highlight: '/owner-carryback',
    tip: 'Single-owner, ADC 20-60, non-PE backed = highest carry-back likelihood.',
  },
  {
    id: 'compliance',
    title: 'Compliance Dashboard',
    description: 'Risk assessment at a glance. See compliance scores, identify at-risk providers, and understand regulatory exposure before you acquire. Avoid costly surprises post-close.',
    icon: <Shield className="w-8 h-8" />,
    highlight: '/compliance',
  },
  {
    id: 'quality-measures',
    title: 'Quality Measures & Star Ratings',
    description: 'Deep dive into CMS Quality Measures. Drill down into all 13 QMs (8 Long-Stay, 5 Short-Stay), see exact star rating thresholds, and get specific actionable recommendations. Our "What-If Simulator" lets you model improvements and see projected star rating changes in real-time.',
    icon: <Activity className="w-8 h-8" />,
    highlight: '/quality-measures',
    stats: [
      { label: 'Quality Measures', value: '13' },
      { label: 'Action Plans', value: 'Custom' },
      { label: 'What-If Simulator', value: 'Live' },
    ],
    tip: 'Use the What-If Simulator to model QM improvements before investing in operational changes.',
  },
  {
    id: 'phill-assistant',
    title: 'Meet Phill - Your AI Assistant',
    description: 'Phill is your intelligent guide to quality measures and star ratings. Ask questions, get specific recommendations, and receive context-aware guidance. Phill understands nursing home operations and provides actionable advice — not generic suggestions.',
    icon: <MessageSquare className="w-8 h-8" />,
    tip: 'Phill can explain specific QM thresholds, suggest improvement strategies, and help you understand what drives star ratings.',
  },
  {
    id: 'faq',
    title: 'FAQ & Help Center',
    description: 'Find answers to common questions about CMS star ratings, quality measures, the platform features, and M&A strategies. Our comprehensive FAQ covers everything from data sources to valuation methodologies.',
    icon: <HelpCircle className="w-8 h-8" />,
    highlight: '/faq',
  },
  {
    id: 'ready',
    title: 'You\'re Ready to Go!',
    description: 'You now know how to use Hospice Tracker to find, analyze, and acquire hospice agencies. Start by exploring the Dashboard or search for providers in your target markets. Good luck growing Aavencare\'s footprint!',
    icon: <CheckCircle className="w-8 h-8" />,
    stats: [
      { label: 'Time Saved', value: '80%' },
      { label: 'Data Accuracy', value: '99%' },
      { label: 'Deal Flow', value: '10x' },
    ],
  },
];

interface DemoTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function DemoTour({ isOpen, onClose, onComplete }: DemoTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const step = demoSteps[currentStep];
  const progress = ((currentStep + 1) / demoSteps.length) * 100;

  const nextStep = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);

    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }

    setTimeout(() => setIsAnimating(false), 300);
  }, [currentStep, isAnimating, onComplete]);

  const prevStep = useCallback(() => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true);
    setCurrentStep(currentStep - 1);
    setTimeout(() => setIsAnimating(false), 300);
  }, [currentStep, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight' || e.key === 'Enter') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextStep, prevStep, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Demo Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-2xl glass-card rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]"
        >
          {/* Progress Bar */}
          <div className="h-1 bg-[var(--color-bg-tertiary)]">
            <motion.div
              className="h-full bg-gradient-to-r from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Play className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              <span>Platform Demo</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--color-bg-tertiary)] text-xs">
                {currentStep + 1} / {demoSteps.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setCurrentStep(demoSteps.length - 1);
                }}
                className="px-3 py-1 text-xs rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)] flex items-center gap-1"
              >
                <SkipForward className="w-3 h-3" />
                Skip
              </button>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="p-8"
            >
              {/* Icon & Title */}
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gradient-to-br from-[var(--color-turquoise-500)]/20 to-[var(--color-turquoise-600)]/10 text-[var(--color-turquoise-500)]">
                  {step.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
                    {step.title}
                  </h2>
                  {step.highlight && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[var(--color-bg-tertiary)] text-xs text-[var(--color-text-muted)]">
                      <Globe className="w-3 h-3" />
                      {step.highlight}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-[var(--color-text-secondary)] text-lg leading-relaxed mb-6">
                {step.description}
              </p>

              {/* Stats */}
              {step.stats && (
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {step.stats.map((stat, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-xl bg-[var(--color-bg-secondary)] text-center"
                    >
                      <div className="text-2xl font-bold font-mono text-[var(--color-turquoise-500)]">
                        {stat.value}
                      </div>
                      <div className="text-xs text-[var(--color-text-muted)]">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tip */}
              {step.tip && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Pro Tip</span>
                    <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                      {step.tip}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Footer Navigation */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-bg-hover)]"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* Step Dots */}
            <div className="flex items-center gap-1.5">
              {demoSteps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentStep(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentStep
                      ? 'w-6 bg-[var(--color-turquoise-500)]'
                      : i < currentStep
                      ? 'bg-[var(--color-turquoise-500)]/50'
                      : 'bg-[var(--color-bg-tertiary)]'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={nextStep}
              className="flex items-center gap-2 px-5 py-2 rounded-lg font-medium text-sm bg-gradient-to-r from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white hover:opacity-90 transition-opacity"
            >
              {currentStep === demoSteps.length - 1 ? (
                <>
                  Get Started
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Hook for demo state management
export function useDemoTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeenDemo, setHasSeenDemo] = useState(true); // Default true to prevent flash

  useEffect(() => {
    const seen = localStorage.getItem('hasSeenDemo');
    if (!seen) {
      setHasSeenDemo(false);
      // Small delay to let the page load first
      setTimeout(() => setIsOpen(true), 1500);
    }
  }, []);

  const openDemo = () => setIsOpen(true);

  const closeDemo = () => {
    setIsOpen(false);
  };

  const completeDemo = () => {
    localStorage.setItem('hasSeenDemo', 'true');
    setHasSeenDemo(true);
    setIsOpen(false);
  };

  const resetDemo = () => {
    localStorage.removeItem('hasSeenDemo');
    setHasSeenDemo(false);
  };

  return {
    isOpen,
    hasSeenDemo,
    openDemo,
    closeDemo,
    completeDemo,
    resetDemo,
  };
}
