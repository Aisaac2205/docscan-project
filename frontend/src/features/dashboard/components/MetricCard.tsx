'use client';

import { Card, Skeleton } from '@/shared/components/ui';
import { MiniSparkline } from './MiniSparkline';
import type { MetricDelta, SparklineSeries } from '../api/dashboardApi';
import type { ReactNode } from 'react';

// ---------------------------------------------------------------------------
// Delta display
// ---------------------------------------------------------------------------

interface DeltaDisplayProps {
  readonly delta: MetricDelta;
  /** When `true`, "up" is bad (e.g. "pendientes de revisión" — more is worse) */
  readonly invertPolarity?: boolean;
}

function DeltaDisplay({ delta, invertPolarity = false }: DeltaDisplayProps) {
  if (delta.direction === 'neutral') {
    return (
      <p className="text-caption text-fg-tertiary mt-1">
        Sin variación vs ayer
      </p>
    );
  }

  const isUp = delta.direction === 'up';
  const isGood = invertPolarity ? !isUp : isUp;
  const arrow = isUp ? '↑' : '↓';

  return (
    <p
      className={[
        'text-caption mt-1 font-medium',
        isGood ? 'text-success-fg' : 'text-danger-fg',
      ].join(' ')}
      aria-label={`${isUp ? 'Subió' : 'Bajó'} ${delta.percentage}% comparado con ayer`}
    >
      {arrow} {delta.percentage}% vs ayer
    </p>
  );
}

// ---------------------------------------------------------------------------
// MetricCard — tres estados explícitos
// ---------------------------------------------------------------------------

export interface MetricCardProps {
  readonly icon: ReactNode;
  readonly label: string;
  /**
   * Formatted string to display — e.g. "142", "98.4%", "2.3s".
   * Pass `undefined` when the backend doesn't have the data yet
   * (renders the card with "—", no delta, no sparkline).
   */
  readonly value: string | undefined;
  /**
   * `true`  → skeleton de carga (el fetch aún no terminó).
   * `false` → la respuesta llegó; `value` puede ser un dato real o `undefined`.
   */
  readonly isLoading: boolean;
  readonly delta?: MetricDelta;
  readonly sparkline?: SparklineSeries;
  /**
   * When `true`, a rising delta is semantically negative (e.g. "pendientes de revisión").
   * Defaults to `false`.
   */
  readonly invertPolarity?: boolean;
}

/**
 * MetricCard — tres estados de renderizado:
 *
 * 1. `isLoading === true`
 *    → Skeleton que ocupa el mismo espacio que la card completa.
 *
 * 2. `isLoading === false && value === undefined`
 *    → Card normal con label + icon + "—" como valor.
 *    Sin delta ni sparkline (no hay datos que contextualizar).
 *
 * 3. `isLoading === false && value !== undefined`
 *    → Card completa: label + valor + delta + sparkline.
 */
export function MetricCard({
  icon,
  label,
  value,
  isLoading,
  delta,
  sparkline,
  invertPolarity = false,
}: MetricCardProps) {

  // ── Estado 1: cargando ──────────────────────────────────────────────────
  if (isLoading) {
    return (
      <Card variant="default" className="p-4 md:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-5 rounded-sm" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-7 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-7 w-full rounded-sm" />
      </Card>
    );
  }

  // ── Estado 2: dato no disponible ────────────────────────────────────────
  if (value === undefined) {
    return (
      <Card variant="default" className="p-4 md:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-body-sm text-fg-secondary leading-none truncate">
            {label}
          </span>
          <span className="text-fg-tertiary flex-shrink-0" aria-hidden="true">
            {icon}
          </span>
        </div>
        <p
          className="text-h1 text-fg-disabled leading-none"
          aria-label={`${label}: sin datos`}
        >
          —
        </p>
      </Card>
    );
  }

  // ── Estado 3: card completa ─────────────────────────────────────────────
  return (
    <Card variant="default" className="p-4 md:p-5 flex flex-col gap-3">
      {/* Row 1: label + icon */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm text-fg-secondary leading-none truncate">
          {label}
        </span>
        <span className="text-fg-tertiary flex-shrink-0" aria-hidden="true">
          {icon}
        </span>
      </div>

      {/* Row 2: value + delta */}
      <div>
        <p className="text-h1 text-fg-primary leading-none">{value}</p>
        {delta && <DeltaDisplay delta={delta} invertPolarity={invertPolarity} />}
      </div>

      {/* Row 3: sparkline */}
      {sparkline && (
        <div aria-hidden="true">
          <MiniSparkline values={sparkline} label={`Tendencia 7 días: ${label}`} />
        </div>
      )}
    </Card>
  );
}
