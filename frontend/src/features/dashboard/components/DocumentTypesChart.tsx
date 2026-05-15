'use client';

import { useMemo } from 'react';
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  CHART_COLORS,
  ChartContainer,
  ChartTooltip,
  EmptyState,
} from '@/shared/components/data-display';
import { Skeleton } from '@/shared/components/ui';
import type {
  DocumentTypeBucket,
  DocumentTypeBucketCount,
} from '../api/dashboardApi';

// ---------------------------------------------------------------------------
// Type-bucket → display label + color. Monochromatic blue family
// (chart-1 .. chart-5) per the design system rules. No rainbow.
// ---------------------------------------------------------------------------

const BUCKET_META: Record<
  DocumentTypeBucket,
  { label: string; color: string }
> = {
  cv:        { label: 'CV',        color: CHART_COLORS[0] },
  dpi:       { label: 'DPI',       color: CHART_COLORS[2] },
  contrato:  { label: 'Contrato',  color: CHART_COLORS[3] },
  pasaporte: { label: 'Pasaporte', color: CHART_COLORS[4] },
  factura:   { label: 'Factura',   color: CHART_COLORS[5] },
};

interface DocumentTypesChartProps {
  readonly data: DocumentTypeBucketCount[] | undefined;
  readonly loading: boolean;
}

export function DocumentTypesChart({ data, loading }: DocumentTypesChartProps) {
  const total = useMemo(
    () => (data ? data.reduce((acc, d) => acc + d.count, 0) : 0),
    [data],
  );

  return (
    <ChartContainer title="Tipos de documentos" description="Últimos 7 días">
      {loading ? (
        <Skeleton className="h-[260px] w-full" />
      ) : !data || total === 0 ? (
        <EmptyState
          title="Sin documentos procesados esta semana"
          description="Cuando proceses CVs, DPIs, contratos, pasaportes o facturas aparecerán acá."
        />
      ) : (
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-[180px] h-[180px] shrink-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="count"
                  nameKey="type"
                  innerRadius={56}
                  outerRadius={84}
                  paddingAngle={2}
                  stroke="var(--color-surface-card)"
                  strokeWidth={2}
                  isAnimationActive={false}
                >
                  {data.map((entry) => (
                    <Cell key={entry.type} fill={BUCKET_META[entry.type].color} />
                  ))}
                </Pie>
                <Tooltip
                  content={
                    <ChartTooltip
                      valueFormatter={(v) => (v === undefined ? '' : String(v))}
                    />
                  }
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-h2 text-fg-primary leading-none tabular-nums">
                {total}
              </span>
              <span className="text-caption text-fg-tertiary mt-1">Total</span>
            </div>
          </div>

          <ul className="flex flex-col gap-2 min-w-0 flex-1">
            {data.map((entry) => (
              <li
                key={entry.type}
                className="flex items-center justify-between gap-3 text-body-sm"
              >
                <span className="flex items-center gap-2 text-fg-secondary min-w-0">
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: BUCKET_META[entry.type].color }}
                    aria-hidden="true"
                  />
                  <span className="truncate">{BUCKET_META[entry.type].label}</span>
                </span>
                <span className="text-fg-primary tabular-nums">
                  {entry.count}{' '}
                  <span className="text-fg-tertiary">
                    ({entry.percentage.toFixed(1)}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartContainer>
  );
}
