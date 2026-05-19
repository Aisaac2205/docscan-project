'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
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
import { useElementSize } from '@/shared/hooks/useElementSize';
export interface WeeklySeriesSpec {
  /** Key del datapoint en el array de data. */
  readonly key: string;
  /** Nombre legible para Legend/Tooltip. */
  readonly name: string;
  /** Color stroke + base del fill gradient. */
  readonly color: string;
}

const DEFAULT_SERIES: readonly WeeklySeriesSpec[] = [
  { key: 'procesados', name: 'Procesados', color: CHART_COLORS[0] },
  { key: 'validados', name: 'Validados', color: CHART_COLORS[1] },
];

// Genérico para que módulos como Salud puedan reutilizarlo con sus propias keys.
// Loose por diseño — el caller garantiza que cada series.key existe como number en cada datapoint.
export interface WeeklyChartPoint {
  readonly day: string;
}

interface WeeklyProcessingChartProps {
  readonly data: readonly WeeklyChartPoint[] | undefined;
  readonly loading: boolean;
  readonly title?: string;
  readonly description?: string;
  readonly series?: readonly WeeklySeriesSpec[];
  /** ID prefix de los <linearGradient>. Único por instancia para evitar colisiones SVG. */
  readonly gradientIdPrefix?: string;
  readonly emptyTitle?: string;
  readonly emptyDescription?: string;
}

export function WeeklyProcessingChart({
  data,
  loading,
  title = 'Procesamiento semanal',
  description = 'Últimos 7 días',
  series = DEFAULT_SERIES,
  gradientIdPrefix = 'weekly',
  emptyTitle = 'Sin documentos procesados',
  emptyDescription = 'Aún no hay actividad en los últimos 7 días.',
}: WeeklyProcessingChartProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const ready = size.width > 0 && size.height > 0;

  return (
    <ChartContainer title={title} description={description}>
      {loading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : !data || isAllZero(data, series) ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div ref={ref} className="h-[260px] w-full">
          {ready && (
            <AreaChart
              width={size.width}
              height={size.height}
              data={data as unknown as WeeklyChartPoint[]}
              margin={{ top: 8, right: 8, bottom: 0, left: -16 }}
            >
              <defs>
                {series.map((s) => (
                  <linearGradient
                    key={s.key}
                    id={`${gradientIdPrefix}-${s.key}-gradient`}
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
              {series.map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#${gradientIdPrefix}-${s.key}-gradient)`}
                  activeDot={{ r: 4 }}
                  isAnimationActive
                  animationDuration={600}
                  animationEasing="ease-out"
                />
              ))}
            </AreaChart>
          )}
        </div>
      )}
    </ChartContainer>
  );
}

function isAllZero(
  data: readonly WeeklyChartPoint[],
  series: readonly WeeklySeriesSpec[],
): boolean {
  return data.every((p) =>
    series.every((s) => {
      const v = (p as unknown as Record<string, unknown>)[s.key];
      return typeof v === 'number' ? v === 0 : true;
    }),
  );
}
