'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Target, Shield, TrendingUp, MapPin, DollarSign, Users,
  CheckCircle, ArrowRight, BarChart3, Building2, Zap, Star,
  Play, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: Target,
    title: 'Acquisition Targets',
    description: 'AI-powered scoring identifies GREEN, YELLOW, and RED acquisition targets across 5,000+ hospice providers.',
  },
  {
    icon: Shield,
    title: 'CON Protection Analysis',
    description: 'Track Certificate of Need protected markets for premium valuation opportunities.',
  },
  {
    icon: DollarSign,
    title: 'Valuation Tools',
    description: 'Model deal structures with industry multiples, seller financing, and comparable transactions.',
  },
  {
    icon: MapPin,
    title: 'Market Intelligence',
    description: 'Interactive maps with demographic data, competitive density, and market penetration analysis.',
  },
  {
    icon: Users,
    title: 'Owner Carry-Back Finder',
    description: 'Identify endemic companies most likely to accept seller financing structures.',
  },
  {
    icon: BarChart3,
    title: 'Deal Pipeline CRM',
    description: 'Track prospects through your acquisition funnel from outreach to close.',
  },
];

const stats = [
  { value: '5,200+', label: 'Hospice Providers' },
  { value: '50', label: 'States Covered' },
  { value: '342', label: 'GREEN Targets' },
  { value: '$2.1B', label: 'Market Opportunity' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,184,166,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Star className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">My5StarReport</span>
            </div>
            <div className="flex items-center gap-6">
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors hidden sm:block">Features</Link>
              <Link href="#pricing" className="text-gray-400 hover:text-white transition-colors hidden sm:block">Pricing</Link>
              <Link href="/" className="px-5 py-2 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors">
                Go to Dashboard
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm mb-8">
              <Zap className="w-4 h-4" />
              M&A Intelligence for Hospice Acquisitions
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Find Your Next{' '}
              <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                5-Star
              </span>{' '}
              Acquisition
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
              The most comprehensive hospice M&A intelligence platform.
              Identify targets, analyze markets, and close deals faster with AI-powered insights.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/account"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
              >
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Explore Dashboard
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-500">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-[#0d0d12]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need for Hospice M&A
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Purpose-built tools for healthcare private equity and strategic acquirers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-teal-500/30 transition-colors group"
              >
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-white mb-4">
              Powerful Command Center
            </h2>
            <p className="text-xl text-gray-400">
              See everything at a glance with our intelligence dashboard
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-1">
            <div className="rounded-xl overflow-hidden bg-[#0a0a0f]">
              <div className="aspect-video bg-gradient-to-br from-teal-900/20 to-purple-900/20 flex items-center justify-center">
                <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-teal-500 text-white font-medium hover:bg-teal-600 transition-colors">
                  <Play className="w-5 h-5" />
                  Explore Live Demo
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-[#0d0d12]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-400">
              Start free, upgrade when you're ready
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Tier */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Starter</h3>
              <div className="text-4xl font-bold text-white mb-1">Free</div>
              <p className="text-gray-500 mb-6">Forever</p>
              <ul className="space-y-3 mb-8">
                {['Basic provider search', 'Top 10 targets view', '5 provider profiles/day', 'Market overview'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/account" className="block w-full py-3 rounded-lg border border-white/20 text-white font-medium text-center hover:bg-white/5 transition-colors">
                Get Started
              </Link>
            </div>

            {/* Pro Tier */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-teal-500/20 to-transparent border border-teal-500/30 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-teal-500 text-white text-sm font-medium">
                Most Popular
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Professional</h3>
              <div className="text-4xl font-bold text-white mb-1">$299<span className="text-lg text-gray-400">/mo</span></div>
              <p className="text-gray-500 mb-6">Per user</p>
              <ul className="space-y-3 mb-8">
                {['Unlimited provider access', 'Full scoring & analytics', 'Deal pipeline CRM', 'Valuation calculator', 'Owner carry-back analysis', 'Export to Excel/PDF', 'API access (5K req/mo)'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-300">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/account" className="block w-full py-3 rounded-lg bg-teal-500 text-white font-medium text-center hover:bg-teal-600 transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-bold text-white mb-1">Custom</div>
              <p className="text-gray-500 mb-6">Contact us</p>
              <ul className="space-y-3 mb-8">
                {['Everything in Pro', 'Unlimited API access', 'Custom integrations', 'Dedicated support', 'Data enrichment', 'White-label options'].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-gray-400">
                    <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a href="mailto:sales@my5starreport.com" className="block w-full py-3 rounded-lg border border-white/20 text-white font-medium text-center hover:bg-white/5 transition-colors">
                Contact Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Next Acquisition?
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Join leading healthcare investors using My5StarReport to source and evaluate hospice targets.
          </p>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-lg hover:from-teal-600 hover:to-emerald-600 transition-all shadow-lg shadow-teal-500/25"
          >
            Start Your Free Trial
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                <Star className="w-5 h-5 text-white" />
              </div>
              <span className="text-white font-semibold">My5StarReport</span>
            </div>
            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <span>© 2024 My5StarReport. All rights reserved.</span>
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
