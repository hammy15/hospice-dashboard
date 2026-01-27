'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ProviderTable } from '@/components/ProviderTable';
import { FilterBar } from '@/components/FilterBar';
import { HospiceProvider } from '@/lib/db';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

function TargetsContent() {
  const searchParams = useSearchParams();
  const [providers, setProviders] = useState<HospiceProvider[]>([]);
  const [states, setStates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

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

  useEffect(() => {
    fetch('/api/states')
      .then(res => res.json())
      .then(data => setStates(data.states || []));
  }, []);

  const fetchProviders = useCallback(async (filters: any) => {
    setLoading(true);
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
          <div className="mb-4 text-sm text-[var(--color-text-muted)]">
            Showing {providers.length} of {totalCount.toLocaleString()} providers
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
