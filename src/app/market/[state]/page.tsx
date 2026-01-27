import { getMarketTargets, getMarketStats, getMarketCityBreakdown, getMarketDemographics, getTopCountiesByDemographics } from '@/lib/db';
import { ProviderTable } from '@/components/ProviderTable';
import { StatCard } from '@/components/StatCard';
import { notFound } from 'next/navigation';
import { MapPin, Shield, Building2, Phone, Globe, TrendingUp, Users, DollarSign, PieChart } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const marketInfo: Record<string, { name: string; conState: boolean; notes: { regulatory: string[]; market: string[] } }> = {
  wa: {
    name: 'Washington',
    conState: true,
    notes: {
      regulatory: [
        'Certificate of Need (CON) state — significant barrier to new entrants',
        'Existing licenses carry substantial strategic value',
        'Regulatory moat protects market share',
      ],
      market: [
        'Mix of urban (Seattle/Tacoma) and rural markets',
        'Strong nonprofit presence',
        'Growing senior population in Puget Sound region',
      ],
    },
  },
  or: {
    name: 'Oregon',
    conState: true,
    notes: {
      regulatory: [
        'Certificate of Need (CON) state with protective regulations',
        'Established providers have significant competitive advantage',
        'State oversight maintains quality standards',
      ],
      market: [
        'Portland metro offers dense population center',
        'Rural eastern Oregon underserved',
        'Strong community health focus',
      ],
    },
  },
  ca: {
    name: 'California',
    conState: false,
    notes: {
      regulatory: [
        'Non-CON state with competitive market dynamics',
        'Higher licensing requirements than many states',
        'Strong state regulatory oversight',
      ],
      market: [
        'Largest hospice market in the US by volume',
        'Diverse regional markets from Bay Area to SoCal',
        'High competition but significant opportunity',
      ],
    },
  },
  mt: {
    name: 'Montana',
    conState: true,
    notes: {
      regulatory: [
        'Certificate of Need (CON) state with rural focus',
        'Limited competition due to geographic barriers',
        'Favorable regulatory environment for established providers',
      ],
      market: [
        'Large geographic coverage areas required',
        'Aging rural population with limited options',
        'Strong community relationships matter',
      ],
    },
  },
  nv: {
    name: 'Nevada',
    conState: false,
    notes: {
      regulatory: [
        'Non-CON state with growing regulatory framework',
        'Relatively easier market entry',
        'Recent increases in compliance requirements',
      ],
      market: [
        'Las Vegas metro dominates market',
        'Rapid population growth in senior demographic',
        'Retirement destination creates steady demand',
      ],
    },
  },
};

export async function generateStaticParams() {
  return Object.keys(marketInfo).map((state) => ({ state }));
}

export default async function MarketPage({ params }: { params: Promise<{ state: string }> }) {
  const { state } = await params;
  const stateKey = state.toLowerCase();
  const market = marketInfo[stateKey];

  if (!market) {
    notFound();
  }

  const [targets, stats, cityBreakdown, demographics, topCounties] = await Promise.all([
    getMarketTargets(state),
    getMarketStats(state),
    getMarketCityBreakdown(state),
    getMarketDemographics(state),
    getTopCountiesByDemographics(state),
  ]);

  const greenCount = Number(stats.green_count) || 0;
  const yellowCount = Number(stats.yellow_count) || 0;
  const totalTargets = targets.length;

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold font-[family-name:var(--font-display)]">
                <span className="gradient-text">{market.name}</span>
              </h1>
              {market.conState && (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-semibold flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  CON Protected
                </span>
              )}
            </div>
            <p className="text-[var(--color-text-secondary)]">
              Hot market analysis • {totalTargets} acquisition targets
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
        <StatCard
          title="GREEN Targets"
          value={greenCount}
          subtitle="Ready for outreach"
          icon="target"
          variant="green"
        />
        <StatCard
          title="YELLOW Targets"
          value={yellowCount}
          subtitle="Further diligence needed"
          icon="alert-triangle"
          variant="yellow"
        />
        <StatCard
          title="Avg GREEN ADC"
          value={stats.avg_green_adc || '—'}
          subtitle="Average daily census"
          icon="building"
        />
        <StatCard
          title="Avg Score"
          value={stats.avg_green_score || '—'}
          subtitle="GREEN target score"
          icon="trending-up"
        />
        <StatCard
          title="Cities"
          value={stats.city_count || 0}
          subtitle="Markets covered"
          icon="map-pin"
        />
        <StatCard
          title="With Contact"
          value={`${Math.round((Number(stats.with_phone) / Number(stats.total_count || 1)) * 100)}%`}
          subtitle="Phone numbers"
          icon="building"
        />
      </div>

      {/* Star Rating Summary */}
      {stats.avg_cahps_star && (
        <div className="glass-card rounded-2xl p-4 mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <span className="text-white text-xl">★</span>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-secondary)] font-medium">Average CAHPS Rating</p>
              <p className="text-2xl font-bold text-amber-400">{stats.avg_cahps_star}★</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-[var(--color-text-secondary)]">{stats.with_cahps_star} of {stats.total_count} providers rated</p>
            <p className="text-xs text-[var(--color-text-muted)]">Family Caregiver Survey (CMS Nov 2025)</p>
          </div>
        </div>
      )}

      {/* Demographics Panel */}
      {demographics?.avg_pop_65_plus && (
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-[var(--color-turquoise-400)] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Market Demographics (Census 2022)
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Avg 65+ Population</p>
              <p className="text-2xl font-bold font-mono text-[var(--color-turquoise-400)]">
                {Number(demographics.avg_pop_65_plus).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">per county</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Avg % 65+</p>
              <p className="text-2xl font-bold font-mono text-emerald-400">
                {demographics.avg_pct_65_plus}%
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">of population</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Median Income</p>
              <p className="text-2xl font-bold font-mono">
                ${Number(demographics.avg_median_income).toLocaleString()}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">household avg</p>
            </div>
            <div className="p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider mb-1">Counties</p>
              <p className="text-2xl font-bold font-mono">
                {demographics.counties_covered}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">with providers</p>
            </div>
          </div>

          {/* Top Counties by 65+ Population */}
          {topCounties && topCounties.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-[var(--color-text-secondary)] mb-3">Top Counties by 65+ Population</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)]">
                      <th className="text-left py-2 px-3 font-medium text-[var(--color-text-muted)]">County</th>
                      <th className="text-right py-2 px-3 font-medium text-[var(--color-text-muted)]">65+ Pop</th>
                      <th className="text-right py-2 px-3 font-medium text-[var(--color-text-muted)]">% 65+</th>
                      <th className="text-right py-2 px-3 font-medium text-[var(--color-text-muted)]">Income</th>
                      <th className="text-right py-2 px-3 font-medium text-[var(--color-text-muted)]">Targets</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(topCounties as any[]).slice(0, 8).map((county, i) => (
                      <tr key={county.county} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-hover)]">
                        <td className="py-2 px-3 font-medium">{county.county}</td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--color-turquoise-400)]">
                          {Number(county.county_pop_65_plus).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right font-mono">
                          <span className={Number(county.county_pct_65_plus) >= 20 ? 'text-emerald-400' : ''}>
                            {county.county_pct_65_plus}%
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right font-mono text-[var(--color-text-muted)]">
                          ${Number(county.county_median_income).toLocaleString()}
                        </td>
                        <td className="py-2 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {Number(county.green_count) > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                                {county.green_count}G
                              </span>
                            )}
                            {Number(county.yellow_count) > 0 && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                                {county.yellow_count}Y
                              </span>
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
      )}

      {/* Market Notes */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-[var(--color-turquoise-400)] mb-3 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {market.name} Market Intelligence
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--color-text-secondary)]">
          <div>
            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Regulatory Environment</h4>
            <ul className="space-y-1">
              {market.notes.regulatory.map((note, i) => (
                <li key={i}>• {note}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Market Characteristics</h4>
            <ul className="space-y-1">
              {market.notes.market.map((note, i) => (
                <li key={i}>• {note}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* City Breakdown */}
      {cityBreakdown.length > 0 && (
        <div className="glass-card rounded-2xl p-6 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[var(--color-turquoise-400)]" />
            City Breakdown
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {(cityBreakdown as any[]).map((city) => (
              <Link
                key={city.city}
                href={`/targets?state=${state.toUpperCase()}&city=${encodeURIComponent(city.city)}`}
                className="p-3 rounded-lg bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-hover)] transition-colors"
              >
                <div className="font-medium text-sm truncate">{city.city}</div>
                <div className="flex items-center gap-2 mt-1">
                  {Number(city.green_count) > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                      {city.green_count} G
                    </span>
                  )}
                  {Number(city.yellow_count) > 0 && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">
                      {city.yellow_count} Y
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          href={`/targets?state=${state.toUpperCase()}&classification=GREEN`}
          className="px-4 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 font-medium text-sm hover:bg-emerald-500/30 transition-colors"
        >
          View GREEN Only →
        </Link>
        <Link
          href={`/targets?state=${state.toUpperCase()}&classification=YELLOW`}
          className="px-4 py-2 rounded-lg bg-amber-500/20 text-amber-400 font-medium text-sm hover:bg-amber-500/30 transition-colors"
        >
          View YELLOW Only →
        </Link>
        <Link
          href={`/targets?state=${state.toUpperCase()}&maxAdc=50`}
          className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)] font-medium text-sm hover:bg-[var(--color-turquoise-500)]/30 transition-colors"
        >
          Small ADC (&lt;50) →
        </Link>
      </div>

      {/* Provider Table */}
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
          {market.name} Targets
        </h2>
        <p className="text-[var(--color-text-muted)]">
          All GREEN and YELLOW classified providers • Click any row for details
        </p>
      </div>

      <ProviderTable providers={targets as any} showAllColumns />
    </div>
  );
}
