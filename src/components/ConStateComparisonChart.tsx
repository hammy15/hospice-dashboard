'use client';

import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface ConData {
  category: string;
  total: number;
  green_count: number;
  yellow_count: number;
  red_count: number;
  avg_score: number;
  avg_adc: number;
}

interface ConStateComparisonChartProps {
  data: ConData[];
}

export function ConStateComparisonChart({ data }: ConStateComparisonChartProps) {
  const conData = data.find(d => d.category === 'CON States');
  const nonConData = data.find(d => d.category === 'Non-CON States');

  if (!conData || !nonConData) return null;

  const conGreenRate = (Number(conData.green_count) / Number(conData.total) * 100);
  const nonConGreenRate = (Number(nonConData.green_count) / Number(nonConData.total) * 100);

  const chartData = [
    {
      name: 'Non-CON States',
      greenRate: nonConGreenRate,
      fill: '#94a3b8',
    },
    {
      name: 'CON States',
      greenRate: conGreenRate,
      fill: '#00e5c7',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-card rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold font-[family-name:var(--font-display)] mb-2">
        CON vs Non-CON States
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-4">GREEN rate comparison</p>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="30%"
            outerRadius="100%"
            barSize={20}
            data={chartData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              background={{ fill: 'var(--color-bg-tertiary)' }}
              dataKey="greenRate"
              cornerRadius={10}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="text-center p-4 rounded-xl bg-[var(--color-turquoise-500)]/10 border border-[var(--color-turquoise-500)]/30">
          <p className="text-2xl font-bold text-[var(--color-turquoise-400)]">{conGreenRate.toFixed(1)}%</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">CON States GREEN</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            {Number(conData.green_count)} of {Number(conData.total).toLocaleString()}
          </p>
        </div>
        <div className="text-center p-4 rounded-xl bg-[var(--color-bg-tertiary)]">
          <p className="text-2xl font-bold text-[var(--color-text-secondary)]">{nonConGreenRate.toFixed(1)}%</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">Non-CON GREEN</p>
          <p className="text-xs text-[var(--color-text-secondary)] mt-2">
            {Number(nonConData.green_count)} of {Number(nonConData.total).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[var(--color-border)]">
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Avg Score (CON)</p>
          <p className="text-lg font-semibold font-mono">{Number(conData.avg_score).toFixed(1)}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-[var(--color-text-muted)]">Avg ADC (CON)</p>
          <p className="text-lg font-semibold font-mono">{Number(conData.avg_adc).toFixed(1)}</p>
        </div>
      </div>
    </motion.div>
  );
}
