'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface ScoreData {
  range: string;
  total: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
}

interface ScoreDistributionChartProps {
  data: ScoreData[];
}

export function ScoreDistributionChart({ data }: ScoreDistributionChartProps) {
  const chartData = data.map(d => ({
    range: d.range,
    total: Number(d.total),
    GREEN: Number(d.green_count),
    YELLOW: Number(d.yellow_count),
    RED: Number(d.red_count),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">
        Score Distribution
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">Overall score ranges by classification</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} stackOffset="none">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis
              dataKey="range"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="glass-card rounded-lg p-3 border border-[var(--color-border)]">
                      <p className="font-semibold text-[var(--color-text-primary)] mb-2">Score: {label}</p>
                      {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.stroke }}>
                          {entry.name}: {entry.value.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="GREEN"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="YELLOW"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="RED"
              stackId="1"
              stroke="#ef4444"
              fill="#ef4444"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
