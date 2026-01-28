'use client';

import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamic import to avoid SSR issues with Leaflet
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
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);
const GeoJSON = dynamic(
  () => import('react-leaflet').then((mod) => mod.GeoJSON),
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
  county_pop_65_plus: number | null;
  county_pct_65_plus: number | null;
}

interface HeatmapPoint {
  county: string;
  state: string;
  county_pop_65_plus: number;
  county_pct_65_plus: number;
  lat: number;
  lng: number;
  green_count: number;
  yellow_count: number;
}

interface MapViewProps {
  showHeatmap?: boolean;
  classification?: 'GREEN' | 'YELLOW' | 'ALL';
  onProviderClick?: (ccn: string) => void;
}

export function MapView({ showHeatmap = true, classification = 'ALL', onProviderClick }: MapViewProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [heatmapData, setHeatmapData] = useState<HeatmapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [statesGeoJson, setStatesGeoJson] = useState<any>(null);

  useEffect(() => {
    // Load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    // Add pulsing animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse-green {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.3); opacity: 1; }
      }
      @keyframes pulse-yellow {
        0%, 100% { transform: scale(1); opacity: 0.9; }
        50% { transform: scale(1.2); opacity: 1; }
      }
      .pulse-green-marker {
        animation: pulse-green 2s ease-in-out infinite;
      }
      .pulse-yellow-marker {
        animation: pulse-yellow 2.5s ease-in-out infinite;
      }
    `;
    document.head.appendChild(style);
    setMapReady(true);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(style);
    };
  }, []);

  useEffect(() => {
    // Fetch US States GeoJSON
    async function fetchStates() {
      try {
        const response = await fetch('https://raw.githubusercontent.com/PublicaMundi/MappingAPI/master/data/geojson/us-states.json');
        const data = await response.json();
        setStatesGeoJson(data);
      } catch (error) {
        console.error('Error fetching states GeoJSON:', error);
      }
    }
    fetchStates();
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        const classParam = classification === 'ALL' ? '' : `&classification=${classification}`;
        const response = await fetch(`/api/map?heatmap=${showHeatmap}${classParam}`);
        const data = await response.json();
        setProviders(data.providers || []);
        setHeatmapData(data.heatmapData || []);
      } catch (error) {
        console.error('Error fetching map data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [showHeatmap, classification]);

  const greenProviders = useMemo(
    () => providers.filter((p) => p.classification === 'GREEN'),
    [providers]
  );

  const yellowProviders = useMemo(
    () => providers.filter((p) => p.classification === 'YELLOW'),
    [providers]
  );

  // Calculate top 5% thresholds for pulsing markers
  const { greenTop5Threshold, yellowTop5Threshold } = useMemo(() => {
    const sortedGreen = [...greenProviders].sort((a, b) => b.overall_score - a.overall_score);
    const sortedYellow = [...yellowProviders].sort((a, b) => b.overall_score - a.overall_score);

    const greenTop5Index = Math.ceil(sortedGreen.length * 0.05);
    const yellowTop5Index = Math.ceil(sortedYellow.length * 0.05);

    return {
      greenTop5Threshold: sortedGreen[greenTop5Index]?.overall_score || 100,
      yellowTop5Threshold: sortedYellow[yellowTop5Index]?.overall_score || 100,
    };
  }, [greenProviders, yellowProviders]);

  const stateStyle = {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#4b5563',
    weight: 1,
    opacity: 0.6,
  };

  if (loading || !mapReady) {
    return (
      <div className="w-full h-[600px] rounded-2xl bg-[var(--color-bg-secondary)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--color-turquoise-400)] mx-auto mb-2" />
          <p className="text-[var(--color-text-muted)]">Loading map data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-[var(--color-border)]">
      <MapContainer
        center={[39.8283, -98.5795]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* State Outlines */}
        {statesGeoJson && (
          <GeoJSON data={statesGeoJson} style={stateStyle} />
        )}

        {/* Heatmap Layer - 65+ Population */}
        {showHeatmap &&
          heatmapData.map((point) => (
            <Circle
              key={`heat-${point.county}-${point.state}`}
              center={[point.lat, point.lng]}
              radius={Math.sqrt(point.county_pop_65_plus) * 100}
              pathOptions={{
                fillColor: '#f97316',
                fillOpacity: 0.15,
                stroke: false,
              }}
            />
          ))}

        {/* YELLOW Markers (render first so GREEN appears on top) */}
        {yellowProviders.map((provider) => {
          const isTop5 = provider.overall_score >= yellowTop5Threshold;
          return (
            <CircleMarker
              key={provider.ccn}
              center={[provider.latitude, provider.longitude]}
              radius={isTop5 ? 10 : 6}
              pathOptions={{
                fillColor: '#f59e0b',
                fillOpacity: isTop5 ? 1 : 0.9,
                color: isTop5 ? '#fbbf24' : '#d97706',
                weight: isTop5 ? 3 : 2,
                className: isTop5 ? 'pulse-yellow-marker' : '',
              }}
              eventHandlers={{
                click: () => onProviderClick?.(provider.ccn),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-amber-600">{provider.provider_name}</p>
                  <p className="text-gray-600">
                    {provider.city}, {provider.state}
                  </p>
                  <p className="text-gray-500">
                    Score: {provider.overall_score} | ADC: {provider.estimated_adc || 'N/A'}
                  </p>
                  <p className="text-xs text-amber-500 font-medium mt-1">
                    {isTop5 ? 'TOP 5% ' : ''}YELLOW - Click for details
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* GREEN Markers */}
        {greenProviders.map((provider) => {
          const isTop5 = provider.overall_score >= greenTop5Threshold;
          return (
            <CircleMarker
              key={provider.ccn}
              center={[provider.latitude, provider.longitude]}
              radius={isTop5 ? 12 : 8}
              pathOptions={{
                fillColor: isTop5 ? '#34d399' : '#10b981',
                fillOpacity: isTop5 ? 1 : 0.9,
                color: isTop5 ? '#6ee7b7' : '#059669',
                weight: isTop5 ? 3 : 2,
                className: isTop5 ? 'pulse-green-marker' : '',
              }}
              eventHandlers={{
                click: () => onProviderClick?.(provider.ccn),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold text-emerald-600">{provider.provider_name}</p>
                  <p className="text-gray-600">
                    {provider.city}, {provider.state}
                  </p>
                  <p className="text-gray-500">
                    Score: {provider.overall_score} | ADC: {provider.estimated_adc || 'N/A'}
                  </p>
                  <p className="text-xs text-emerald-500 font-medium mt-1">
                    {isTop5 ? 'TOP 5% ' : ''}GREEN - Click for details
                  </p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
