'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHART_COLORS,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  EmptyState,
} from '@/shared/components/data-display';
import { Skeleton } from '@/shared/components/ui';
import type { WeeklyProcessingPoint } from '../api/dashboardApi';

// ---------------------------------------------------------------------------
// Series → color mapping (chart-1 brand for procesados, chart-2 ink for validados).
// Names below are what shows in the tooltip/legend.
// ---------------------------------------------------------------------------

const SERIES = [
  { key: 'procesados', name: 'Procesados', color: CHART_COLORS[0] },
  { key: 'validados', name: 'Validados', color: CHART_COLORS[1] },
] as const;

interface WeeklyProcessingChartProps {
  readonly data: WeeklyProcessingPoint[] | undefined;
  readonly loading: boolean;
}

export function WeeklyProcessingChart({ data, loading }: WeeklyProcessingChartProps) {
  return (
    <ChartContainer
      title="Procesamiento semanal"
      description="Últimos 7 días"
    >
      {loading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : !data || isAllZero(data) ? (
        <EmptyState
          title="Sin documentos procesados"
          description="Aún no hay actividad en los últimos 7 días."
        />
      ) : (
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
              <defs>
                {SERIES.map((s) => (
                  <linearGradient
                    key={s.key}
                    id={`weekly-${s.key}-gradient`}
                    x1="0" y1="0" x2="0" y2="1"
                  >
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.32} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid stroke="var(--color-border-subtle)" vertical={false} />
              <XAxis
                dataKey="day"
                stroke="var(--color-fg-tertiary)"
                tickLine={false}
                axisLine={false}
                style={{ fontSize: 12 }}
              />
              <YAxis hide />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ stroke: 'var(--color-border)' }}
              />
              <Legend content={<ChartLegend />} />
              {SERIES.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#weekly-${s.key}-gradient)`}
                  activeDot={{ r: 4 }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartContainer>
  );
}

function isAllZero(data: WeeklyProcessingPoint[]): boolean {
  return data.every((p) => p.procesados === 0 && p.validados === 0);
}
