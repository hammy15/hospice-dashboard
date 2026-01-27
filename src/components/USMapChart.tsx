'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface StateData {
  state: string;
  total: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
  is_con_state: boolean;
  avg_score: number;
}

interface USMapChartProps {
  data: StateData[];
}

// State abbreviation to path data mapping (simplified US map)
const statePaths: Record<string, { d: string; x: number; y: number }> = {
  WA: { d: 'M 58 22 L 100 22 L 100 50 L 58 50 Z', x: 79, y: 36 },
  OR: { d: 'M 58 52 L 100 52 L 100 88 L 58 88 Z', x: 79, y: 70 },
  CA: { d: 'M 58 90 L 95 90 L 95 170 L 58 170 Z', x: 76, y: 130 },
  NV: { d: 'M 97 70 L 125 70 L 125 130 L 97 130 Z', x: 111, y: 100 },
  AZ: { d: 'M 97 132 L 138 132 L 138 180 L 97 180 Z', x: 117, y: 156 },
  UT: { d: 'M 127 70 L 158 70 L 158 115 L 127 115 Z', x: 142, y: 92 },
  ID: { d: 'M 102 22 L 138 22 L 138 68 L 102 68 Z', x: 120, y: 45 },
  MT: { d: 'M 140 22 L 210 22 L 210 58 L 140 58 Z', x: 175, y: 40 },
  WY: { d: 'M 160 60 L 215 60 L 215 98 L 160 98 Z', x: 187, y: 79 },
  CO: { d: 'M 160 100 L 220 100 L 220 145 L 160 145 Z', x: 190, y: 122 },
  NM: { d: 'M 140 147 L 195 147 L 195 200 L 140 200 Z', x: 167, y: 173 },
  TX: { d: 'M 197 155 L 290 155 L 290 250 L 197 250 Z', x: 243, y: 202 },
  OK: { d: 'M 222 145 L 285 145 L 285 175 L 222 175 Z', x: 253, y: 160 },
  KS: { d: 'M 222 105 L 285 105 L 285 143 L 222 143 Z', x: 253, y: 124 },
  NE: { d: 'M 217 72 L 285 72 L 285 103 L 217 103 Z', x: 251, y: 87 },
  SD: { d: 'M 217 42 L 280 42 L 280 70 L 217 70 Z', x: 248, y: 56 },
  ND: { d: 'M 217 18 L 280 18 L 280 40 L 217 40 Z', x: 248, y: 29 },
  MN: { d: 'M 282 18 L 330 18 L 330 75 L 282 75 Z', x: 306, y: 46 },
  IA: { d: 'M 287 75 L 340 75 L 340 110 L 287 110 Z', x: 313, y: 92 },
  MO: { d: 'M 287 112 L 345 112 L 345 160 L 287 160 Z', x: 316, y: 136 },
  AR: { d: 'M 292 162 L 340 162 L 340 200 L 292 200 Z', x: 316, y: 181 },
  LA: { d: 'M 292 202 L 340 202 L 340 245 L 292 245 Z', x: 316, y: 223 },
  WI: { d: 'M 332 35 L 375 35 L 375 85 L 332 85 Z', x: 353, y: 60 },
  IL: { d: 'M 342 87 L 380 87 L 380 145 L 342 145 Z', x: 361, y: 116 },
  MS: { d: 'M 342 177 L 375 177 L 375 235 L 342 235 Z', x: 358, y: 206 },
  MI: { d: 'M 375 38 L 420 38 L 420 95 L 375 95 Z', x: 397, y: 66 },
  IN: { d: 'M 382 90 L 415 90 L 415 140 L 382 140 Z', x: 398, y: 115 },
  KY: { d: 'M 380 140 L 435 140 L 435 165 L 380 165 Z', x: 407, y: 152 },
  TN: { d: 'M 347 165 L 430 165 L 430 188 L 347 188 Z', x: 388, y: 176 },
  AL: { d: 'M 377 190 L 410 190 L 410 240 L 377 240 Z', x: 393, y: 215 },
  OH: { d: 'M 417 90 L 455 90 L 455 135 L 417 135 Z', x: 436, y: 112 },
  GA: { d: 'M 412 190 L 455 190 L 455 245 L 412 245 Z', x: 433, y: 217 },
  FL: { d: 'M 420 247 L 475 247 L 475 310 L 420 310 Z', x: 447, y: 278 },
  SC: { d: 'M 437 175 L 480 175 L 480 205 L 437 205 Z', x: 458, y: 190 },
  NC: { d: 'M 432 155 L 500 155 L 500 178 L 432 178 Z', x: 466, y: 166 },
  VA: { d: 'M 437 130 L 500 130 L 500 155 L 437 155 Z', x: 468, y: 142 },
  WV: { d: 'M 455 115 L 480 115 L 480 140 L 455 140 Z', x: 467, y: 127 },
  PA: { d: 'M 455 85 L 510 85 L 510 115 L 455 115 Z', x: 482, y: 100 },
  NY: { d: 'M 460 50 L 520 50 L 520 85 L 460 85 Z', x: 490, y: 67 },
  NJ: { d: 'M 502 92 L 525 92 L 525 120 L 502 120 Z', x: 513, y: 106 },
  CT: { d: 'M 508 72 L 532 72 L 532 88 L 508 88 Z', x: 520, y: 80 },
  RI: { d: 'M 525 72 L 540 72 L 540 85 L 525 85 Z', x: 532, y: 78 },
  MA: { d: 'M 515 58 L 545 58 L 545 72 L 515 72 Z', x: 530, y: 65 },
  VT: { d: 'M 497 38 L 515 38 L 515 60 L 497 60 Z', x: 506, y: 49 },
  NH: { d: 'M 515 38 L 532 38 L 532 58 L 515 58 Z', x: 523, y: 48 },
  ME: { d: 'M 530 20 L 560 20 L 560 55 L 530 55 Z', x: 545, y: 37 },
  MD: { d: 'M 482 118 L 515 118 L 515 135 L 482 135 Z', x: 498, y: 126 },
  DE: { d: 'M 498 110 L 515 110 L 515 125 L 498 125 Z', x: 506, y: 117 },
  AK: { d: 'M 85 230 L 155 230 L 155 290 L 85 290 Z', x: 120, y: 260 },
  HI: { d: 'M 160 265 L 210 265 L 210 295 L 160 295 Z', x: 185, y: 280 },
};

export function USMapChart({ data }: USMapChartProps) {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);

  const getStateColor = (stateCode: string): string => {
    const stateData = data.find(d => d.state === stateCode);
    if (!stateData) return 'var(--color-bg-tertiary)';

    const greenRate = Number(stateData.green_count) / Number(stateData.total);

    if (greenRate >= 0.1) return 'rgba(16, 185, 129, 0.8)';
    if (greenRate >= 0.05) return 'rgba(16, 185, 129, 0.5)';
    if (greenRate >= 0.02) return 'rgba(245, 158, 11, 0.6)';
    return 'rgba(239, 68, 68, 0.4)';
  };

  const getStateData = (stateCode: string): StateData | undefined => {
    return data.find(d => d.state === stateCode);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">
            Geographic Distribution
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">Provider density by state</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-emerald-500/80"></div>
            <span className="text-[var(--color-text-muted)]">High GREEN %</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-amber-500/60"></div>
            <span className="text-[var(--color-text-muted)]">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm bg-red-500/40"></div>
            <span className="text-[var(--color-text-muted)]">Low</span>
          </div>
        </div>
      </div>

      <div className="relative">
        <svg viewBox="0 0 580 320" className="w-full h-auto">
          {Object.entries(statePaths).map(([stateCode, pathData]) => {
            const stateData = getStateData(stateCode);
            return (
              <g key={stateCode}>
                <rect
                  x={parseFloat(pathData.d.split(' ')[1])}
                  y={parseFloat(pathData.d.split(' ')[2])}
                  width={parseFloat(pathData.d.split(' ')[4]) - parseFloat(pathData.d.split(' ')[1])}
                  height={parseFloat(pathData.d.split(' ')[5]) - parseFloat(pathData.d.split(' ')[2])}
                  fill={getStateColor(stateCode)}
                  stroke={stateData?.is_con_state ? 'var(--color-turquoise-400)' : 'var(--color-border)'}
                  strokeWidth={stateData?.is_con_state ? 2 : 1}
                  rx={3}
                  className="cursor-pointer transition-all duration-200 hover:opacity-80"
                  onMouseEnter={() => stateData && setHoveredState(stateData)}
                  onMouseLeave={() => setHoveredState(null)}
                />
                <text
                  x={pathData.x}
                  y={pathData.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[8px] font-semibold fill-[var(--color-text-primary)] pointer-events-none"
                >
                  {stateCode}
                </text>
              </g>
            );
          })}
        </svg>

        {hoveredState && (
          <div className="absolute top-4 right-4 glass-card rounded-lg p-4 border border-[var(--color-border)] min-w-[180px]">
            <p className="font-semibold text-[var(--color-text-primary)] mb-2 flex items-center gap-2">
              {hoveredState.state}
              {hoveredState.is_con_state && (
                <span className="text-xs bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-500)] px-2 py-0.5 rounded">CON</span>
              )}
            </p>
            <div className="space-y-1 text-sm">
              <p className="text-[var(--color-text-secondary)]">
                Total: <span className="font-mono">{Number(hoveredState.total).toLocaleString()}</span>
              </p>
              <p className="text-emerald-500">
                GREEN: <span className="font-mono">{Number(hoveredState.green_count)}</span>
              </p>
              <p className="text-amber-500">
                YELLOW: <span className="font-mono">{Number(hoveredState.yellow_count)}</span>
              </p>
              <p className="text-red-500">
                RED: <span className="font-mono">{Number(hoveredState.red_count)}</span>
              </p>
              <p className="text-[var(--color-text-muted)] pt-1 border-t border-[var(--color-border)]">
                Avg Score: <span className="font-mono">{hoveredState.avg_score}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex items-center gap-4">
        <p className="text-sm text-[var(--color-text-muted)]">
          <span className="text-[var(--color-turquoise-500)] font-semibold">CON States</span> highlighted with turquoise border
        </p>
      </div>
    </motion.div>
  );
}
