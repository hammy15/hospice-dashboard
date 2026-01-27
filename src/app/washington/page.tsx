import { getWashingtonTargets } from '@/lib/db';
import { ProviderTable } from '@/components/ProviderTable';
import { StatCard } from '@/components/StatCard';
import { MapPin } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function WashingtonPage() {
  const waTargets = await getWashingtonTargets();

  const greenCount = waTargets.filter((p: any) => p.classification === 'GREEN').length;
  const yellowCount = waTargets.filter((p: any) => p.classification === 'YELLOW').length;

  return (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-turquoise-500)]/20 flex items-center justify-center">
            <MapPin className="w-6 h-6 text-[var(--color-turquoise-400)]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold font-[family-name:var(--font-display)]">
              <span className="gradient-text">Washington State</span>
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              CON-protected market analysis
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
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
          title="CON State"
          value="Yes"
          subtitle="Certificate of Need required"
          icon="shield"
          variant="default"
        />
        <StatCard
          title="Total Analyzed"
          value={waTargets.length}
          subtitle="GREEN + YELLOW targets"
          icon="map-pin"
        />
      </div>

      <div className="glass-card rounded-2xl p-6 mb-8">
        <h3 className="font-semibold text-[var(--color-turquoise-400)] mb-3">Washington State Market Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[var(--color-text-secondary)]">
          <div>
            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Regulatory Environment</h4>
            <ul className="space-y-1">
              <li>• Certificate of Need (CON) state — significant barrier to new entrants</li>
              <li>• Existing licenses carry substantial strategic value</li>
              <li>• Regulatory moat protects market share</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Market Characteristics</h4>
            <ul className="space-y-1">
              <li>• Mix of urban (Seattle/Tacoma) and rural markets</li>
              <li>• Strong nonprofit presence</li>
              <li>• Growing senior population in Puget Sound region</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl font-bold font-[family-name:var(--font-display)] mb-2">
          Washington Targets
        </h2>
        <p className="text-[var(--color-text-muted)]">
          All GREEN and YELLOW classified providers in Washington
        </p>
      </div>

      <ProviderTable providers={waTargets as any} showAllColumns />
    </div>
  );
}
