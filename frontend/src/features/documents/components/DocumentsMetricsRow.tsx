'use client';

import { StatCard } from '@/shared/components/data-display/StatCard';
import { Skeleton } from '@/shared/components/ui';
import type { DocumentsStats } from '../types/document.types';

interface DocumentsMetricsRowProps {
  stats: DocumentsStats | null;
  loading: boolean;
}

/**
 * Fila de 3 KPIs uniformes del módulo. Tratamiento visual idéntico —
 * sin fondo de color, sparkline en --color-chart-1 (default de StatCard).
 * Delta vs período anterior.
 */
export function DocumentsMetricsRow({ stats, loading }: DocumentsMetricsRowProps) {
  if (loading && !stats) {
    return (
      <div className="grid gap-3 md:grid-cols-3">
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <StatCard
        label="Total documentos"
        value={formatInteger(stats.total.value)}
        delta={stats.total.delta}
        deltaLabel="vs período anterior"
        sparkline={stats.total.sparkline}
      />
      <StatCard
        label="Precisión OCR promedio"
        value={formatPercent(stats.ocrPrecision.value)}
        delta={stats.ocrPrecision.delta}
        deltaLabel="vs período anterior"
        sparkline={stats.ocrPrecision.sparkline}
      />
      <StatCard
        label="Pendientes de revisión"
        value={formatInteger(stats.needsReview.value)}
        delta={stats.needsReview.delta}
        deltaLabel="vs período anterior"
        sparkline={stats.needsReview.sparkline}
      />
    </div>
  );
}

const integerFormatter = new Intl.NumberFormat('es-GT');

function formatInteger(value: number): string {
  return integerFormatter.format(value);
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}
