'use client';

import { motion } from 'framer-motion';
import { Target, AlertTriangle, XCircle, Building2, Shield, TrendingUp, MapPin } from 'lucide-react';

const iconMap = {
  target: Target,
  'alert-triangle': AlertTriangle,
  'x-circle': XCircle,
  building: Building2,
  shield: Shield,
  'trending-up': TrendingUp,
  'map-pin': MapPin,
};

type IconName = keyof typeof iconMap;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: IconName;
  variant?: 'default' | 'green' | 'yellow' | 'red';
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon, variant = 'default', delay = 0 }: StatCardProps) {
  const Icon = iconMap[icon];
  const variantStyles = {
    default: {
      iconBg: 'bg-[var(--color-turquoise-500)]/10',
      iconColor: 'text-[var(--color-turquoise-400)]',
      glow: 'rgba(0, 229, 199, 0.15)',
    },
    green: {
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
      glow: 'rgba(16, 185, 129, 0.15)',
    },
    yellow: {
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-400',
      glow: 'rgba(245, 158, 11, 0.15)',
    },
    red: {
      iconBg: 'bg-red-500/10',
      iconColor: 'text-red-400',
      glow: 'rgba(239, 68, 68, 0.15)',
    },
  };

  const styles = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="glass-card glass-card-hover rounded-2xl p-6 transition-all duration-300"
      style={{ boxShadow: `0 0 40px ${styles.glow}` }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--color-text-muted)] text-sm font-medium uppercase tracking-wider mb-1">
            {title}
          </p>
          <p className="text-4xl font-bold font-[family-name:var(--font-display)] tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-[var(--color-text-secondary)] text-sm mt-2">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`${styles.iconBg} p-3 rounded-xl`}>
          <Icon className={`w-6 h-6 ${styles.iconColor}`} />
        </div>
      </div>
    </motion.div>
  );
}
