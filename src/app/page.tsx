import { getStats, getStateStats, getTopTargets, getOwnershipStats, getAdcDistribution, getScoreDistribution, getMapData, getConStateComparison } from '@/lib/db';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  const [stats, stateStats, topTargets, ownershipStats, adcDistribution, scoreDistribution, mapData, conComparison] = await Promise.all([
    getStats(),
    getStateStats(),
    getTopTargets(5),
    getOwnershipStats(),
    getAdcDistribution(),
    getScoreDistribution(),
    getMapData(),
    getConStateComparison(),
  ]);

  return (
    <DashboardClient
      stats={stats}
      stateStats={stateStats as any}
      topTargets={topTargets as any}
      ownershipStats={ownershipStats as any}
      adcDistribution={adcDistribution as any}
      scoreDistribution={scoreDistribution as any}
      mapData={mapData as any}
      conComparison={conComparison as any}
    />
  );
}
