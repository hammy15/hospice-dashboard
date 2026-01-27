'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface OwnershipData {
  type: string;
  total: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
}

interface OwnershipChartProps {
  data: OwnershipData[];
}

export function OwnershipChart({ data }: OwnershipChartProps) {
  const router = useRouter();

  const chartData = data.map(d => ({
    name: d.type.length > 20 ? d.type.substring(0, 20) + '...' : d.type,
    fullName: d.type,
    total: Number(d.total),
    green: Number(d.green_count),
    greenRate: Number(d.total) > 0 ? (Number(d.green_count) / Number(d.total) * 100).toFixed(1) : '0',
  }));

  const handleBarClick = (data: any) => {
    if (data && data.fullName) {
      router.push(`/targets?search=${encodeURIComponent(data.fullName)}`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">
        Ownership Types
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">Click to filter by ownership type</p>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ left: 20, right: 20 }}
            onClick={(data) => data?.activePayload?.[0]?.payload && handleBarClick(data.activePayload[0].payload)}
            style={{ cursor: 'pointer' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
            <XAxis
              type="number"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--color-border)' }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 11 }}
              axisLine={{ stroke: 'var(--color-border)' }}
              width={100}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-card rounded-lg p-3 border border-[var(--color-border)]">
                      <p className="font-semibold text-[var(--color-text-primary)] mb-2">{data.fullName}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        Total: {data.total.toLocaleString()}
                      </p>
                      <p className="text-sm text-emerald-500">
                        GREEN: {data.green} ({data.greenRate}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="total" radius={[0, 4, 4, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(0, 229, 199, ${0.3 + (parseFloat(entry.greenRate) / 100) * 0.7})`}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
