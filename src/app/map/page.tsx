'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapView } from '@/components/MapView';
import { Map, Target, Flame, Eye, EyeOff } from 'lucide-react';

export default function MapPage() {
  const router = useRouter();
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [classification, setClassification] = useState<'GREEN' | 'YELLOW' | 'ALL'>('ALL');

  const handleProviderClick = (ccn: string) => {
    router.push(`/provider/${ccn}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-turquoise-400)] to-[var(--color-turquoise-600)] flex items-center justify-center shadow-lg">
            <Map className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-[family-name:var(--font-display)]">
              <span className="gradient-text">Target Map</span>
            </h1>
            <p className="text-[var(--color-text-secondary)]">
              Interactive map of all acquisition targets with 65+ population heat overlay
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          {/* Classification Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-[var(--color-text-muted)]">Show:</span>
            <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
              <button
                onClick={() => setClassification('ALL')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                  classification === 'ALL'
                    ? 'bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-400)]'
                    : 'hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setClassification('GREEN')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  classification === 'GREEN'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                GREEN
              </button>
              <button
                onClick={() => setClassification('YELLOW')}
                className={`px-3 py-1.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  classification === 'YELLOW'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'hover:bg-[var(--color-bg-hover)]'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                YELLOW
              </button>
            </div>
          </div>

          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showHeatmap
                ? 'bg-orange-500/20 text-orange-400'
                : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-muted)]'
            }`}
          >
            {showHeatmap ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <Flame className="w-4 h-4" />
            65+ Population Heatmap
          </button>
        </div>
      </div>

      {/* Map Legend */}
      <div className="glass-card rounded-xl p-4 mb-6">
        <div className="flex flex-wrap items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 border-2 border-emerald-600"></div>
            <span className="text-[var(--color-text-secondary)]">GREEN Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-400 border-2 border-emerald-300 animate-pulse shadow-lg shadow-emerald-500/50"></div>
            <span className="text-[var(--color-text-secondary)]">Top 5% GREEN</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500 border-2 border-amber-600"></div>
            <span className="text-[var(--color-text-secondary)]">YELLOW Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-amber-400 border-2 border-amber-300 animate-pulse shadow-lg shadow-amber-500/50"></div>
            <span className="text-[var(--color-text-secondary)]">Top 5% YELLOW</span>
          </div>
          {showHeatmap && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-orange-500/30"></div>
              <span className="text-[var(--color-text-secondary)]">65+ Population Density</span>
            </div>
          )}
          <div className="ml-auto text-[var(--color-text-muted)]">
            Click any marker for provider details
          </div>
        </div>
      </div>

      {/* Map */}
      <MapView
        showHeatmap={showHeatmap}
        classification={classification}
        onProviderClick={handleProviderClick}
      />

      {/* Stats Footer */}
      <div className="mt-6 glass-card rounded-xl p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-emerald-400">2,369</p>
            <p className="text-xs text-[var(--color-text-muted)]">Mapped Providers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--color-turquoise-400)]">50</p>
            <p className="text-xs text-[var(--color-text-muted)]">States Covered</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-400">94.2%</p>
            <p className="text-xs text-[var(--color-text-muted)]">Geocode Rate</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-400">Real-time</p>
            <p className="text-xs text-[var(--color-text-muted)]">Data Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}
