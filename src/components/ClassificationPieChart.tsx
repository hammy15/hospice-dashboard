'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface ClassificationPieChartProps {
  greenCount: number;
  yellowCount: number;
  redCount: number;
}

export function ClassificationPieChart({ greenCount, yellowCount, redCount }: ClassificationPieChartProps) {
  const router = useRouter();

  const data = [
    { name: 'GREEN', value: greenCount, color: '#10b981' },
    { name: 'YELLOW', value: yellowCount, color: '#f59e0b' },
    { name: 'RED', value: redCount, color: '#ef4444' },
  ];

  const handleClick = (classification: string) => {
    router.push(`/targets?classification=${classification}`);
  };

  const total = greenCount + yellowCount + redCount;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">
        Classification Breakdown
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">Click a segment to drill down</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
              onClick={(data) => handleClick(data.name)}
              style={{ cursor: 'pointer' }}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} style={{ cursor: 'pointer' }} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="glass-card rounded-lg p-3 border border-[var(--color-border)]">
                      <p className="font-semibold" style={{ color: data.color }}>{data.name}</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {data.value.toLocaleString()} ({((data.value / total) * 100).toFixed(1)}%)
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry: any) => (
                <span className="text-[var(--color-text-secondary)] text-sm">
                  {value}: {entry.payload.value.toLocaleString()}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="text-center">
          <p className="text-2xl font-bold text-emerald-500">{((greenCount / total) * 100).toFixed(1)}%</p>
          <p className="text-xs text-[var(--color-text-muted)]">GREEN Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-amber-500">{((yellowCount / total) * 100).toFixed(1)}%</p>
          <p className="text-xs text-[var(--color-text-muted)]">YELLOW Rate</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-500">{((redCount / total) * 100).toFixed(1)}%</p>
          <p className="text-xs text-[var(--color-text-muted)]">RED Rate</p>
        </div>
      </div>
    </motion.div>
  );
}
