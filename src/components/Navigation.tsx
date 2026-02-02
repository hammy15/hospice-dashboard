'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Target, MapPin, List, Database, Sun, Moon, Star,
  ChevronDown, Flame, TrendingUp, Map, Search, Trophy, BarChart3,
  Building2, Sliders, Mail, User, Briefcase, Users, Calculator,
  GitCompare, PieChart, Download, Shield, FileText, Play, DollarSign,
  Activity, HelpCircle, Menu, X
} from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useAuth } from './AuthProvider';
import { useDemo } from './AppShell';
import { useState, useRef, useEffect } from 'react';

const hotMarkets = [
  { state: 'WA', label: 'Washington', conState: true },
  { state: 'OR', label: 'Oregon', conState: true },
  { state: 'CA', label: 'California', conState: false },
  { state: 'MT', label: 'Montana', conState: true },
  { state: 'NV', label: 'Nevada', conState: false },
];

// Main nav items - only 4 most important
const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/targets', label: 'Targets', icon: List },
];

// Items that go in the hamburger menu
const moreNavItems = [
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/top-10', label: 'Top 10', icon: Trophy },
];

// Reorganized tools in workflow order:
// Deal workflow → Analysis tools → Research tools → Export
const toolsItems = [
  // Deal Workflow
  { href: '/deals', label: 'Deal Pipeline', icon: Briefcase, section: 'workflow' },
  { href: '/contacts', label: 'Contacts CRM', icon: Users, section: 'workflow' },
  { href: '/outreach', label: 'Outreach', icon: Mail, section: 'workflow' },
  // Analysis Tools
  { href: '/valuation', label: 'Valuation', icon: Calculator, section: 'analysis' },
  { href: '/compare', label: 'Compare', icon: GitCompare, section: 'analysis' },
  { href: '/reports', label: 'Reports', icon: FileText, section: 'analysis' },
  { href: '/quality-measures', label: 'Quality Measures', icon: Activity, section: 'analysis' },
  // Opportunity Finders
  { href: '/owner-carryback', label: 'Owner Carry-Back', icon: DollarSign, section: 'opportunities' },
  { href: '/scoring', label: 'Custom Scoring', icon: Sliders, section: 'opportunities' },
  // Market Research
  { href: '/consolidation', label: 'Consolidation', icon: PieChart, section: 'research' },
  { href: '/compliance', label: 'Compliance', icon: Shield, section: 'research' },
  { href: '/competitors', label: 'Competitors', icon: Building2, section: 'research' },
  // Export
  { href: '/export', label: 'Export', icon: Download, section: 'export' },
  // Help
  { href: '/learn', label: 'Knowledge Base', icon: Activity, section: 'help' },
  { href: '/faq', label: 'FAQ & Help', icon: HelpCircle, section: 'help' },
];

const toolsSections = [
  { key: 'workflow', label: 'Deal Workflow' },
  { key: 'analysis', label: 'Analysis' },
  { key: 'opportunities', label: 'Opportunities' },
  { key: 'research', label: 'Research' },
  { key: 'export', label: 'Data' },
  { key: 'help', label: 'Help' },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { openDemo } = useDemo();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHotMarketActive = pathname.startsWith('/market/');
  const isToolsActive = toolsItems.some(item => pathname === item.href);
  const isMoreNavActive = moreNavItems.some(item => pathname === item.href) || isHotMarketActive || isToolsActive;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo - fixed width to prevent squishing */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center shadow-lg shadow-[var(--color-turquoise-500)]/30">
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="font-[family-name:var(--font-display)] font-bold text-lg leading-tight whitespace-nowrap">
                Hospice Tracker
              </h1>
              <p className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">M&A Intelligence Platform</p>
            </div>
          </Link>

          {/* Main Navigation - 4 primary tabs */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-3 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-[var(--color-turquoise-500)]/10 rounded-lg border border-[var(--color-turquoise-500)]/30"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}

            {/* Hamburger Menu - contains all other items */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className={`relative px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  isMoreNavActive
                    ? 'text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                {isMoreNavActive && (
                  <motion.div
                    layoutId="nav-indicator-menu"
                    className="absolute inset-0 bg-[var(--color-turquoise-500)]/10 rounded-lg border border-[var(--color-turquoise-500)]/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 right-0 w-72 glass-card rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden max-h-[80vh] overflow-y-auto"
                  >
                    <div className="p-2">
                      {/* More Navigation Items */}
                      <div className="mb-3">
                        <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                          Navigation
                        </div>
                        {moreNavItems.map((item) => {
                          const isActive = pathname === item.href;
                          const Icon = item.icon;
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMenuOpen(false)}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                                  : 'hover:bg-[var(--color-bg-hover)]'
                              }`}
                            >
                              <Icon className="w-4 h-4" />
                              <span className="font-medium text-sm">{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Hot Markets Section */}
                      <div className="mb-3 border-t border-[var(--color-border)] pt-2">
                        <div className="px-3 py-1.5 flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider flex items-center gap-1.5">
                            <Flame className="w-3 h-3 text-orange-500" />
                            Hot Markets
                          </span>
                          <div className="flex items-center gap-2 text-[9px]">
                            <span className="text-emerald-400">G=GREEN</span>
                            <span className="text-amber-400">Y=YELLOW</span>
                          </div>
                        </div>
                        {hotMarkets.map((market) => {
                          const isActive = pathname === `/market/${market.state.toLowerCase()}`;
                          return (
                            <Link
                              key={market.state}
                              href={`/market/${market.state.toLowerCase()}`}
                              onClick={() => setMenuOpen(false)}
                              className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                                  : 'hover:bg-[var(--color-bg-hover)]'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span className="font-medium text-sm">{market.label}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                {market.conState && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                                    CON
                                  </span>
                                )}
                                <TrendingUp className="w-3 h-3 text-orange-400" />
                              </div>
                            </Link>
                          );
                        })}
                      </div>

                      {/* Tools Sections */}
                      {toolsSections.map((section) => {
                        const sectionItems = toolsItems.filter(item => item.section === section.key);
                        if (sectionItems.length === 0) return null;

                        return (
                          <div key={section.key} className="mb-2 border-t border-[var(--color-border)] pt-2">
                            <div className="px-3 py-1.5 text-[10px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                              {section.label}
                            </div>
                            {sectionItems.map((item) => {
                              const isActive = pathname === item.href;
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMenuOpen(false)}
                                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                                    isActive
                                      ? 'bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                                      : 'hover:bg-[var(--color-bg-hover)]'
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Demo Button - hidden on small screens */}
            <button
              onClick={openDemo}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-400 hover:from-purple-500/20 hover:to-pink-500/20 transition-all border border-purple-500/20"
              title="Watch Platform Demo"
            >
              <Play className="w-3.5 h-3.5" />
              Demo
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-all duration-200 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>

            <Link
              href="/account"
              className={`p-2 rounded-lg transition-all duration-200 ${
                pathname === '/account'
                  ? 'bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-400)]'
                  : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
              title={user ? user.email : 'Sign In'}
            >
              {user ? (
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center text-white text-xs font-bold">
                  {user.name?.[0] || user.email[0].toUpperCase()}
                </div>
              ) : (
                <User className="w-5 h-5" />
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
