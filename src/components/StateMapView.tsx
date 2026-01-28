'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface Provider {
  ccn: string;
  provider_name: string;
  city: string;
  state: string;
  county: string;
  classification: 'GREEN' | 'YELLOW';
  overall_score: number;
  estimated_adc: number | null;
  latitude: number;
  longitude: number;
}

interface StateMapViewProps {
  state: string;
  className?: string;
}

const STATE_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  WA: { lat: 47.3, lng: -120.5, zoom: 7 },
  OR: { lat: 43.8, lng: -120.5, zoom: 7 },
  CA: { lat: 36.7, lng: -119.4, zoom: 6 },
  MT: { lat: 46.9, lng: -110.4, zoom: 6 },
  NV: { lat: 38.8, lng: -116.4, zoom: 7 },
  TX: { lat: 31.0, lng: -100.0, zoom: 6 },
  FL: { lat: 27.6, lng: -81.5, zoom: 7 },
  NY: { lat: 43.0, lng: -75.5, zoom: 7 },
  PA: { lat: 41.2, lng: -77.2, zoom: 7 },
  OH: { lat: 40.4, lng: -82.9, zoom: 7 },
  IL: { lat: 40.0, lng: -89.0, zoom: 7 },
  MI: { lat: 44.3, lng: -85.6, zoom: 7 },
  GA: { lat: 32.2, lng: -83.4, zoom: 7 },
  NC: { lat: 35.8, lng: -79.0, zoom: 7 },
  AZ: { lat: 34.0, lng: -111.0, zoom: 7 },
};

export function StateMapView({ state, className = '' }: StateMapViewProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  const stateUpper = state.toUpperCase();
  const center = STATE_CENTERS[stateUpper] || { lat: 39.8, lng: -98.5, zoom: 5 };

  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-glow {
        0%, 100% { 
          transform: scale(1); 
          box-shadow: 0 0 10px 3px rgba(16, 185, 129, 0.6);
        }
        50% { 
          transform: scale(1.15); 
          box-shadow: 0 0 20px 8px rgba(16, 185, 129, 0.9);
        }
      }
      .top-provider-marker {
        animation: pulse-glow 2s ease-in-out infinite;
        border: 2px solid #10b981 !important;
      }
    `;
    document.head.appendChild(style);
    setMapReady(true);

    return () => {
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(style)) document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/map?state=' + stateUpper);
        const data = await response.json();
        setProviders(data.providers || []);
      } catch (error) {
        console.error('Error fetching state map data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [stateUpper]);

  const { top15Threshold, greenProviders, yellowProviders } = useMemo(() => {
    const greens = providers.filter(p => p.classification === 'GREEN');
    const yellows = providers.filter(p => p.classification === 'YELLOW');
    
    const allSorted = [...providers].sort((a, b) => (b.overall_score || 0) - (a.overall_score || 0));
    const top15Index = Math.ceil(allSorted.length * 0.15);
    const threshold = allSorted[top15Index]?.overall_score || 100;
    
    return {
      top15Threshold: threshold,
      greenProviders: greens,
      yellowProviders: yellows,
    };
  }, [providers]);

  if (!mapReady || loading) {
    return (
      <div className={'flex items-center justify-center bg-[var(--color-bg-secondary)] rounded-xl ' + className} style={{ minHeight: '400px' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-500)]" />
      </div>
    );
  }

  return (
    <div className={'relative rounded-xl overflow-hidden ' + className}>
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={center.zoom}
        style={{ height: '100%', width: '100%', minHeight: '400px', background: '#1a1a2e' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {yellowProviders.map((provider) => {
          const isTop15 = (provider.overall_score || 0) >= top15Threshold;
          return (
            <CircleMarker
              key={provider.ccn}
              center={[provider.latitude, provider.longitude]}
              radius={isTop15 ? 10 : 7}
              pathOptions={{
                color: isTop15 ? '#10b981' : '#f59e0b',
                fillColor: isTop15 ? '#10b981' : '#f59e0b',
                fillOpacity: isTop15 ? 0.9 : 0.7,
                weight: isTop15 ? 3 : 2,
                className: isTop15 ? 'top-provider-marker' : '',
              }}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-bold text-gray-900">{provider.provider_name}</p>
                  <p className="text-gray-600">{provider.city}, {provider.state}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-100 text-amber-700">
                      YELLOW
                    </span>
                    {isTop15 && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                        TOP 15%
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Score: {provider.overall_score}</p>
                    <p>ADC: {provider.estimated_adc || 'N/A'}</p>
                  </div>
                  <Link 
                    href={'/provider/' + provider.ccn}
                    className="block mt-2 text-center py-1 bg-teal-500 text-white rounded text-xs font-medium hover:bg-teal-600"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {greenProviders.map((provider) => {
          const isTop15 = (provider.overall_score || 0) >= top15Threshold;
          return (
            <CircleMarker
              key={provider.ccn}
              center={[provider.latitude, provider.longitude]}
              radius={isTop15 ? 12 : 8}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: isTop15 ? 1 : 0.8,
                weight: isTop15 ? 4 : 2,
                className: isTop15 ? 'top-provider-marker' : '',
              }}
            >
              <Popup>
                <div className="text-sm min-w-[200px]">
                  <p className="font-bold text-gray-900">{provider.provider_name}</p>
                  <p className="text-gray-600">{provider.city}, {provider.state}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-700">
                      GREEN
                    </span>
                    {isTop15 && (
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-emerald-200 text-emerald-800 animate-pulse">
                        TOP 15%
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <p>Score: {provider.overall_score}</p>
                    <p>ADC: {provider.estimated_adc || 'N/A'}</p>
                  </div>
                  <Link 
                    href={'/provider/' + provider.ccn}
                    className="block mt-2 text-center py-1 bg-teal-500 text-white rounded text-xs font-medium hover:bg-teal-600"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-[var(--color-bg-primary)]/90 backdrop-blur-sm rounded-lg p-3 text-xs z-[1000]">
        <div className="font-semibold mb-2 text-[var(--color-text-primary)]">Legend</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.6)]" />
            <span className="text-[var(--color-text-secondary)]">Top 15% (Glowing)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-[var(--color-text-secondary)]">GREEN Target</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-[var(--color-text-secondary)]">YELLOW Target</span>
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-[var(--color-border)] text-[var(--color-text-muted)]">
          {providers.length} providers shown
        </div>
      </div>
    </div>
  );
}
