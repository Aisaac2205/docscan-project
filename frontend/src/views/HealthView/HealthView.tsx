'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { FilePlus } from 'lucide-react';
import { Heading } from '@/shared/components/Layout';
import { useHealthRecords } from '@/features/health/hooks/useHealthRecords';
import { useHealthMetrics } from '@/features/health/hooks/useHealthMetrics';
import { useHealthWeekly } from '@/features/health/hooks/useHealthWeekly';
import { HealthMetricsRow } from '@/features/health/components/HealthMetricsRow';
import { WeeklyProcessingChart } from '@/features/dashboard/components/WeeklyProcessingChart';
import { CHART_COLORS } from '@/shared/components/data-display';
import {
  HealthTabs,
  type HealthFilterValue,
  type HealthTabCounts,
} from '@/features/health/components/HealthTabs';
import { HealthSearchBar } from '@/features/health/components/HealthSearchBar';
import { HealthTable } from '@/features/health/components/HealthTable';
import { HealthDetailSheet } from '@/features/health/components/HealthDetailSheet';
import type { HealthRecord, HealthStatus } from '@/features/health/types';

const PAGE_SIZE = 25;

function matchesQuery(record: HealthRecord, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  const haystacks: Array<string | null> = [
    record.personName,
    record.nombre_paciente,
    record.nombre_medico,
    record.numero_colegiado,
    record.diagnostico,
    record.institucion_emisora,
    record.originalName,
  ];
  return haystacks.some((s) => s !== null && s.toLowerCase().includes(needle));
}

function computeCounts(records: HealthRecord[]): HealthTabCounts {
  const counts: HealthTabCounts = {
    all: records.length,
    pending: 0,
    validated: 0,
    registered: 0,
    rejected: 0,
  };
  for (const r of records) {
    const key = r.healthStatus as HealthStatus;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

const HEALTH_WEEKLY_SERIES = [
  { key: 'recibidas', name: 'Recibidas', color: CHART_COLORS[0] },
  { key: 'validadas', name: 'Validadas', color: CHART_COLORS[1] },
] as const;

export function HealthView() {
  const { records, loading, error, refetch } = useHealthRecords();
  const metrics = useHealthMetrics(records);
  const weekly = useHealthWeekly(records);
  const counts = useMemo(() => computeCounts(records), [records]);

  const [filter, setFilter] = useState<HealthFilterValue>('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset paginación al cambiar tab o búsqueda.
  useEffect(() => {
    setPage(1);
  }, [filter, query]);

  const filtered = useMemo(() => {
    return records
      .filter((r) => filter === 'all' || r.healthStatus === filter)
      .filter((r) => matchesQuery(r, query.trim()));
  }, [records, filter, query]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paged = useMemo(
    () => filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE),
    [filtered, safePage],
  );

  const selectedRecord = useMemo(
    () => (selectedId ? records.find((r) => r.id === selectedId) ?? null : null),
    [records, selectedId],
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-5 md:mb-7">
        <div>
          <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">
            RRHH
          </p>
          <Heading level={1}>Salud y Ausencias</Heading>
          <p className="text-body-sm text-fg-tertiary mt-0.5">
            Constancias médicas, validación y registro en nómina.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/scan?mode=medical_cert"
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-accent-500 text-fg-inverse text-button-sm hover:bg-accent-600 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            <FilePlus width={14} height={14} aria-hidden="true" />
            Nueva constancia
          </Link>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg flex items-center justify-between gap-3"
        >
          <span>{error}</span>
          <button
            type="button"
            onClick={() => void refetch()}
            className="text-caption underline hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Métricas */}
      <HealthMetricsRow metrics={metrics} loading={loading && records.length === 0} />

      {/* Gráfico semanal */}
      <div className="mb-5">
        <WeeklyProcessingChart
          data={weekly}
          loading={loading && records.length === 0}
          title="Constancias procesadas"
          description="Últimos 7 días"
          series={HEALTH_WEEKLY_SERIES}
          gradientIdPrefix="health-weekly"
          emptyTitle="Sin actividad reciente"
          emptyDescription="No hay constancias procesadas en los últimos 7 días."
        />
      </div>

      {/* Tabs */}
      <HealthTabs active={filter} onChange={setFilter} counts={counts} />

      {/* Búsqueda + paginación */}
      <HealthSearchBar
        value={query}
        onChange={setQuery}
        total={total}
        page={safePage}
        pageCount={pageCount}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => Math.min(pageCount, p + 1))}
        canPrev={safePage > 1}
        canNext={safePage < pageCount}
      />

      {/* Tabla */}
      {loading && records.length === 0 ? (
        <div className="flex items-center justify-center py-16 bg-surface-card border border-border rounded-md text-body-sm text-fg-tertiary">
          Cargando constancias…
        </div>
      ) : (
        <HealthTable
          records={paged}
          onRowClick={(r) => setSelectedId(r.id)}
          emptyTitle={
            records.length === 0
              ? 'Todavía no hay constancias médicas.'
              : 'No hay constancias para este filtro.'
          }
          emptyHint={
            records.length === 0
              ? 'Cargá una con el dropzone de arriba o desde Escanear.'
              : undefined
          }
        />
      )}

      {/* Drawer detalle */}
      <HealthDetailSheet
        record={selectedRecord}
        open={selectedRecord !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedId(null);
        }}
      />
    </div>
  );
}
