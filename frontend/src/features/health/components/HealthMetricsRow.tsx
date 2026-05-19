'use client';

import { StatCard } from '@/shared/components/data-display/StatCard';
import type { HealthMetrics } from '../hooks/useHealthMetrics';

interface HealthMetricsRowProps {
  metrics: HealthMetrics;
  loading?: boolean;
}

function MetricSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="flex flex-col gap-2 rounded-lg bg-surface-card p-5 border border-border animate-pulse"
    >
      <div className="h-3 w-24 rounded bg-surface-sunken" />
      <div className="h-8 w-16 rounded bg-surface-sunken" />
      <div className="h-3 w-20 rounded bg-surface-sunken" />
    </div>
  );
}

function formatHours(value: number | null): string {
  if (value === null) return '—';
  if (value < 1) return `${Math.round(value * 60)} min`;
  if (value < 48) return `${value.toFixed(1)} h`;
  return `${Math.round(value / 24)} d`;
}

export function HealthMetricsRow({ metrics, loading = false }: HealthMetricsRowProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
        <MetricSkeleton />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-5">
      <StatCard
        label="Pendientes de validar"
        value={metrics.pending.value}
        delta={metrics.pending.delta}
        deltaLabel="vs mes anterior"
        sparkline={metrics.pending.sparkline}
        sparklineVariant="bar"
        sparklineColor="var(--color-accent-500)"
      />
      <StatCard
        label="Constancias este mes"
        value={metrics.createdThisMonth.value}
        delta={metrics.createdThisMonth.delta}
        deltaLabel="vs mes anterior"
        sparkline={metrics.createdThisMonth.sparkline}
        sparklineVariant="bar"
      />
      <StatCard
        label="Validadas este mes"
        value={metrics.validatedThisMonth.value}
        delta={metrics.validatedThisMonth.delta}
        deltaLabel="vs mes anterior"
        sparklineVariant="bar"
      />
      <StatCard
        label="Tiempo promedio de validación"
        value={formatHours(metrics.avgValidationHours.value)}
        delta={metrics.avgValidationHours.delta}
        deltaLabel="vs mes anterior"
        sparkline={metrics.avgValidationHours.sparkline}
        sparklineVariant="bar"
      />
    </div>
  );
}
