'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

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

// Parse ADC range string to get min/max values
const parseAdcRange = (range: string): { min?: number; max?: number } => {
  if (range === '0-20') return { min: 0, max: 20 };
  if (range === '21-40') return { min: 21, max: 40 };
  if (range === '41-60') return { min: 41, max: 60 };
  if (range === '61-100') return { min: 61, max: 100 };
  if (range === '100+') return { min: 100 };
  return {};
};

export function AdcDistributionChart({ data }: AdcDistributionChartProps) {
  const router = useRouter();

  const chartData = data.map(d => ({
    range: d.range,
    GREEN: Number(d.green_count),
    YELLOW: Number(d.yellow_count),
    RED: Number(d.red_count),
  }));

  const handleBarClick = (data: any) => {
    if (data && data.range) {
      const { min, max } = parseAdcRange(data.range);
      const params = new URLSearchParams();
      if (min !== undefined) params.set('minAdc', String(min));
      if (max !== undefined) params.set('maxAdc', String(max));
      router.push(`/targets?${params.toString()}`);
    }
  };

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
      <p className="text-sm text-[var(--color-text-muted)] mb-4">Click a range to drill down</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barCategoryGap="20%"
            onClick={(data: any) => data?.activePayload?.[0]?.payload && handleBarClick(data.activePayload[0].payload)}
            style={{ cursor: 'pointer' }}
          >
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
            <Bar dataKey="GREEN" fill="#10b981" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} />
            <Bar dataKey="YELLOW" fill="#f59e0b" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} />
            <Bar dataKey="RED" fill="#ef4444" radius={[4, 4, 0, 0]} style={{ cursor: 'pointer' }} />
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
