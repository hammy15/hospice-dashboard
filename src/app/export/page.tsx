'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Download, Check, CheckSquare, Square, Filter, Search,
  FileSpreadsheet, Loader2, Settings2, ChevronDown, ChevronUp
} from 'lucide-react';

interface FieldOption {
  key: string;
  label: string;
}

interface FieldsByCategory {
  [category: string]: FieldOption[];
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function ExportPage() {
  const [fieldsByCategory, setFieldsByCategory] = useState<FieldsByCategory>({});
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Filters
  const [state, setState] = useState('');
  const [classification, setClassification] = useState('');
  const [minAdc, setMinAdc] = useState('');
  const [maxAdc, setMaxAdc] = useState('');
  const [conStateOnly, setConStateOnly] = useState(false);
  const [peOnly, setPeOnly] = useState(false);
  const [independentOnly, setIndependentOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');

  // Presets
  const presets: Record<string, string[]> = {
    basic: ['ccn', 'provider_name', 'city', 'state', 'phone_number'],
    outreach: ['ccn', 'provider_name', 'city', 'state', 'phone_number', 'administrator_name', 'website', 'classification', 'outreach_readiness'],
    financial: ['ccn', 'provider_name', 'state', 'estimated_adc', 'total_revenue', 'total_expenses', 'net_income', 'classification'],
    ownership: ['ccn', 'provider_name', 'state', 'ownership_type_cms', 'pe_backed', 'chain_affiliated', 'owner_count', 'portfolio_group'],
    scoring: ['ccn', 'provider_name', 'state', 'classification', 'overall_score', 'quality_score', 'compliance_score', 'operational_score', 'market_score'],
    full: [],
  };

  useEffect(() => {
    fetchFields();
  }, []);

  async function fetchFields() {
    try {
      const response = await fetch('/api/export?fields=list');
      const data = await response.json();
      if (data.success) {
        setFieldsByCategory(data.data);
        const defaultFields = new Set(['ccn', 'provider_name', 'city', 'state', 'classification', 'overall_score', 'estimated_adc', 'phone_number']);
        setSelectedFields(defaultFields);
        setExpandedCategories(new Set(Object.keys(data.data)));
      }
    } catch (error) {
      console.error('Error fetching fields:', error);
    } finally {
      setLoading(false);
    }
  }

  const toggleField = (key: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedFields(newSelected);
  };

  const toggleCategory = (category: string) => {
    const categoryFields = fieldsByCategory[category]?.map(f => f.key) || [];
    const allSelected = categoryFields.every(f => selectedFields.has(f));

    const newSelected = new Set(selectedFields);
    if (allSelected) {
      categoryFields.forEach(f => newSelected.delete(f));
    } else {
      categoryFields.forEach(f => newSelected.add(f));
    }
    setSelectedFields(newSelected);
  };

  const applyPreset = (presetKey: string) => {
    if (presetKey === 'full') {
      const allFields = Object.values(fieldsByCategory).flat().map(f => f.key);
      setSelectedFields(new Set(allFields));
    } else {
      setSelectedFields(new Set(presets[presetKey]));
    }
  };

  const toggleExpandCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleExport = async () => {
    if (selectedFields.size === 0) return;

    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set('selected', Array.from(selectedFields).join(','));
      params.set('format', format);

      if (state) params.set('state', state);
      if (classification) params.set('classification', classification);
      if (minAdc) params.set('minAdc', minAdc);
      if (maxAdc) params.set('maxAdc', maxAdc);
      if (conStateOnly) params.set('conStateOnly', 'true');
      if (peOnly) params.set('peOnly', 'true');
      if (independentOnly) params.set('independentOnly', 'true');
      if (search) params.set('search', search);

      const url = '/api/export?' + params.toString();
      const response = await fetch(url);

      if (format === 'json') {
        const data = await response.json();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'hospice-export-' + new Date().toISOString().split('T')[0] + '.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      } else {
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'hospice-export-' + new Date().toISOString().split('T')[0] + '.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
      }
    } catch (error) {
      console.error('Export error:', error);
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-500)]" />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
          <span className="gradient-text">Custom Export</span>
        </h1>
        <p className="text-[var(--color-text-muted)] mt-1">
          Select fields and filters for your export
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Field Selection */}
        <div className="lg:col-span-2 space-y-6">
          {/* Presets */}
          <div className="glass-card rounded-xl p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-[var(--color-turquoise-500)]" />
              Quick Presets
            </h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset('basic')}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-sm font-medium transition-colors"
              >
                Basic Info
              </button>
              <button
                onClick={() => applyPreset('outreach')}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-sm font-medium transition-colors"
              >
                Outreach
              </button>
              <button
                onClick={() => applyPreset('financial')}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-sm font-medium transition-colors"
              >
                Financial
              </button>
              <button
                onClick={() => applyPreset('ownership')}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-sm font-medium transition-colors"
              >
                Ownership
              </button>
              <button
                onClick={() => applyPreset('scoring')}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)] text-sm font-medium transition-colors"
              >
                Scoring
              </button>
              <button
                onClick={() => applyPreset('full')}
                className="px-3 py-1.5 rounded-lg bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-500)] hover:bg-[var(--color-turquoise-500)]/30 text-sm font-medium transition-colors"
              >
                All Fields
              </button>
            </div>
          </div>

          {/* Field Categories */}
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="p-4 border-b border-[var(--color-border)]">
              <h3 className="font-semibold flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[var(--color-turquoise-500)]" />
                Select Fields
                <span className="ml-2 text-sm text-[var(--color-text-muted)]">
                  ({selectedFields.size} selected)
                </span>
              </h3>
            </div>

            <div className="divide-y divide-[var(--color-border)]">
              {Object.entries(fieldsByCategory).map(([category, fields]) => {
                const categoryFieldKeys = fields.map(f => f.key);
                const selectedCount = categoryFieldKeys.filter(k => selectedFields.has(k)).length;
                const allSelected = selectedCount === fields.length;
                const someSelected = selectedCount > 0 && selectedCount < fields.length;
                const isExpanded = expandedCategories.has(category);

                return (
                  <div key={category}>
                    <div
                      className="flex items-center gap-3 p-4 hover:bg-[var(--color-bg-hover)] cursor-pointer"
                      onClick={() => toggleExpandCategory(category)}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCategory(category);
                        }}
                        className="flex-shrink-0"
                      >
                        {allSelected ? (
                          <CheckSquare className="w-5 h-5 text-[var(--color-turquoise-500)]" />
                        ) : someSelected ? (
                          <div className="w-5 h-5 rounded border-2 border-[var(--color-turquoise-500)] bg-[var(--color-turquoise-500)]/30" />
                        ) : (
                          <Square className="w-5 h-5 text-[var(--color-text-muted)]" />
                        )}
                      </button>
                      <span className="font-medium flex-1">{category}</span>
                      <span className="text-sm text-[var(--color-text-muted)]">
                        {selectedCount}/{fields.length}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[var(--color-text-muted)]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[var(--color-text-muted)]" />
                      )}
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-4 pb-4"
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pl-8">
                          {fields.map(field => (
                            <button
                              key={field.key}
                              onClick={() => toggleField(field.key)}
                              className={'flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ' +
                                (selectedFields.has(field.key)
                                  ? 'bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)]'
                                  : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]')
                              }
                            >
                              {selectedFields.has(field.key) ? (
                                <Check className="w-4 h-4" />
                              ) : (
                                <div className="w-4 h-4" />
                              )}
                              {field.label}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filters & Export */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5 text-[var(--color-turquoise-500)]" />
              Filters
            </h3>

            <div className="space-y-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-muted)]">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
                  <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Provider name or city..."
                    className="w-full pl-10 pr-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-muted)]">
                  State
                </label>
                <select
                  value={state}
                  onChange={e => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none text-sm"
                >
                  <option value="">All States</option>
                  {US_STATES.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Classification */}
              <div>
                <label className="block text-sm font-medium mb-1 text-[var(--color-text-muted)]">
                  Classification
                </label>
                <select
                  value={classification}
                  onChange={e => setClassification(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none text-sm"
                >
                  <option value="">All Classifications</option>
                  <option value="GREEN">GREEN</option>
                  <option value="YELLOW">YELLOW</option>
                  <option value="RED">RED</option>
                </select>
              </div>

              {/* ADC Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--color-text-muted)]">
                    Min ADC
                  </label>
                  <input
                    type="number"
                    value={minAdc}
                    onChange={e => setMinAdc(e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-[var(--color-text-muted)]">
                    Max ADC
                  </label>
                  <input
                    type="number"
                    value={maxAdc}
                    onChange={e => setMaxAdc(e.target.value)}
                    placeholder="500"
                    className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] focus:border-[var(--color-turquoise-500)] focus:outline-none text-sm"
                  />
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={conStateOnly}
                    onChange={e => setConStateOnly(e.target.checked)}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-turquoise-500)] focus:ring-[var(--color-turquoise-500)]"
                  />
                  <span className="text-sm">CON States Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={peOnly}
                    onChange={e => {
                      setPeOnly(e.target.checked);
                      if (e.target.checked) setIndependentOnly(false);
                    }}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-turquoise-500)] focus:ring-[var(--color-turquoise-500)]"
                  />
                  <span className="text-sm">PE-Backed Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={independentOnly}
                    onChange={e => {
                      setIndependentOnly(e.target.checked);
                      if (e.target.checked) setPeOnly(false);
                    }}
                    className="w-4 h-4 rounded border-[var(--color-border)] text-[var(--color-turquoise-500)] focus:ring-[var(--color-turquoise-500)]"
                  />
                  <span className="text-sm">Independent Only</span>
                </label>
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="font-semibold mb-4">Export Format</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setFormat('csv')}
                className={'flex-1 py-2 rounded-lg font-medium text-sm transition-colors ' +
                  (format === 'csv'
                    ? 'bg-[var(--color-turquoise-500)] text-white'
                    : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]')
                }
              >
                CSV
              </button>
              <button
                onClick={() => setFormat('json')}
                className={'flex-1 py-2 rounded-lg font-medium text-sm transition-colors ' +
                  (format === 'json'
                    ? 'bg-[var(--color-turquoise-500)] text-white'
                    : 'bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-tertiary)]')
                }
              >
                JSON
              </button>
            </div>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExport}
            disabled={selectedFields.size === 0 || exporting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {exporting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Download className="w-5 h-5" />
            )}
            Export {selectedFields.size} Fields
          </button>
        </div>
      </div>
    </div>
  );
}
