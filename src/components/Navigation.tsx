'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Target, MapPin, List, Database, Sun, Moon, Star, ChevronDown, Flame, TrendingUp, Map, Search } from 'lucide-react';
import { useTheme } from './ThemeProvider';
import { useState, useRef, useEffect } from 'react';

const hotMarkets = [
  { state: 'WA', label: 'Washington', conState: true },
  { state: 'OR', label: 'Oregon', conState: true },
  { state: 'CA', label: 'California', conState: false },
  { state: 'MT', label: 'Montana', conState: true },
  { state: 'NV', label: 'Nevada', conState: false },
];

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/targets', label: 'All Targets', icon: List },
  { href: '/green', label: 'GREEN', icon: Target },
  { href: '/map', label: 'Map', icon: Map },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/watchlist', label: 'Watchlist', icon: Star },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [hotMarketsOpen, setHotMarketsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setHotMarketsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isHotMarketActive = pathname.startsWith('/market/');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-[var(--color-border)]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center glow-turquoise">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-[family-name:var(--font-display)] font-bold text-lg leading-tight">
                Hospice Intel
              </h1>
              <p className="text-xs text-[var(--color-text-muted)]">Acquisition Engine</p>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                      : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
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

            {/* Hot Markets Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setHotMarketsOpen(!hotMarketsOpen)}
                className={`relative px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  isHotMarketActive
                    ? 'text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                <Flame className="w-4 h-4 text-orange-500" />
                Hot Markets
                <ChevronDown className={`w-3 h-3 transition-transform ${hotMarketsOpen ? 'rotate-180' : ''}`} />
                {isHotMarketActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 bg-[var(--color-turquoise-500)]/10 rounded-lg border border-[var(--color-turquoise-500)]/30"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {hotMarketsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full mt-2 right-0 w-56 glass-card rounded-xl border border-[var(--color-border)] shadow-xl overflow-hidden"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                        Priority Markets
                      </div>
                      {hotMarkets.map((market) => {
                        const isActive = pathname === `/market/${market.state.toLowerCase()}`;
                        return (
                          <Link
                            key={market.state}
                            href={`/market/${market.state.toLowerCase()}`}
                            onClick={() => setHotMarketsOpen(false)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-700)] dark:text-[var(--color-turquoise-300)]'
                                : 'hover:bg-[var(--color-bg-hover)]'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span className="font-medium">{market.label}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              {market.conState && (
                                <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-medium">
                                  CON
                                </span>
                              )}
                              <TrendingUp className="w-3.5 h-3.5 text-orange-400" />
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                    <div className="border-t border-[var(--color-border)] p-2">
                      <Link
                        href="/targets"
                        onClick={() => setHotMarketsOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--color-bg-hover)] text-sm text-[var(--color-text-secondary)]"
                      >
                        <List className="w-4 h-4" />
                        View All States →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="ml-4 pl-4 border-l border-[var(--color-border)]">
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
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
