'use client';

import { User, CircleAlert } from 'lucide-react';
import { Card, Skeleton } from '@/shared/components/ui';
import { usePersonMetrics } from '../hooks/usePersonMetrics';

export function PersonMetricsRow() {
  const { metrics, loading, error } = usePersonMetrics();

  return (
    <section aria-labelledby="persons-metrics-heading">
      <h2 id="persons-metrics-heading" className="sr-only">
        Métricas del módulo
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        <MetricCard
          label="Personas activas"
          value={metrics?.activeCount}
          loading={loading}
          icon={<User width={18} height={18} aria-hidden="true" />}
        />
        <MetricCard
          label="Personas con documentos incompletos"
          value={metrics?.incompleteCount}
          loading={loading}
          icon={<CircleAlert width={18} height={18} aria-hidden="true" />}
          tone={metrics && metrics.incompleteCount > 0 ? 'warning' : 'default'}
        />
      </div>
      {error && (
        <p role="alert" className="mt-2 text-caption text-danger-fg">
          {error}
        </p>
      )}
    </section>
  );
}

interface MetricCardProps {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ReactNode;
  tone?: 'default' | 'warning';
}

function MetricCard({ label, value, loading, icon, tone = 'default' }: MetricCardProps) {
  if (loading) {
    return (
      <Card variant="default" className="p-4 md:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-5 w-5 rounded-sm" />
        </div>
        <Skeleton className="h-8 w-16" />
      </Card>
    );
  }

  const valueClass =
    tone === 'warning' && typeof value === 'number' && value > 0
      ? 'text-h1 text-warning-fg leading-none tabular-nums'
      : 'text-h1 text-fg-primary leading-none tabular-nums';

  return (
    <Card variant="default" className="p-4 md:p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-body-sm text-fg-secondary leading-none truncate">{label}</span>
        <span className="text-fg-tertiary flex-shrink-0">{icon}</span>
      </div>
      <p className={valueClass} aria-label={`${label}: ${value ?? 'sin datos'}`}>
        {typeof value === 'number' ? value : '—'}
      </p>
    </Card>
  );
}
