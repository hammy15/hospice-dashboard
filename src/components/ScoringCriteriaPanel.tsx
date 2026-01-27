'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sliders, RotateCcw, Save, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

interface ScoringCriteria {
  // ADC thresholds
  adcMax: number;
  adcIdeal: number;

  // Score thresholds for GREEN
  minQualityScore: number;
  minComplianceScore: number;
  minOperationalScore: number;
  minMarketScore: number;
  minOverallScore: number;

  // Weight adjustments (0-100)
  qualityWeight: number;
  complianceWeight: number;
  operationalWeight: number;
  marketWeight: number;

  // Classification modifiers
  conStateBonus: number;
  peBakedPenalty: number;
  chainPenalty: number;
  ownershipComplexityPenalty: number;
}

interface ImpactPreview {
  greenCount: number;
  yellowCount: number;
  redCount: number;
  greenChange: number;
  yellowChange: number;
  redChange: number;
}

const DEFAULT_CRITERIA: ScoringCriteria = {
  adcMax: 60,
  adcIdeal: 30,
  minQualityScore: 70,
  minComplianceScore: 70,
  minOperationalScore: 50,
  minMarketScore: 50,
  minOverallScore: 65,
  qualityWeight: 30,
  complianceWeight: 30,
  operationalWeight: 20,
  marketWeight: 20,
  conStateBonus: 10,
  peBakedPenalty: 15,
  chainPenalty: 5,
  ownershipComplexityPenalty: 10,
};

interface ScoringCriteriaPanelProps {
  onCriteriaChange?: (criteria: ScoringCriteria) => void;
}

export function ScoringCriteriaPanel({ onCriteriaChange }: ScoringCriteriaPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [criteria, setCriteria] = useState<ScoringCriteria>(DEFAULT_CRITERIA);
  const [preview, setPreview] = useState<ImpactPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>('adc');

  const handleChange = (key: keyof ScoringCriteria, value: number) => {
    setCriteria(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setCriteria(DEFAULT_CRITERIA);
    setPreview(null);
  };

  const fetchPreview = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(criteria).forEach(([key, value]) => {
        params.set(key, String(value));
      });

      const response = await fetch(`/api/scoring-preview?${params}`);
      const data = await response.json();
      setPreview(data);
    } catch (error) {
      console.error('Error fetching preview:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isExpanded) {
      const timeout = setTimeout(fetchPreview, 500);
      return () => clearTimeout(timeout);
    }
  }, [criteria, isExpanded]);

  useEffect(() => {
    onCriteriaChange?.(criteria);
  }, [criteria, onCriteriaChange]);

  const sections = [
    {
      id: 'adc',
      title: 'ADC Thresholds',
      subtitle: 'Average Daily Census filters',
      fields: [
        { key: 'adcMax' as const, label: 'Maximum ADC', min: 20, max: 200, step: 5 },
        { key: 'adcIdeal' as const, label: 'Ideal ADC Target', min: 10, max: 100, step: 5 },
      ],
    },
    {
      id: 'scores',
      title: 'Minimum Score Thresholds',
      subtitle: 'Required scores for GREEN classification',
      fields: [
        { key: 'minQualityScore' as const, label: 'Quality Score', min: 0, max: 100, step: 5 },
        { key: 'minComplianceScore' as const, label: 'Compliance Score', min: 0, max: 100, step: 5 },
        { key: 'minOperationalScore' as const, label: 'Operational Score', min: 0, max: 100, step: 5 },
        { key: 'minMarketScore' as const, label: 'Market Score', min: 0, max: 100, step: 5 },
        { key: 'minOverallScore' as const, label: 'Overall Score', min: 0, max: 100, step: 5 },
      ],
    },
    {
      id: 'weights',
      title: 'Score Weights',
      subtitle: 'Importance of each score category',
      fields: [
        { key: 'qualityWeight' as const, label: 'Quality Weight', min: 0, max: 50, step: 5 },
        { key: 'complianceWeight' as const, label: 'Compliance Weight', min: 0, max: 50, step: 5 },
        { key: 'operationalWeight' as const, label: 'Operational Weight', min: 0, max: 50, step: 5 },
        { key: 'marketWeight' as const, label: 'Market Weight', min: 0, max: 50, step: 5 },
      ],
    },
    {
      id: 'modifiers',
      title: 'Classification Modifiers',
      subtitle: 'Bonuses and penalties applied',
      fields: [
        { key: 'conStateBonus' as const, label: 'CON State Bonus', min: 0, max: 30, step: 1 },
        { key: 'peBakedPenalty' as const, label: 'PE-Backed Penalty', min: 0, max: 30, step: 1 },
        { key: 'chainPenalty' as const, label: 'Chain Affiliation Penalty', min: 0, max: 20, step: 1 },
        { key: 'ownershipComplexityPenalty' as const, label: 'Complex Ownership Penalty', min: 0, max: 20, step: 1 },
      ],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-[var(--color-turquoise-500)]/10">
            <Sliders className="w-6 h-6 text-[var(--color-turquoise-400)]" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">
              Scoring Criteria
            </h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              Adjust weights and thresholds to refine target selection
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {preview && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-emerald-500 font-mono font-semibold">
                {preview.greenCount} GREEN
              </span>
              {preview.greenChange !== 0 && (
                <span className={preview.greenChange > 0 ? 'text-emerald-400' : 'text-red-400'}>
                  ({preview.greenChange > 0 ? '+' : ''}{preview.greenChange})
                </span>
              )}
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-[var(--color-text-muted)]" />
          ) : (
            <ChevronDown className="w-5 h-5 text-[var(--color-text-muted)]" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-6 pb-6 border-t border-[var(--color-border)]">
              {/* Impact Preview */}
              {preview && (
                <div className="mt-6 p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-[var(--color-text-secondary)]">
                      Classification Impact Preview
                    </h4>
                    {loading && (
                      <Loader2 className="w-4 h-4 text-[var(--color-turquoise-400)] animate-spin" />
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-500">{preview.greenCount}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">GREEN</p>
                      {preview.greenChange !== 0 && (
                        <p className={`text-xs font-medium ${preview.greenChange > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {preview.greenChange > 0 ? '+' : ''}{preview.greenChange}
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500">{preview.yellowCount}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">YELLOW</p>
                      {preview.yellowChange !== 0 && (
                        <p className={`text-xs font-medium ${preview.yellowChange > 0 ? 'text-amber-400' : 'text-blue-400'}`}>
                          {preview.yellowChange > 0 ? '+' : ''}{preview.yellowChange}
                        </p>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{preview.redCount}</p>
                      <p className="text-xs text-[var(--color-text-muted)]">RED</p>
                      {preview.redChange !== 0 && (
                        <p className={`text-xs font-medium ${preview.redChange > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {preview.redChange > 0 ? '+' : ''}{preview.redChange}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Sections */}
              <div className="mt-6 space-y-4">
                {sections.map((section) => (
                  <div key={section.id} className="border border-[var(--color-border)] rounded-xl overflow-hidden">
                    <button
                      onClick={() => setActiveSection(activeSection === section.id ? null : section.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-bg-hover)] transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-[var(--color-text-primary)]">{section.title}</h4>
                        <p className="text-xs text-[var(--color-text-muted)]">{section.subtitle}</p>
                      </div>
                      {activeSection === section.id ? (
                        <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                      )}
                    </button>

                    <AnimatePresence>
                      {activeSection === section.id && (
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: 'auto' }}
                          exit={{ height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 space-y-4">
                            {section.fields.map((field) => (
                              <div key={field.key} className="space-y-2">
                                <div className="flex justify-between items-center">
                                  <label className="text-sm text-[var(--color-text-secondary)]">
                                    {field.label}
                                  </label>
                                  <span className="text-sm font-mono font-semibold text-[var(--color-turquoise-400)]">
                                    {criteria[field.key]}
                                  </span>
                                </div>
                                <input
                                  type="range"
                                  min={field.min}
                                  max={field.max}
                                  step={field.step}
                                  value={criteria[field.key]}
                                  onChange={(e) => handleChange(field.key, Number(e.target.value))}
                                  className="w-full h-2 rounded-full appearance-none cursor-pointer
                                    bg-[var(--color-bg-tertiary)]
                                    [&::-webkit-slider-thumb]:appearance-none
                                    [&::-webkit-slider-thumb]:w-4
                                    [&::-webkit-slider-thumb]:h-4
                                    [&::-webkit-slider-thumb]:rounded-full
                                    [&::-webkit-slider-thumb]:bg-[var(--color-turquoise-500)]
                                    [&::-webkit-slider-thumb]:cursor-pointer
                                    [&::-webkit-slider-thumb]:shadow-md
                                    [&::-moz-range-thumb]:w-4
                                    [&::-moz-range-thumb]:h-4
                                    [&::-moz-range-thumb]:rounded-full
                                    [&::-moz-range-thumb]:bg-[var(--color-turquoise-500)]
                                    [&::-moz-range-thumb]:border-none
                                    [&::-moz-range-thumb]:cursor-pointer"
                                />
                                <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                                  <span>{field.min}</span>
                                  <span>{field.max}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[var(--color-border)]">
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset to Default
                </button>
                <div className="flex items-center gap-3">
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Changes preview in real-time
                  </p>
                  <button
                    onClick={fetchPreview}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-600)] font-medium hover:bg-[var(--color-turquoise-500)]/20 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Refresh Preview
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
