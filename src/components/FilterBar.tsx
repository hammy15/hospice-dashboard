'use client';

import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface FilterBarProps {
  states: string[];
  onFilterChange: (filters: {
    classification?: string;
    state?: string;
    minAdc?: number;
    maxAdc?: number;
    conStateOnly?: boolean;
    search?: string;
  }) => void;
  initialFilters?: {
    classification?: string;
    state?: string;
    minAdc?: string;
    maxAdc?: string;
    conStateOnly?: boolean;
    search?: string;
  };
}

export function FilterBar({ states, onFilterChange, initialFilters }: FilterBarProps) {
  const [classification, setClassification] = useState<string>(initialFilters?.classification || '');
  const [state, setState] = useState<string>(initialFilters?.state || '');
  const [minAdc, setMinAdc] = useState<string>(initialFilters?.minAdc || '');
  const [maxAdc, setMaxAdc] = useState<string>(initialFilters?.maxAdc || '');
  const [conStateOnly, setConStateOnly] = useState(initialFilters?.conStateOnly || false);
  const [search, setSearch] = useState(initialFilters?.search || '');
  const [initialized, setInitialized] = useState(false);

  // Apply initial filters on mount
  useEffect(() => {
    if (!initialized && initialFilters) {
      if (initialFilters.classification) setClassification(initialFilters.classification);
      if (initialFilters.state) setState(initialFilters.state);
      if (initialFilters.minAdc) setMinAdc(initialFilters.minAdc);
      if (initialFilters.maxAdc) setMaxAdc(initialFilters.maxAdc);
      if (initialFilters.conStateOnly) setConStateOnly(initialFilters.conStateOnly);
      if (initialFilters.search) setSearch(initialFilters.search);
      setInitialized(true);
    }
  }, [initialFilters, initialized]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      onFilterChange({
        classification: classification || undefined,
        state: state || undefined,
        minAdc: minAdc ? Number(minAdc) : undefined,
        maxAdc: maxAdc ? Number(maxAdc) : undefined,
        conStateOnly,
        search: search || undefined,
      });
    }, 300);

    return () => clearTimeout(timeout);
  }, [classification, state, minAdc, maxAdc, conStateOnly, search, onFilterChange]);

  const clearFilters = () => {
    setClassification('');
    setState('');
    setMinAdc('');
    setMaxAdc('');
    setConStateOnly(false);
    setSearch('');
    // Update URL without filters
    window.history.replaceState({}, '', '/targets');
  };

  const hasFilters = classification || state || minAdc || maxAdc || conStateOnly || search;

  return (
    <div className="glass-card rounded-2xl p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search providers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4"
          />
        </div>

        <select
          value={classification}
          onChange={(e) => setClassification(e.target.value)}
          className="min-w-[130px]"
        >
          <option value="">All Classes</option>
          <option value="GREEN">GREEN</option>
          <option value="YELLOW">YELLOW</option>
          <option value="RED">RED</option>
        </select>

        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="min-w-[120px]"
        >
          <option value="">All States</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ADC"
            value={minAdc}
            onChange={(e) => setMinAdc(e.target.value)}
            className="w-24"
          />
          <span className="text-[var(--color-text-muted)]">—</span>
          <input
            type="number"
            placeholder="Max ADC"
            value={maxAdc}
            onChange={(e) => setMaxAdc(e.target.value)}
            className="w-24"
          />
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={conStateOnly}
            onChange={(e) => setConStateOnly(e.target.checked)}
            className="w-4 h-4 rounded border-[var(--color-border)] bg-[var(--color-bg-tertiary)] text-[var(--color-turquoise-500)] focus:ring-[var(--color-turquoise-500)] focus:ring-offset-0"
          />
          <span className="text-sm text-[var(--color-text-secondary)]">CON States Only</span>
        </label>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
