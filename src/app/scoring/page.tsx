'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  Sliders,
  Save,
  RotateCcw,
  Loader2,
  TrendingUp,
  MapPin,
  Building2,
  Users,
  DollarSign,
  Target,
  ChevronRight,
} from 'lucide-react';
import { ClassificationBadge } from '@/components/ClassificationBadge';

interface ScoredProvider {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  estimated_adc: number;
  overall_score: number;
  classification: string;
  con_state: boolean;
  pe_backed: boolean;
  custom_score: number;
  score_breakdown: {
    adc: number;
    quality: number;
    market: number;
    financial: number;
    ownership: number;
    demographics: number;
  };
}

const DEFAULT_WEIGHTS = {
  adc_weight: 25,
  quality_weight: 20,
  market_weight: 20,
  financial_weight: 15,
  ownership_weight: 10,
  demographics_weight: 10,
};

const weightLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  adc_weight: { label: 'ADC (Size)', icon: Target, color: 'text-emerald-400' },
  quality_weight: { label: 'Quality Score', icon: TrendingUp, color: 'text-blue-400' },
  market_weight: { label: 'Market (CON)', icon: MapPin, color: 'text-purple-400' },
  financial_weight: { label: 'Financials', icon: DollarSign, color: 'text-amber-400' },
  ownership_weight: { label: 'Ownership', icon: Building2, color: 'text-cyan-400' },
  demographics_weight: { label: 'Demographics', icon: Users, color: 'text-pink-400' },
};

export default function ScoringPage() {
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [providers, setProviders] = useState<ScoredProvider[]>([]);
  const [loading, setLoading] = useState(false);
  const [stateFilter, setStateFilter] = useState('');
  const [conOnly, setConOnly] = useState(false);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);

  const calculateScores = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/scoring', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weights,
          filters: { state: stateFilter || undefined, conOnly },
        }),
      });
      const data = await res.json();
      setProviders(data.providers || []);
    } catch (error) {
      console.error('Scoring error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateScores();
  }, []);

  const handleWeightChange = (key: string, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const resetWeights = () => {
    setWeights(DEFAULT_WEIGHTS);
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          <span className="gradient-text">Custom Scoring</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Adjust scoring weights to prioritize what matters most to your acquisition strategy
        </p>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Weight Controls */}
        <div className="col-span-4">
          <div className="glass-card rounded-xl p-6 sticky top-24">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[var(--color-turquoise-400)]" />
                <span className="font-semibold">Scoring Weights</span>
              </div>
              <span className={`text-sm font-mono ${totalWeight === 100 ? 'text-emerald-400' : 'text-red-400'}`}>
                {totalWeight}%
              </span>
            </div>

            <div className="space-y-5">
              {Object.entries(weightLabels).map(([key, { label, icon: Icon, color }]) => (
                <div key={key}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${color}`} />
                      <span className="text-sm">{label}</span>
                    </div>
                    <span className="text-sm font-mono">{weights[key as keyof typeof weights]}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={weights[key as keyof typeof weights]}
                    onChange={(e) => handleWeightChange(key, parseInt(e.target.value))}
                    className="w-full h-2 bg-[var(--color-bg-tertiary)] rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[var(--color-turquoise-400)]
                      [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
                  />
                </div>
              ))}
            </div>

            {totalWeight !== 100 && (
              <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                Weights must sum to 100% (currently {totalWeight}%)
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">Filter by State</label>
                  <input
                    type="text"
                    placeholder="e.g., WA, CA, TX"
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-tertiary)] border border-[var(--color-border)] text-sm"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conOnly}
                    onChange={(e) => setConOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)]"
                  />
                  <span className="text-sm">CON States Only</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={resetWeights}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={calculateScores}
                disabled={totalWeight !== 100 || loading}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)] text-white hover:bg-[var(--color-turquoise-600)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Apply
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="col-span-8">
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
              <span className="font-semibold">Top Targets by Custom Score</span>
              <span className="text-sm text-[var(--color-text-muted)]">{providers.length} providers</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)]">
                {providers.slice(0, 25).map((provider, idx) => (
                  <motion.div
                    key={provider.ccn}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="px-6 py-4 hover:bg-[var(--color-bg-hover)] transition-colors"
                  >
                    <Link href={`/provider/${provider.ccn}`} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-mono text-[var(--color-turquoise-400)]">
                            #{idx + 1}
                          </span>
                          <span className="font-semibold">{provider.provider_name}</span>
                          <ClassificationBadge classification={provider.classification as 'GREEN' | 'YELLOW' | 'RED'} size="sm" />
                          {provider.con_state && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">CON</span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-[var(--color-text-muted)]">
                          <span>{provider.city}, {provider.state}</span>
                          <span>ADC: {provider.estimated_adc || '—'}</span>
                          <span>Original: {Number(provider.overall_score)?.toFixed(1) || '—'}</span>
                        </div>

                        {/* Score Breakdown */}
                        <div className="flex items-center gap-1 mt-2">
                          {Object.entries(provider.score_breakdown).map(([key, value]) => {
                            const config = weightLabels[`${key}_weight`];
                            if (!config) return null;
                            return (
                              <div
                                key={key}
                                className="h-1.5 rounded-full"
                                style={{
                                  width: `${value}%`,
                                  backgroundColor: `var(--color-${key === 'adc' ? 'emerald' : key === 'quality' ? 'blue' : key === 'market' ? 'purple' : key === 'financial' ? 'amber' : key === 'ownership' ? 'cyan' : 'pink'}-400)`,
                                  opacity: 0.7,
                                }}
                                title={`${config.label}: ${value.toFixed(1)}`}
                              />
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[var(--color-turquoise-400)]">
                            {provider.custom_score.toFixed(1)}
                          </div>
                          <div className="text-xs text-[var(--color-text-muted)]">Custom Score</div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-[var(--color-text-muted)]" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
