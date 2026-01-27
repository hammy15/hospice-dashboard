'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProviderTable } from '@/components/ProviderTable';
import { FilterBar } from '@/components/FilterBar';
import { HospiceProvider } from '@/lib/db';
import { Loader2, ArrowLeft, Download } from 'lucide-react';
import Link from 'next/link';

function TargetsContent() {
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<HospiceProvider[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentFilters, setCurrentFilters] = useState<any>({});
  const [exporting, setExporting] = useState(false);

  // Get initial filters from URL
  const initialFilters = {
    classification: searchParams.get('classification') || undefined,
    state: searchParams.get('state') || undefined,
    minAdc: searchParams.get('minAdc') || undefined,
    maxAdc: searchParams.get('maxAdc') || undefined,
    conStateOnly: searchParams.get('conStateOnly') === 'true',
    search: searchParams.get('search') || undefined,
  };

  const activeState = searchParams.get('state');

  const handleExport = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (currentFilters.classification) params.set('classification', currentFilters.classification);
      if (currentFilters.state) params.set('state', currentFilters.state);
      if (currentFilters.minAdc) params.set('minAdc', String(currentFilters.minAdc));
      if (currentFilters.maxAdc) params.set('maxAdc', String(currentFilters.maxAdc));
      if (currentFilters.conStateOnly) params.set('conStateOnly', 'true');
      if (currentFilters.search) params.set('search', currentFilters.search);
      params.set('format', 'csv');

      const response = await fetch(`/api/export?${params}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hospice-targets-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(data => setStates(data.states || []));
  }, []);

  const fetchProviders = useCallback(async (filters: any) => {
    setLoading(true);
    setCurrentFilters(filters);
    try {
      const params = new URLSearchParams();
      if (filters.classification) params.set('classification', filters.classification);
      if (filters.state) params.set('state', filters.state);
      if (filters.minAdc) params.set('minAdc', String(filters.minAdc));
      if (filters.maxAdc) params.set('maxAdc', String(filters.maxAdc));
      if (filters.conStateOnly) params.set('conStateOnly', 'true');
      if (filters.search) params.set('search', filters.search);
      params.set('limit', '100');

      const res = await fetch(`/api/providers?${params}`);
      const data = await res.json();
      setProviders(data.providers || []);
      setTotalCount(data.total || 0);
    } catch (error) {
      console.error('Error fetching providers:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProviders(initialFilters);
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6">
      {activeState && (
        <Link
          href="/targets"
          className="inline-flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Targets
        </Link>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          <span className="gradient-text">
            {activeState ? `${activeState} Providers` : 'All Targets'}
          </span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          {activeState
            ? `Hospice providers in ${activeState}`
            : 'Browse and filter all 6,970 hospice providers'}
        </p>
      </div>

      <FilterBar
        states={states}
        onFilterChange={fetchProviders}
        initialFilters={initialFilters}
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-[var(--color-text-muted)]">
              Showing {providers.length} of {totalCount.toLocaleString()} providers
            </span>
            <button
              onClick={handleExport}
              disabled={exporting || providers.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-600)] font-medium text-sm hover:bg-[var(--color-turquoise-500)]/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export CSV
            </button>
          </div>
          <ProviderTable providers={providers} showAllColumns />
        </>
      )}
    </div>
  );
}

export default function TargetsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-[var(--color-turquoise-400)] animate-spin" />
      </div>
    }>
      <TargetsContent />
    </Suspense>
  );
}
