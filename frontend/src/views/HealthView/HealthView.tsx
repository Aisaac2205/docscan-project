'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useHealthStore } from '@/features/health/store';
import { HealthFilters } from '@/features/health/components/HealthFilters';
import { HealthRecordCard } from '@/features/health/components/HealthRecordCard';
import type { HealthStatus } from '@/features/health/types';

type FilterValue = HealthStatus | 'all';

function SkeletonCard() {
  return (
    <div
      aria-hidden="true"
      className="bg-white border border-stone-200 rounded-xl p-4 md:p-5 space-y-3 animate-pulse"
    >
      <div className="h-3 w-24 rounded bg-stone-100" />
      <div className="h-5 w-48 rounded bg-stone-100" />
      <div className="grid grid-cols-3 gap-3 mt-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-8 rounded bg-stone-100" />)}
      </div>
    </div>
  );
}

export function HealthView() {
  const { records, loading, error, fetchRecords } = useHealthStore();
  const [filter, setFilter] = useState<FilterValue>('all');

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    if (filter === 'all') return records;
    return records.filter((r) => r.healthStatus === filter);
  }, [records, filter]);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 md:mb-7">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-0.5">
            RRHH
          </p>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900">
            Gestion de Salud y Ausencias
          </h1>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Filtros */}
      <HealthFilters active={filter} onChange={setFilter} />

      {/* Lista */}
      {loading ? (
        <div className="space-y-4" aria-busy="true" aria-label="Cargando registros">
          {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm font-medium text-stone-500 mb-1">
            {records.length === 0
              ? 'Todavia no hay constancias medicas.'
              : 'No hay registros para este filtro.'}
          </p>
          {records.length === 0 && (
            <p className="text-xs text-stone-400">
              Procesa un documento con el modo &quot;Constancia medica&quot; en el escaner.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4" aria-label={`${filtered.length} constancias medicas`}>
          {filtered.map((record) => (
            <HealthRecordCard key={record.id} record={record} />
          ))}
        </div>
      )}
    </div>
  );
}
