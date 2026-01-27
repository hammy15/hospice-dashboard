import { getStats, getStateStats, getTopTargets } from '@/lib/db';
import { StatCard } from '@/components/StatCard';
import { StateChart } from '@/components/StateChart';
import { ProviderTable } from '@/components/ProviderTable';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  const [stats, stateStats, topTargets] = await Promise.all([
    getStats(),
    getStateStats(),
    getTopTargets(10),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          <span className="gradient-text">Acquisition Intelligence</span>
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          6,970 hospice providers analyzed • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} data
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="GREEN Targets"
          value={Number(stats.green_count).toLocaleString()}
          subtitle="Strong acquisition candidates"
          icon="target"
          variant="green"
          delay={0}
        />
        <StatCard
          title="YELLOW Targets"
          value={Number(stats.yellow_count).toLocaleString()}
          subtitle="Require further diligence"
          icon="alert-triangle"
          variant="yellow"
          delay={0.1}
        />
        <StatCard
          title="RED Flagged"
          value={Number(stats.red_count).toLocaleString()}
          subtitle="Poor fit or high risk"
          icon="x-circle"
          variant="red"
          delay={0.2}
        />
        <StatCard
          title="CON State GREEN"
          value={Number(stats.green_con_count).toLocaleString()}
          subtitle={`${((Number(stats.green_con_count) / Number(stats.green_count)) * 100).toFixed(0)}% of GREEN targets`}
          icon="shield"
          variant="default"
          delay={0.3}
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          title="Avg GREEN ADC"
          value={stats.avg_green_adc || '—'}
          subtitle="Average Daily Census"
          icon="building"
          delay={0.4}
        />
        <StatCard
          title="Avg GREEN Score"
          value={stats.avg_green_score || '—'}
          subtitle="Composite quality score"
          icon="trending-up"
          delay={0.5}
        />
        <Link href="/washington" className="block">
          <StatCard
            title="Washington State"
            value="7 GREEN"
            subtitle="CON-protected market focus"
            icon="map-pin"
            delay={0.6}
          />
        </Link>
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <StateChart data={stateStats as any} />

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">
                Quick Stats
              </h3>
              <p className="text-sm text-[var(--color-text-muted)]">Key acquisition metrics</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">Total Providers</span>
              <span className="font-mono font-semibold">{Number(stats.total_count).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">GREEN Rate</span>
              <span className="font-mono font-semibold text-emerald-400">
                {((Number(stats.green_count) / Number(stats.total_count)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">YELLOW Rate</span>
              <span className="font-mono font-semibold text-amber-400">
                {((Number(stats.yellow_count) / Number(stats.total_count)) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-[var(--color-border)]">
              <span className="text-[var(--color-text-secondary)]">CON State Coverage</span>
              <span className="font-mono font-semibold text-[var(--color-turquoise-400)]">
                {((Number(stats.green_con_count) / Number(stats.green_count)) * 100).toFixed(0)}%
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-[var(--color-text-secondary)]">Target Profile Match</span>
              <span className="font-mono font-semibold">ADC &lt; 60</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Targets Preview */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-display)]">
              Top GREEN Targets
            </h2>
            <p className="text-[var(--color-text-muted)]">Highest scoring acquisition candidates</p>
          </div>
          <Link
            href="/green"
            className="px-4 py-2 rounded-lg bg-[var(--color-turquoise-500)]/10 text-[var(--color-turquoise-400)] font-medium text-sm hover:bg-[var(--color-turquoise-500)]/20 transition-colors"
          >
            View All GREEN →
          </Link>
        </div>
        <ProviderTable providers={topTargets as any} />
      </div>

      {/* Data Source Footer */}
      <div className="text-center py-8 border-t border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-text-muted)]">
          Data: CMS Provider Data Catalog (Nov 2025) • PECOS Ownership (Q1 2026)
        </p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          Classification uses conservative methodology — default to YELLOW when uncertain
        </p>
      </div>
    </div>
  );
}
