'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface AdcData {
  range: string;
  total: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
}

interface AdcDistributionChartProps {
  data: AdcData[];
}

export function AdcDistributionChart({ data }: AdcDistributionChartProps) {
  const chartData = data.map(d => ({
    range: d.range,
    GREEN: Number(d.green_count),
    YELLOW: Number(d.yellow_count),
    RED: Number(d.red_count),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">
        ADC Distribution
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">Average Daily Census by classification</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
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
                      <p className="font-semibold text-[var(--color-text-primary)] mb-2">ADC: {label}</p>
                      {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm" style={{ color: entry.fill }}>
                          {entry.name}: {entry.value.toLocaleString()}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) => (
                <span className="text-[var(--color-text-secondary)] text-sm">{value}</span>
              )}
            />
            <Bar dataKey="GREEN" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="YELLOW" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            <Bar dataKey="RED" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 pt-4 border-t border-[var(--color-border)]">
        <p className="text-sm text-[var(--color-text-muted)]">
          <span className="text-emerald-500 font-semibold">Target Profile:</span> ADC under 60 — highlighted ranges show acquisition sweet spot
        </p>
      </div>
    </motion.div>
  );
}
