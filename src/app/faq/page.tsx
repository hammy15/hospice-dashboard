'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HelpCircle, ChevronDown, Search, Star, Activity, Target,
  Shield, Calculator, Building2, Map, FileText, TrendingUp,
  Users, DollarSign, Database, MessageSquare, Zap, CheckCircle
} from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Platform Basics
  {
    category: 'Platform Basics',
    question: 'What is My5StarReport and who is it for?',
    answer: 'My5StarReport is an M&A intelligence platform designed for healthcare investors, particularly those focused on hospice acquisitions. It provides comprehensive data on 4,800+ hospice providers across the US, including quality metrics, compliance data, financials, and market demographics to help identify and evaluate acquisition targets.'
  },
  {
    category: 'Platform Basics',
    question: 'Where does the data come from?',
    answer: 'Our data is sourced from multiple official channels: CMS Provider of Services files, CMS Quality Measure data, HCRIS (Healthcare Cost Report Information System) for financials, Census Bureau for demographics, and NPI Registry for provider details. Data is updated quarterly to reflect the latest CMS releases.'
  },
  {
    category: 'Platform Basics',
    question: 'What do GREEN, YELLOW, and RED classifications mean?',
    answer: 'GREEN targets are acquisition-ready with strong scores across quality, compliance, and operations. YELLOW targets have potential but may have minor issues requiring due diligence. RED targets have significant concerns (compliance issues, poor quality scores, or operational challenges) and should typically be avoided or require major remediation.'
  },
  {
    category: 'Platform Basics',
    question: 'What is ADC and why is it important?',
    answer: 'ADC (Average Daily Census) represents the average number of patients served per day. It\'s a key metric for valuing hospice agencies. ADC 20-60 is often the "sweet spot" for tuck-in acquisitions — large enough to be operationally viable but small enough for integration. ADC 60+ typically indicates platform acquisition candidates.'
  },

  // Quality Measures
  {
    category: 'Quality Measures',
    question: 'What are CMS Quality Measures (QMs)?',
    answer: 'CMS Quality Measures are standardized metrics used to evaluate the quality of care in nursing homes. There are 13 key measures: 8 Long-Stay measures (for residents staying 100+ days) and 5 Short-Stay measures (for residents with stays under 100 days). These measures track things like falls, pressure ulcers, UTIs, and functional outcomes.'
  },
  {
    category: 'Quality Measures',
    question: 'How are Quality Measure star ratings calculated?',
    answer: 'CMS assigns 1-5 stars based on performance percentiles. Each QM has specific thresholds: 5 stars = top 10% performers, 4 stars = 10-30th percentile, 3 stars = 30-70th percentile, 2 stars = 70-90th percentile, 1 star = bottom 10%. The overall QM star rating is a weighted average of all 13 measures.'
  },
  {
    category: 'Quality Measures',
    question: 'What is the QM What-If Simulator?',
    answer: 'The What-If Simulator lets you model potential QM improvements and see the projected impact on star ratings in real-time. Adjust sliders for each measure to see how reducing falls, UTIs, or other metrics would affect your overall rating. This helps prioritize improvement initiatives.'
  },
  {
    category: 'Quality Measures',
    question: 'How can I improve specific Quality Measures?',
    answer: 'Our Quality Measures page provides specific, actionable improvement plans for each QM. For example, to reduce falls: implement hourly rounding, install bed/chair sensors, review medications for fall-risk drugs, ensure proper lighting, and use non-slip footwear. Each measure has 5 concrete action steps tailored to that specific metric.'
  },
  {
    category: 'Quality Measures',
    question: 'What are the most impactful QMs to focus on?',
    answer: 'High-impact measures include: Long-Stay Falls with Major Injury (weight: 3.0), Long-Stay Pressure Ulcers (weight: 2.5), Short-Stay Pressure Ulcers (weight: 2.5), and Long-Stay UTIs (weight: 2.0). Improving these "high-weight" measures will have the greatest impact on your overall star rating.'
  },

  // Star Ratings
  {
    category: 'Star Ratings',
    question: 'What factors determine the overall CMS 5-Star Rating?',
    answer: 'The overall 5-Star Rating combines three components: Health Inspections (most heavily weighted), Quality Measures (13 QMs as described above), and Staffing levels. Each component can earn 1-5 stars, and they\'re combined using a CMS algorithm to produce the overall rating.'
  },
  {
    category: 'Star Ratings',
    question: 'What is a CAHPS star rating?',
    answer: 'CAHPS (Consumer Assessment of Healthcare Providers and Systems) measures patient/family satisfaction through surveys. It captures experiences with care quality, communication, and overall recommendation likelihood. High CAHPS scores indicate strong patient satisfaction and are increasingly important for referral relationships.'
  },
  {
    category: 'Star Ratings',
    question: 'Why are star ratings important for M&A?',
    answer: 'Star ratings directly impact referral volume, reimbursement rates, and reputation. Higher-rated facilities command premium valuations (1.2-1.5x revenue multiple for 4-5 stars vs. 0.8-1.0x for 1-2 stars). They also have lower regulatory risk and stronger referral relationships, making them more attractive acquisition targets.'
  },

  // Valuation & Deals
  {
    category: 'Valuation & Deals',
    question: 'How are hospice agencies typically valued?',
    answer: 'Hospice valuations commonly use: Revenue Multiple (1.0-1.5x annual revenue), EBITDA Multiple (4-6x EBITDA), or ADC Multiple ($15,000-$25,000 per ADC). Premium multiples apply to agencies with high star ratings, strong compliance records, and favorable demographics. Our Valuation Calculator helps model different scenarios.'
  },
  {
    category: 'Valuation & Deals',
    question: 'What is Owner Carry-Back financing?',
    answer: 'Owner Carry-Back (seller financing) is when the seller agrees to finance part of the purchase price. This is common in hospice M&A, especially with independent operators looking for liquidity events. Our algorithm identifies targets most likely to accept 10-20% seller notes based on ownership structure, size, and other factors.'
  },
  {
    category: 'Valuation & Deals',
    question: 'What is a CON state and why does it matter?',
    answer: 'CON (Certificate of Need) states require regulatory approval to open new hospice agencies, creating barriers to entry. This protects existing operators from new competition. CON states (like WA, OR, MT) often command premium valuations because the regulatory moat provides more predictable market share.'
  },

  // Using the Platform
  {
    category: 'Using the Platform',
    question: 'How do I find the best acquisition targets?',
    answer: 'Start with the Top 10 page for our algorithm\'s best picks. Use Advanced Search to filter by state, ADC range, classification, ownership type, and CON status. The Map view helps visualize geographic opportunities. Check Owner Carry-Back page for targets likely to accept seller financing.'
  },
  {
    category: 'Using the Platform',
    question: 'How do I track deals in progress?',
    answer: 'Use the Deal Pipeline to track opportunities through stages: Lead → Qualified → LOI → Due Diligence → Closed. Add providers from any page, attach notes, set estimated values, and monitor progress. The Contacts CRM tracks relationships with owners, administrators, and brokers.'
  },
  {
    category: 'Using the Platform',
    question: 'Can I export data for my team?',
    answer: 'Yes! The Export page lets you download data as CSV or Excel. Choose from 50+ fields including scores, financials, demographics, and contact info. Apply filters before exporting to get exactly the data you need for investment committee presentations or due diligence.'
  },
  {
    category: 'Using the Platform',
    question: 'What reports can I generate?',
    answer: 'The Reports page generates comprehensive PDF reports for any provider, including all scores, financials, ownership details, competitive landscape, and market demographics. Perfect for investment committee presentations, due diligence packages, or internal analysis.'
  },

  // Phill AI Assistant
  {
    category: 'Phill AI Assistant',
    question: 'Who is Phill?',
    answer: 'Phill is our AI-powered assistant specialized in hospice quality measures, star ratings, and M&A strategy. Unlike generic chatbots, Phill understands CMS regulations, QM thresholds, and operational best practices. Ask Phill specific questions about improving star ratings or evaluating acquisition targets.'
  },
  {
    category: 'Phill AI Assistant',
    question: 'What can I ask Phill?',
    answer: 'Phill can answer questions about: specific QM improvement strategies, star rating calculation methodology, what drives certain metrics, how to interpret provider data, M&A best practices, CON regulations, valuation approaches, and more. Phill provides specific, actionable guidance rather than generic advice.'
  },
  {
    category: 'Phill AI Assistant',
    question: 'Is Phill\'s advice reliable?',
    answer: 'Phill is trained on CMS guidelines, industry best practices, and operational expertise. However, always verify recommendations with your compliance and clinical teams. Phill provides guidance and suggestions, but human expertise should validate any operational or clinical decisions.'
  },
];

const categories = [
  { id: 'all', label: 'All Questions', icon: HelpCircle },
  { id: 'Platform Basics', label: 'Platform Basics', icon: Database },
  { id: 'Quality Measures', label: 'Quality Measures', icon: Activity },
  { id: 'Star Ratings', label: 'Star Ratings', icon: Star },
  { id: 'Valuation & Deals', label: 'Valuation & Deals', icon: DollarSign },
  { id: 'Using the Platform', label: 'Using the Platform', icon: Zap },
  { id: 'Phill AI Assistant', label: 'Phill AI', icon: MessageSquare },
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  const expandAll = () => {
    setExpandedQuestions(new Set(filteredFAQs.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedQuestions(new Set());
  };

  return (
    <div className="max-w-5xl mx-auto px-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-[var(--color-turquoise-500)]/20">
            <HelpCircle className="w-6 h-6 text-[var(--color-turquoise-500)]" />
          </div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
            Frequently Asked Questions
          </h1>
        </div>
        <p className="text-[var(--color-text-secondary)]">
          Find answers to common questions about My5StarReport, quality measures, star ratings, and more.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:ring-1 focus:ring-[var(--color-turquoise-500)] transition-colors"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[var(--color-turquoise-500)] text-white'
                  : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-[var(--color-text-muted)]">
          {filteredFAQs.length} question{filteredFAQs.length !== 1 ? 's' : ''}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={expandAll}
            className="text-sm text-[var(--color-turquoise-500)] hover:underline"
          >
            Expand All
          </button>
          <span className="text-[var(--color-text-muted)]">|</span>
          <button
            onClick={collapseAll}
            className="text-sm text-[var(--color-turquoise-500)] hover:underline"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* FAQ List */}
      <div className="space-y-3">
        {filteredFAQs.map((faq, index) => {
          const isExpanded = expandedQuestions.has(index);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="glass-card rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xs px-2 py-1 rounded-lg bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)] whitespace-nowrap">
                    {faq.category}
                  </span>
                  <h3 className="font-medium">{faq.question}</h3>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-[var(--color-text-muted)] transition-transform flex-shrink-0 ml-4 ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-5 pt-0">
                      <div className="p-4 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* No Results */}
      {filteredFAQs.length === 0 && (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-[var(--color-text-muted)] opacity-50" />
          <p className="text-[var(--color-text-muted)]">No questions match your search.</p>
          <button
            onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
            className="mt-4 text-[var(--color-turquoise-500)] hover:underline"
          >
            Clear filters
          </button>
        </div>
      )}

      {/* Still Need Help */}
      <div className="mt-12 p-6 rounded-2xl bg-gradient-to-br from-[var(--color-turquoise-500)]/10 to-[var(--color-turquoise-600)]/5 border border-[var(--color-turquoise-500)]/20">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-[var(--color-turquoise-500)]/20">
            <MessageSquare className="w-6 h-6 text-[var(--color-turquoise-500)]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Still have questions?</h3>
            <p className="text-[var(--color-text-secondary)] mb-4">
              Ask Phill, our AI assistant! Phill can provide specific guidance on quality measures,
              star ratings, and help you navigate the platform.
            </p>
            <p className="text-sm text-[var(--color-text-muted)]">
              Look for the chat icon in the bottom-right corner of any page.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/quality-measures"
          className="p-4 rounded-xl glass-card hover:border-[var(--color-turquoise-500)]/30 transition-colors group"
        >
          <Activity className="w-5 h-5 text-[var(--color-turquoise-500)] mb-2" />
          <h4 className="font-medium group-hover:text-[var(--color-turquoise-500)] transition-colors">
            Quality Measures
          </h4>
          <p className="text-sm text-[var(--color-text-muted)]">
            Drill into QMs and get action plans
          </p>
        </Link>
        <Link
          href="/valuation"
          className="p-4 rounded-xl glass-card hover:border-[var(--color-turquoise-500)]/30 transition-colors group"
        >
          <Calculator className="w-5 h-5 text-[var(--color-turquoise-500)] mb-2" />
          <h4 className="font-medium group-hover:text-[var(--color-turquoise-500)] transition-colors">
            Valuation Calculator
          </h4>
          <p className="text-sm text-[var(--color-text-muted)]">
            Model deal scenarios and multiples
          </p>
        </Link>
        <Link
          href="/top-10"
          className="p-4 rounded-xl glass-card hover:border-[var(--color-turquoise-500)]/30 transition-colors group"
        >
          <Target className="w-5 h-5 text-[var(--color-turquoise-500)] mb-2" />
          <h4 className="font-medium group-hover:text-[var(--color-turquoise-500)] transition-colors">
            Top 10 Opportunities
          </h4>
          <p className="text-sm text-[var(--color-text-muted)]">
            See our best acquisition targets
          </p>
        </Link>
      </div>
    </div>
  );
}
