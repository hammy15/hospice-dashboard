'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';

interface StateData {
  state: string;
  green_count: number;
  yellow_count: number;
  red_count: number;
  total: number;
  is_con_state: boolean;
}

interface StateChartProps {
  data: StateData[];
}

export function StateChart({ data }: StateChartProps) {
  const chartData = data.slice(0, 15).map(d => ({
    state: d.state + (d.is_con_state ? '*' : ''),
    GREEN: Number(d.green_count),
    YELLOW: Number(d.yellow_count),
    isCon: d.is_con_state,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const isCon = label.endsWith('*');
      const state = isCon ? label.slice(0, -1) : label;
      return (
        <div className="glass-card p-3 rounded-lg">
          <p className="font-semibold text-[var(--color-text-primary)]">
            {state} {isCon && <span className="text-[var(--color-turquoise-400)]">(CON)</span>}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.fill }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-1">
        Targets by State
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        * indicates CON state
      </p>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis
              dataKey="state"
              type="category"
              stroke="#64748b"
              fontSize={12}
              width={45}
              tick={({ x, y, payload }) => (
                <text
                  x={x}
                  y={y}
                  dy={4}
                  textAnchor="end"
                  fill={payload.value.endsWith('*') ? '#00e5c7' : '#94a3b8'}
                  fontSize={12}
                  fontWeight={payload.value.endsWith('*') ? 600 : 400}
                >
                  {payload.value}
                </text>
              )}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 229, 199, 0.05)' }} />
            <Bar dataKey="GREEN" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="YELLOW" stackId="a" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-emerald-500" />
          <span className="text-sm text-[var(--color-text-secondary)]">GREEN</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-amber-500" />
          <span className="text-sm text-[var(--color-text-secondary)]">YELLOW</span>
        </div>
      </div>
    </motion.div>
  );
}
