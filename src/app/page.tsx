import { getStats, getStateStats, getTopTargets, getOwnershipStats, getAdcDistribution, getScoreDistribution, getMapData, getConStateComparison, getEndemicStats, getDealPipelineStats } from '@/lib/db';
import { DashboardClient } from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
  try {
    const [stats, stateStats, topTargets, ownershipStats, adcDistribution, scoreDistribution, mapData, conComparison, endemicStats, pipelineStats] = await Promise.all([
      getStats(),
      getStateStats(),
      getTopTargets(5),
      getOwnershipStats(),
      getAdcDistribution(),
      getScoreDistribution(),
      getMapData(),
      getConStateComparison(),
      getEndemicStats(),
      getDealPipelineStats(),
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
        endemicStats={endemicStats as any}
        pipelineStats={pipelineStats as any}
      />
    );
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Dashboard Error</h1>
        <p className="text-gray-600">Unable to load dashboard data. Please try again later.</p>
        <pre className="mt-4 text-left text-xs bg-gray-100 p-4 rounded overflow-auto max-w-2xl mx-auto">
          {error instanceof Error ? error.message : String(error)}
        </pre>
      </div>
    );
  }
}
