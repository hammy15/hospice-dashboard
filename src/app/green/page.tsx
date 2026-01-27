import { getTopTargets, getStats } from '@/lib/db';
import { ProviderTable } from '@/components/ProviderTable';
import { StatCard } from '@/components/StatCard';

export const dynamic = 'force-dynamic';

export default async function GreenPage() {
  const [greenTargets, stats] = await Promise.all([
    getTopTargets(100),
    getStats(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold font-[family-name:var(--font-display)] mb-2">
          <span className="text-emerald-400">GREEN</span> Targets
        </h1>
        <p className="text-[var(--color-text-secondary)] text-lg">
          Strong acquisition candidates — prioritize for outreach
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Total GREEN"
          value={Number(stats.green_count).toLocaleString()}
          subtitle="Acquisition candidates"
          icon="target"
          variant="green"
        />
        <StatCard
          title="In CON States"
          value={Number(stats.green_con_count).toLocaleString()}
          subtitle="Regulatory moat"
          icon="shield"
          variant="default"
        />
        <StatCard
          title="Avg ADC"
          value={stats.avg_green_adc || '—'}
          subtitle="Average Daily Census"
          icon="building"
        />
        <StatCard
          title="Avg Score"
          value={stats.avg_green_score || '—'}
          subtitle="Composite quality"
          icon="trending-up"
        />
      </div>

      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-[var(--color-turquoise-400)] mb-3">GREEN Classification Criteria</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[var(--color-text-secondary)]">
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>ADC within target range (&lt;60)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Quality score ≥70</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Compliance score ≥70</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>3+ confirming signals required</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>CON state bonus applied</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-emerald-400">✓</span>
            <span>Simple ownership preferred</span>
          </div>
        </div>
      </div>

      <ProviderTable providers={greenTargets as any} showAllColumns />
    </div>
  );
}
