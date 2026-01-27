'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { LayoutDashboard, Target, MapPin, List, Database, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/targets', label: 'All Targets', icon: List },
  { href: '/green', label: 'GREEN', icon: Target },
  { href: '/washington', label: 'Washington', icon: MapPin },
];

export function Navigation() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

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
                      ? 'text-[var(--color-turquoise-600)]'
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
