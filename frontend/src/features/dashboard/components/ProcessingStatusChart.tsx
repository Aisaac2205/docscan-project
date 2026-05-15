'use client';

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CHART_COLORS,
  ChartContainer,
  ChartTooltip,
  EmptyState,
} from '@/shared/components/data-display';
import { Skeleton } from '@/shared/components/ui';
import type {
  ProcessingStatusBucket,
  ProcessingStatusBucketCount,
} from '../api/dashboardApi';

// ---------------------------------------------------------------------------
// Status-bucket → display label + color.
// "error" uses the only semantic exception allowed in charts (danger-fg).
// ---------------------------------------------------------------------------

const BUCKET_META: Record<
  ProcessingStatusBucket,
  { label: string; color: string }
> = {
  completado: { label: 'Completados',     color: CHART_COLORS[0] },
  pendiente:  { label: 'Pendientes',      color: CHART_COLORS[2] },
  revision:   { label: 'Revisión manual', color: CHART_COLORS[4] },
  error:      { label: 'Error OCR',       color: 'var(--color-danger-fg)' },
};

interface ChartDatum {
  bucket: ProcessingStatusBucket;
  label: string;
  count: number;
  percentage: number;
  fill: string;
}

interface ProcessingStatusChartProps {
  readonly data: ProcessingStatusBucketCount[] | undefined;
  readonly loading: boolean;
}

export function ProcessingStatusChart({
  data,
  loading,
}: ProcessingStatusChartProps) {
  const total = data ? data.reduce((acc, d) => acc + d.count, 0) : 0;

  return (
    <ChartContainer
      title="Estado del procesamiento"
      description="Estado actual de todos los documentos"
    >
      {loading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : !data || total === 0 ? (
        <EmptyState
          title="Sin documentos registrados"
          description="Cuando proceses tu primer documento aparecerá el desglose por estado."
        />
      ) : (
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart
              layout="vertical"
              data={toChartData(data)}
              margin={{ top: 4, right: 56, bottom: 4, left: 8 }}
              barCategoryGap={12}
            >
              <XAxis type="number" hide />
              <YAxis
                type="category"
                dataKey="label"
                stroke="var(--color-fg-tertiary)"
                tickLine={false}
                axisLine={false}
                width={120}
                style={{ fontSize: 13 }}
              />
              <Tooltip
                content={<ChartTooltip />}
                cursor={{ fill: 'var(--color-surface-sunken)' }}
              />
              <Bar
                dataKey="count"
                name="Cantidad"
                radius={[2, 2, 2, 2]}
                isAnimationActive={false}
                label={{
                  position: 'right',
                  fill: 'var(--color-fg-secondary)',
                  fontSize: 12,
                  formatter: (value: unknown) => {
                    if (typeof value !== 'number') return '';
                    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                    return `${value}  ·  ${pct}%`;
                  },
                }}
              >
                {data.map((entry) => (
                  <Cell key={entry.status} fill={BUCKET_META[entry.status].color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartContainer>
  );
}

function toChartData(data: ProcessingStatusBucketCount[]): ChartDatum[] {
  return data.map((d) => ({
    bucket: d.status,
    label: BUCKET_META[d.status].label,
    count: d.count,
    percentage: d.percentage,
    fill: BUCKET_META[d.status].color,
  }));
}
