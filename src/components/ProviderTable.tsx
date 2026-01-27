'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, ExternalLink, MapPin, Building2, TrendingUp } from 'lucide-react';
import { ClassificationBadge } from './ClassificationBadge';
import { HospiceProvider } from '@/lib/db';
import Link from 'next/link';

interface ProviderTableProps {
  providers: HospiceProvider[];
  showAllColumns?: boolean;
}

export function ProviderTable({ providers, showAllColumns = false }: ProviderTableProps) {
  const [sortField, setSortField] = useState<string>('overall_score');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const sortedProviders = [...providers].sort((a, b) => {
    const aVal = a[sortField as keyof HospiceProvider];
    const bVal = b[sortField as keyof HospiceProvider];

    if (aVal === null || aVal === undefined) return 1;
    if (bVal === null || bVal === undefined) return -1;

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
    }

    return sortDir === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  const formatScore = (score: number | string | null) => {
    if (score === null || score === undefined) return '—';
    const num = typeof score === 'string' ? parseFloat(score) : score;
    return isNaN(num) ? '—' : num.toFixed(1);
  };

  const formatAdc = (adc: number | string | null) => {
    if (adc === null || adc === undefined) return null;
    const num = typeof adc === 'string' ? parseFloat(adc) : adc;
    return isNaN(num) ? null : num;
  };

  return (
    <div className="glass-card rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="text-left p-4 font-semibold text-[var(--color-text-secondary)] text-sm cursor-pointer hover:text-[var(--color-turquoise-400)] transition-colors"
                  onClick={() => handleSort('provider_name')}>
                <div className="flex items-center gap-1">
                  Provider <SortIcon field="provider_name" />
                </div>
              </th>
              <th className="text-left p-4 font-semibold text-[var(--color-text-secondary)] text-sm cursor-pointer hover:text-[var(--color-turquoise-400)] transition-colors"
                  onClick={() => handleSort('state')}>
                <div className="flex items-center gap-1">
                  Location <SortIcon field="state" />
                </div>
              </th>
              <th className="text-center p-4 font-semibold text-[var(--color-text-secondary)] text-sm cursor-pointer hover:text-[var(--color-turquoise-400)] transition-colors"
                  onClick={() => handleSort('classification')}>
                <div className="flex items-center justify-center gap-1">
                  Class <SortIcon field="classification" />
                </div>
              </th>
              <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)] text-sm cursor-pointer hover:text-[var(--color-turquoise-400)] transition-colors"
                  onClick={() => handleSort('estimated_adc')}>
                <div className="flex items-center justify-end gap-1">
                  ADC <SortIcon field="estimated_adc" />
                </div>
              </th>
              <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)] text-sm cursor-pointer hover:text-[var(--color-turquoise-400)] transition-colors"
                  onClick={() => handleSort('overall_score')}>
                <div className="flex items-center justify-end gap-1">
                  Score <SortIcon field="overall_score" />
                </div>
              </th>
              {showAllColumns && (
                <>
                  <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)] text-sm">Quality</th>
                  <th className="text-right p-4 font-semibold text-[var(--color-text-secondary)] text-sm">Compliance</th>
                </>
              )}
              <th className="text-center p-4 font-semibold text-[var(--color-text-secondary)] text-sm">CON</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {sortedProviders.map((provider, index) => (
              <React.Fragment key={provider.ccn}>
                <motion.tr
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.02 }}
                  className="data-row border-b border-[var(--color-border)] cursor-pointer transition-all duration-200"
                  onClick={() => setExpandedRow(expandedRow === provider.ccn ? null : provider.ccn)}
                >
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[var(--color-text-primary)]">
                        {provider.provider_name}
                      </span>
                      <span className="text-xs text-[var(--color-text-muted)] font-mono">
                        CCN: {provider.ccn}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-text-muted)]" />
                      <div>
                        <span className="font-medium">{provider.state}</span>
                        <span className="text-[var(--color-text-muted)] text-sm ml-2">{provider.city}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <ClassificationBadge classification={provider.classification} />
                  </td>
                  <td className="p-4 text-right font-mono">
                    {(() => {
                      const adc = formatAdc(provider.estimated_adc);
                      if (adc === null) return '—';
                      return (
                        <span className={adc < 60 ? 'text-emerald-400' : 'text-[var(--color-text-secondary)]'}>
                          {adc.toFixed(0)}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4 text-right">
                    <span className="font-mono font-semibold text-[var(--color-turquoise-400)]">
                      {formatScore(provider.overall_score)}
                    </span>
                  </td>
                  {showAllColumns && (
                    <>
                      <td className="p-4 text-right font-mono text-sm text-[var(--color-text-secondary)]">
                        {formatScore(provider.quality_score)}
                      </td>
                      <td className="p-4 text-right font-mono text-sm text-[var(--color-text-secondary)]">
                        {formatScore(provider.compliance_score)}
                      </td>
                    </>
                  )}
                  <td className="p-4 text-center">
                    {provider.con_state ? (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)]">
                        ✓
                      </span>
                    ) : (
                      <span className="text-[var(--color-text-muted)]">—</span>
                    )}
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/provider/${provider.ccn}`}
                      className="p-2 rounded-lg hover:bg-[var(--color-bg-hover)] transition-colors inline-flex"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-[var(--color-text-muted)] hover:text-[var(--color-turquoise-400)]" />
                    </Link>
                  </td>
                </motion.tr>
                {expandedRow === provider.ccn && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-[var(--color-bg-tertiary)]/50"
                  >
                    <td colSpan={showAllColumns ? 9 : 7} className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--color-turquoise-400)] mb-2 flex items-center gap-2">
                            <Building2 className="w-4 h-4" /> Ownership
                          </h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">{provider.ownership_type_cms || 'Unknown'}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">
                            Complexity: {provider.ownership_complexity}
                            {provider.pe_backed && ' • PE-backed'}
                            {provider.chain_affiliated && ' • Chain'}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--color-turquoise-400)] mb-2 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Outreach Status
                          </h4>
                          <p className="text-sm text-[var(--color-text-secondary)]">{provider.outreach_readiness}</p>
                          <p className="text-xs text-[var(--color-text-muted)] mt-1">{provider.platform_vs_tuckin}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-[var(--color-turquoise-400)] mb-2">Classification Reasons</h4>
                          <p className="text-sm text-[var(--color-text-secondary)] line-clamp-3">
                            {provider.classification_reasons?.split('|').slice(0, 2).join(' • ') || 'No reasons available'}
                          </p>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {providers.length === 0 && (
        <div className="p-12 text-center text-[var(--color-text-muted)]">
          No providers found matching your criteria
        </div>
      )}
    </div>
  );
}
