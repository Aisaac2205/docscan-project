'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHART_COLORS,
  ChartLegend,
  ChartTooltip,
} from '@/shared/components/data-display';

const data = [
  { month: 'Ene', procesados: 240, pendientes: 32, errores: 4 },
  { month: 'Feb', procesados: 312, pendientes: 28, errores: 7 },
  { month: 'Mar', procesados: 289, pendientes: 41, errores: 3 },
  { month: 'Abr', procesados: 410, pendientes: 22, errores: 2 },
  { month: 'May', procesados: 388, pendientes: 30, errores: 5 },
  { month: 'Jun', procesados: 452, pendientes: 19, errores: 1 },
];

export function DocumentsLineChart() {
  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
          <XAxis
            dataKey="month"
            stroke="var(--color-fg-tertiary)"
            tickLine={false}
            axisLine={false}
            style={{ fontSize: 12 }}
          />
          <YAxis
            stroke="var(--color-fg-tertiary)"
            tickLine={false}
            axisLine={false}
            style={{ fontSize: 12 }}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border)' }} />
          <Legend content={<ChartLegend />} />
          <Line
            type="monotone"
            dataKey="procesados"
            stroke={CHART_COLORS[0]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="pendientes"
            stroke={CHART_COLORS[1]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="errores"
            stroke={CHART_COLORS[2]}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
