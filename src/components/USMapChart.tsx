'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

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

// Grid layout for US states (approximating geographic positions)
const stateGrid: { state: string; row: number; col: number }[] = [
  // Row 0
  { state: 'AK', row: 0, col: 0 },
  { state: 'ME', row: 0, col: 10 },
  // Row 1
  { state: 'WA', row: 1, col: 1 },
  { state: 'MT', row: 1, col: 2 },
  { state: 'ND', row: 1, col: 3 },
  { state: 'MN', row: 1, col: 4 },
  { state: 'WI', row: 1, col: 5 },
  { state: 'MI', row: 1, col: 7 },
  { state: 'VT', row: 1, col: 9 },
  { state: 'NH', row: 1, col: 10 },
  // Row 2
  { state: 'OR', row: 2, col: 1 },
  { state: 'ID', row: 2, col: 2 },
  { state: 'WY', row: 2, col: 3 },
  { state: 'SD', row: 2, col: 4 },
  { state: 'IA', row: 2, col: 5 },
  { state: 'IL', row: 2, col: 6 },
  { state: 'IN', row: 2, col: 7 },
  { state: 'OH', row: 2, col: 8 },
  { state: 'NY', row: 2, col: 9 },
  { state: 'MA', row: 2, col: 10 },
  // Row 3
  { state: 'NV', row: 3, col: 1 },
  { state: 'UT', row: 3, col: 2 },
  { state: 'CO', row: 3, col: 3 },
  { state: 'NE', row: 3, col: 4 },
  { state: 'KS', row: 3, col: 5 },
  { state: 'MO', row: 3, col: 6 },
  { state: 'KY', row: 3, col: 7 },
  { state: 'WV', row: 3, col: 8 },
  { state: 'PA', row: 3, col: 9 },
  { state: 'NJ', row: 3, col: 10 },
  { state: 'CT', row: 3, col: 11 },
  { state: 'RI', row: 3, col: 12 },
  // Row 4
  { state: 'CA', row: 4, col: 1 },
  { state: 'AZ', row: 4, col: 2 },
  { state: 'NM', row: 4, col: 3 },
  { state: 'OK', row: 4, col: 4 },
  { state: 'AR', row: 4, col: 5 },
  { state: 'TN', row: 4, col: 6 },
  { state: 'VA', row: 4, col: 7 },
  { state: 'NC', row: 4, col: 8 },
  { state: 'MD', row: 4, col: 9 },
  { state: 'DE', row: 4, col: 10 },
  // Row 5
  { state: 'HI', row: 5, col: 0 },
  { state: 'TX', row: 5, col: 3 },
  { state: 'LA', row: 5, col: 4 },
  { state: 'MS', row: 5, col: 5 },
  { state: 'AL', row: 5, col: 6 },
  { state: 'GA', row: 5, col: 7 },
  { state: 'SC', row: 5, col: 8 },
  { state: 'FL', row: 5, col: 9 },
  { state: 'DC', row: 5, col: 10 },
];

// CON states list
const conStates = ['AL', 'AR', 'CT', 'GA', 'HI', 'IL', 'KY', 'MD', 'MA', 'MI', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NY', 'NC', 'OH', 'OK', 'OR', 'RI', 'SC', 'TN', 'VT', 'VA', 'WA', 'WV', 'WI'];

export function USMapChart({ data }: USMapChartProps) {
  const [hoveredState, setHoveredState] = useState<StateData | null>(null);
  const router = useRouter();

  const handleStateClick = (stateCode: string) => {
    router.push(`/targets?state=${stateCode}`);
  };

  const getStateData = (stateCode: string): StateData | undefined => {
    return data.find(d => d.state === stateCode);
  };

  const getStateColor = (stateCode: string): string => {
    const stateData = getStateData(stateCode);
    if (!stateData) return 'var(--color-bg-tertiary)';

    const greenRate = Number(stateData.green_count) / Number(stateData.total);

    if (greenRate >= 0.10) return 'rgb(16, 185, 129)'; // emerald-500
    if (greenRate >= 0.07) return 'rgb(52, 211, 153)'; // emerald-400
    if (greenRate >= 0.05) return 'rgb(110, 231, 183)'; // emerald-300
    if (greenRate >= 0.03) return 'rgb(251, 191, 36)'; // amber-400
    return 'rgb(248, 113, 113)'; // red-400
  };

  const maxCol = Math.max(...stateGrid.map(s => s.col));
  const maxRow = Math.max(...stateGrid.map(s => s.row));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-2xl p-6 h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold font-[family-name:var(--font-display)]">
            Geographic Distribution
          </h3>
          <p className="text-sm text-[var(--color-text-muted)]">Click a state to drill down</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-emerald-500"></div>
          <span className="text-[var(--color-text-muted)]">&gt;10% GREEN</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-emerald-400"></div>
          <span className="text-[var(--color-text-muted)]">7-10%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-emerald-300"></div>
          <span className="text-[var(--color-text-muted)]">5-7%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-amber-400"></div>
          <span className="text-[var(--color-text-muted)]">3-5%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-red-400"></div>
          <span className="text-[var(--color-text-muted)]">&lt;3%</span>
        </div>
        <div className="flex items-center gap-1 ml-2 pl-2 border-l border-[var(--color-border)]">
          <div className="w-3 h-3 rounded-sm border-2 border-[var(--color-turquoise-400)] bg-transparent"></div>
          <span className="text-[var(--color-text-muted)]">CON State</span>
        </div>
      </div>

      {/* Grid Map */}
      <div
        className="grid gap-1 mb-4"
        style={{
          gridTemplateColumns: `repeat(${maxCol + 1}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${maxRow + 1}, minmax(0, 1fr))`
        }}
      >
        {stateGrid.map(({ state, row, col }) => {
          const stateData = getStateData(state);
          const isCon = conStates.includes(state);
          const isHovered = hoveredState?.state === state;

          return (
            <motion.div
              key={state}
              style={{ gridRow: row + 1, gridColumn: col + 1 }}
              className={`
                aspect-square rounded-md flex items-center justify-center cursor-pointer
                transition-all duration-200 relative text-[10px] sm:text-xs font-semibold
                ${isCon ? 'ring-2 ring-[var(--color-turquoise-400)]' : ''}
                ${isHovered ? 'ring-2 ring-white scale-110 z-10' : ''}
              `}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleStateClick(state)}
              onMouseEnter={() => stateData && setHoveredState(stateData)}
              onMouseLeave={() => setHoveredState(null)}
            >
              <div
                className="absolute inset-0 rounded-md"
                style={{ backgroundColor: getStateColor(state) }}
              />
              <span className="relative z-10 text-white drop-shadow-md">
                {state}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Hover Info */}
      <div className="min-h-[100px] p-4 rounded-xl bg-[var(--color-bg-tertiary)] border border-[var(--color-border)]">
        {hoveredState ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">{hoveredState.state}</span>
              {conStates.includes(hoveredState.state) && (
                <span className="text-xs bg-[var(--color-turquoise-500)]/20 text-[var(--color-turquoise-500)] px-2 py-0.5 rounded font-medium">
                  CON State
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2 text-sm">
              <div>
                <p className="text-[var(--color-text-muted)] text-xs">Total</p>
                <p className="font-mono font-semibold">{Number(hoveredState.total).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-emerald-500 text-xs">GREEN</p>
                <p className="font-mono font-semibold text-emerald-500">{Number(hoveredState.green_count)}</p>
              </div>
              <div>
                <p className="text-amber-500 text-xs">YELLOW</p>
                <p className="font-mono font-semibold text-amber-500">{Number(hoveredState.yellow_count)}</p>
              </div>
              <div>
                <p className="text-red-500 text-xs">RED</p>
                <p className="font-mono font-semibold text-red-500">{Number(hoveredState.red_count)}</p>
              </div>
            </div>
            <div className="pt-2 border-t border-[var(--color-border)] flex items-center justify-between text-sm">
              <span className="text-[var(--color-text-muted)]">GREEN Rate</span>
              <span className="font-mono font-semibold text-emerald-500">
                {((Number(hoveredState.green_count) / Number(hoveredState.total)) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-[var(--color-text-muted)] text-sm">
            Hover over a state to see details
          </div>
        )}
      </div>
    </motion.div>
  );
}
