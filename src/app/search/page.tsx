'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  X,
  Download,
  MapPin,
  Building2,
  DollarSign,
  Users,
  Star,
  Shield,
  BadgeCheck,
  Phone,
  Globe,
  Heart,
  Loader2,
  ArrowUpDown,
  Target,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

interface SearchFilters {
  providerName?: string;
  state?: string;
  city?: string;
  county?: string;
  classification?: string;
  minAdc?: string;
  maxAdc?: string;
  minScore?: string;
  maxScore?: string;
  minRevenue?: string;
  maxRevenue?: string;
  minNetIncome?: string;
  profitableOnly?: boolean;
  hasFinancials?: boolean;
  minPop65?: string;
  minPct65?: string;
  minMedianIncome?: string;
  maxMedianIncome?: string;
  minCahpsStar?: string;
  hasStarRating?: boolean;
  ownershipType?: string;
  peBacked?: string;
  chainAffiliated?: string;
  recentOwnershipChange?: string;
  conStateOnly?: boolean;
  hasNpi?: boolean;
  hasEin?: boolean;
  hasAuthorizedOfficial?: boolean;
  hasPhone?: boolean;
  hasWebsite?: boolean;
  hasAddress?: boolean;
  hasCoordinates?: boolean;
  sortBy?: string;
  sortDir?: string;
}

interface Provider {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  county: string;
  classification: string;
  overall_score: number;
  estimated_adc: number;
  total_revenue: number;
  net_income: number;
  county_pop_65_plus: number;
  cms_cahps_star: number;
  npi: string;
  ein: string;
  phone_number: string;
  website: string;
  con_state: boolean;
  ownership_type_cms: string;
  pe_backed: boolean;
  authorized_official: string;
}

interface Aggregates {
  count: number;
  green_count: number;
  yellow_count: number;
  avg_score: number;
  avg_adc: number;
  avg_revenue: number;
  total_revenue: number;
  states: number;
  cities: number;
}

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
];

export default function SearchPage() {
  const router = useRouter();
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<Provider[]>([]);
  const [aggregates, setAggregates] = useState<Aggregates | null>(null);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Collapsible sections
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    financial: false,
    demographics: false,
    quality: false,
    ownership: false,
    registry: false,
    contact: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setResults([]);
    setAggregates(null);
    setTotal(0);
    setHasSearched(false);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([_, v]) => v !== undefined && v !== '' && v !== false
  ).length;

  const search = useCallback(async () => {
    setLoading(true);
    setHasSearched(true);

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filters, limit: 200 }),
      });

      const data = await response.json();
      setResults(data.results || []);
      setAggregates(data.aggregates);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const exportResults = () => {
    if (results.length === 0) return;

    const headers = [
      'CCN', 'Provider Name', 'City', 'State', 'Classification', 'Score', 'ADC',
      'Revenue ($M)', 'Net Income ($M)', '65+ Pop', 'Star Rating', 'NPI', 'Phone'
    ];

    const rows = results.map((p) => [
      p.ccn,
      `"${p.provider_name}"`,
      `"${p.city}"`,
      p.state,
      p.classification,
      p.overall_score?.toFixed(1) || '',
      p.estimated_adc || '',
      p.total_revenue ? (p.total_revenue / 1000000).toFixed(2) : '',
      p.net_income ? (p.net_income / 1000000).toFixed(2) : '',
      p.county_pop_65_plus || '',
      p.cms_cahps_star || '',
      p.npi || '',
      p.phone_number || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hospice-search-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const SectionHeader = ({
    title,
    icon: Icon,
    section,
    count,
  }: {
    title: string;
    icon: any;
    section: string;
    count?: number;
  }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-3 rounded-lg bg-[var(--color-bg-tertiary)] hover:bg-[var(--color-bg-hover)] transition-colors"
    >
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-[var(--color-turquoise-400)]" />
        <span className="font-medium">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="px-1.5 py-0.5 text-xs rounded-full bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)]">
            {count}
          </span>
        )}
      </div>
      {expandedSections[section] ? (
        <ChevronUp className="w-4 h-4" />
      ) : (
        <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
              <span className="gradient-text">Advanced Search</span>
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Search across all provider data with powerful filters
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          {/* Quick Actions */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-[var(--color-text-muted)]">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
            <button
              onClick={search}
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-gradient-to-r from-[var(--color-turquoise-500)] to-[var(--color-turquoise-600)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search
            </button>
          </div>

          {/* Basic Filters */}
          <div className="glass-card rounded-xl overflow-hidden">
            <SectionHeader title="Basic Filters" icon={Filter} section="basic" />
            {expandedSections.basic && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    Provider Name
                  </label>
                  <input
                    type="text"
                    value={filters.providerName || ''}
                    onChange={(e) => updateFilter('providerName', e.target.value)}
                    placeholder="Search by name..."
                    className="w-full text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      State
                    </label>
                    <select
                      value={filters.state || ''}
                      onChange={(e) => updateFilter('state', e.target.value)}
                      className="w-full text-sm"
                    >
                      <option value="">All States</option>
                      {US_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Classification
                    </label>
                    <select
                      value={filters.classification || ''}
                      onChange={(e) => updateFilter('classification', e.target.value)}
                      className="w-full text-sm"
                    >
                      <option value="">All</option>
                      <option value="GREEN">GREEN</option>
                      <option value="YELLOW">YELLOW</option>
                      <option value="RED">RED</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    City
                  </label>
                  <input
                    type="text"
                    value={filters.city || ''}
                    onChange={(e) => updateFilter('city', e.target.value)}
                    placeholder="Filter by city..."
                    className="w-full text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Min ADC
                    </label>
                    <input
                      type="number"
                      value={filters.minAdc || ''}
                      onChange={(e) => updateFilter('minAdc', e.target.value)}
                      placeholder="0"
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Max ADC
                    </label>
                    <input
                      type="number"
                      value={filters.maxAdc || ''}
                      onChange={(e) => updateFilter('maxAdc', e.target.value)}
                      placeholder="500"
                      className="w-full text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Min Score
                    </label>
                    <input
                      type="number"
                      value={filters.minScore || ''}
                      onChange={(e) => updateFilter('minScore', e.target.value)}
                      placeholder="0"
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Max Score
                    </label>
                    <input
                      type="number"
                      value={filters.maxScore || ''}
                      onChange={(e) => updateFilter('maxScore', e.target.value)}
                      placeholder="100"
                      className="w-full text-sm"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.conStateOnly || false}
                    onChange={(e) => updateFilter('conStateOnly', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">CON States Only</span>
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                </label>
              </div>
            )}
          </div>

          {/* Financial Filters */}
          <div className="glass-card rounded-xl overflow-hidden">
            <SectionHeader title="Financial Data" icon={DollarSign} section="financial" />
            {expandedSections.financial && (
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Min Revenue ($M)
                    </label>
                    <input
                      type="number"
                      value={filters.minRevenue || ''}
                      onChange={(e) => updateFilter('minRevenue', e.target.value)}
                      placeholder="0"
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Max Revenue ($M)
                    </label>
                    <input
                      type="number"
                      value={filters.maxRevenue || ''}
                      onChange={(e) => updateFilter('maxRevenue', e.target.value)}
                      placeholder="100"
                      className="w-full text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    Min Net Income ($M)
                  </label>
                  <input
                    type="number"
                    value={filters.minNetIncome || ''}
                    onChange={(e) => updateFilter('minNetIncome', e.target.value)}
                    placeholder="-10"
                    className="w-full text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.profitableOnly || false}
                      onChange={(e) => updateFilter('profitableOnly', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Profitable Only (Net Income &gt; 0)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.hasFinancials || false}
                      onChange={(e) => updateFilter('hasFinancials', e.target.checked)}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm">Has Cost Report Data</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Demographics Filters */}
          <div className="glass-card rounded-xl overflow-hidden">
            <SectionHeader title="Demographics" icon={Users} section="demographics" />
            {expandedSections.demographics && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    Min 65+ Population
                  </label>
                  <input
                    type="number"
                    value={filters.minPop65 || ''}
                    onChange={(e) => updateFilter('minPop65', e.target.value)}
                    placeholder="10000"
                    className="w-full text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    Min % 65+
                  </label>
                  <input
                    type="number"
                    value={filters.minPct65 || ''}
                    onChange={(e) => updateFilter('minPct65', e.target.value)}
                    placeholder="15"
                    className="w-full text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Min Income ($)
                    </label>
                    <input
                      type="number"
                      value={filters.minMedianIncome || ''}
                      onChange={(e) => updateFilter('minMedianIncome', e.target.value)}
                      placeholder="50000"
                      className="w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                      Max Income ($)
                    </label>
                    <input
                      type="number"
                      value={filters.maxMedianIncome || ''}
                      onChange={(e) => updateFilter('maxMedianIncome', e.target.value)}
                      placeholder="150000"
                      className="w-full text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quality Filters */}
          <div className="glass-card rounded-xl overflow-hidden">
            <SectionHeader title="Quality & Ratings" icon={Star} section="quality" />
            {expandedSections.quality && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    Min CAHPS Star Rating
                  </label>
                  <select
                    value={filters.minCahpsStar || ''}
                    onChange={(e) => updateFilter('minCahpsStar', e.target.value)}
                    className="w-full text-sm"
                  >
                    <option value="">Any</option>
                    <option value="1">1+ Stars</option>
                    <option value="2">2+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="5">5 Stars Only</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasStarRating || false}
                    onChange={(e) => updateFilter('hasStarRating', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has Star Rating</span>
                </label>
              </div>
            )}
          </div>

          {/* Ownership Filters */}
          <div className="glass-card rounded-xl overflow-hidden">
            <SectionHeader title="Ownership" icon={Building2} section="ownership" />
            {expandedSections.ownership && (
              <div className="p-4 space-y-4">
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    Ownership Type
                  </label>
                  <select
                    value={filters.ownershipType || ''}
                    onChange={(e) => updateFilter('ownershipType', e.target.value)}
                    className="w-full text-sm"
                  >
                    <option value="">Any</option>
                    <option value="profit">For-Profit</option>
                    <option value="non-profit">Non-Profit</option>
                    <option value="government">Government</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    PE/Investment Backed
                  </label>
                  <select
                    value={filters.peBacked || ''}
                    onChange={(e) => updateFilter('peBacked', e.target.value)}
                    className="w-full text-sm"
                  >
                    <option value="">Any</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-text-muted)] mb-1 block">
                    Chain Affiliated
                  </label>
                  <select
                    value={filters.chainAffiliated || ''}
                    onChange={(e) => updateFilter('chainAffiliated', e.target.value)}
                    className="w-full text-sm"
                  >
                    <option value="">Any</option>
                    <option value="yes">Yes</option>
                    <option value="no">No (Independent)</option>
                  </select>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.recentOwnershipChange === 'yes'}
                    onChange={(e) =>
                      updateFilter('recentOwnershipChange', e.target.checked ? 'yes' : '')
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Recent Ownership Change</span>
                </label>
              </div>
            )}
          </div>

          {/* Registry Filters */}
          <div className="glass-card rounded-xl overflow-hidden">
            <SectionHeader title="Registry Data" icon={BadgeCheck} section="registry" />
            {expandedSections.registry && (
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasNpi || false}
                    onChange={(e) => updateFilter('hasNpi', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has NPI</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasAuthorizedOfficial || false}
                    onChange={(e) => updateFilter('hasAuthorizedOfficial', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has Authorized Official</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasEin || false}
                    onChange={(e) => updateFilter('hasEin', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has EIN (990 Data)</span>
                </label>
              </div>
            )}
          </div>

          {/* Contact Filters */}
          <div className="glass-card rounded-xl overflow-hidden">
            <SectionHeader title="Contact Info" icon={Phone} section="contact" />
            {expandedSections.contact && (
              <div className="p-4 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasPhone || false}
                    onChange={(e) => updateFilter('hasPhone', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has Phone Number</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasWebsite || false}
                    onChange={(e) => updateFilter('hasWebsite', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has Website</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasAddress || false}
                    onChange={(e) => updateFilter('hasAddress', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has Address</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.hasCoordinates || false}
                    onChange={(e) => updateFilter('hasCoordinates', e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm">Has Map Coordinates</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        <div className="lg:col-span-3">
          {/* Aggregates Summary */}
          {aggregates && (
            <div className="glass-card rounded-xl p-4 mb-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[var(--color-turquoise-400)]">{total.toLocaleString()}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Results</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-400">{aggregates.green_count}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">GREEN</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{aggregates.yellow_count}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">YELLOW</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{aggregates.avg_score || '—'}</p>
                  <p className="text-xs text-[var(--color-text-muted)]">Avg Score</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {aggregates.total_revenue
                      ? `$${(aggregates.total_revenue / 1000000000).toFixed(1)}B`
                      : '—'}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">Total Revenue</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          {results.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[var(--color-text-muted)]">
                Showing {results.length} of {total.toLocaleString()} results
              </p>
              <button
                onClick={exportResults}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          )}

          {/* Results Table */}
          {loading ? (
            <div className="glass-card rounded-xl p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-400)]" />
            </div>
          ) : !hasSearched ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <Search className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Configure Your Search</h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                Use the filters on the left to find providers matching your criteria, then click Search.
              </p>
            </div>
          ) : results.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <X className="w-12 h-12 text-[var(--color-text-muted)] mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Results Found</h3>
              <p className="text-[var(--color-text-muted)] text-sm">
                Try adjusting your filters to broaden the search.
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[var(--color-bg-tertiary)] border-b border-[var(--color-border)]">
                      <th className="text-left p-3 font-semibold">Provider</th>
                      <th className="text-center p-3 font-semibold">Class</th>
                      <th className="text-right p-3 font-semibold">Score</th>
                      <th className="text-right p-3 font-semibold">ADC</th>
                      <th className="text-right p-3 font-semibold">Revenue</th>
                      <th className="text-right p-3 font-semibold">65+ Pop</th>
                      <th className="text-center p-3 font-semibold">Star</th>
                      <th className="text-center p-3 font-semibold">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((provider) => (
                      <tr
                        key={provider.ccn}
                        className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-hover)] cursor-pointer"
                        onClick={() => router.push(`/provider/${provider.ccn}`)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {provider.con_state && (
                              <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium truncate max-w-[200px]">
                                {provider.provider_name}
                              </p>
                              <p className="text-xs text-[var(--color-text-muted)]">
                                {provider.city}, {provider.state}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${
                              provider.classification === 'GREEN'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : provider.classification === 'YELLOW'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}
                          >
                            {provider.classification}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono">
                          {provider.overall_score?.toFixed(1) || '—'}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {provider.estimated_adc || '—'}
                        </td>
                        <td className="p-3 text-right font-mono text-emerald-400">
                          {provider.total_revenue
                            ? `$${(provider.total_revenue / 1000000).toFixed(1)}M`
                            : '—'}
                        </td>
                        <td className="p-3 text-right font-mono">
                          {provider.county_pop_65_plus
                            ? provider.county_pop_65_plus.toLocaleString()
                            : '—'}
                        </td>
                        <td className="p-3 text-center">
                          {provider.cms_cahps_star ? (
                            <span className="text-amber-400">
                              {provider.cms_cahps_star}★
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center justify-center gap-1">
                            {provider.npi && (
                              <span title="Has NPI"><BadgeCheck className="w-3.5 h-3.5 text-blue-400" /></span>
                            )}
                            {provider.ein && (
                              <span title="Has 990"><Heart className="w-3.5 h-3.5 text-pink-400" /></span>
                            )}
                            {provider.phone_number && (
                              <span title="Has Phone"><Phone className="w-3.5 h-3.5 text-green-400" /></span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
