'use client';

import { useEffect, useState } from 'react';
import { Select } from '@/shared/components/ui';
import { personsApi } from '@/features/persons/api/personsApi';
import { cn } from '@/shared/lib/cn';
import { DOCUMENT_TYPE_OPTIONS } from '../utils/documentTypes';
import type { DocumentsQueryState, DocumentsQueryUpdates } from '../hooks/useDocumentsQuery';
import type { DisplayStatus } from '../utils/getDisplayStatus';
import { DateRangeFilter } from './DateRangeFilter';

interface DocumentsFiltersProps {
  state: DocumentsQueryState;
  onChange: (updates: DocumentsQueryUpdates) => void;
  className?: string;
}

const STATUS_OPTIONS: { value: DisplayStatus; label: string }[] = [
  { value: 'completed', label: 'Completado' },
  { value: 'pending', label: 'Pendiente' },
  { value: 'review', label: 'Revisión' },
  { value: 'error', label: 'Error' },
];

interface PersonOption {
  id: string;
  fullName: string;
}

export function DocumentsFilters({ state, onChange, className }: DocumentsFiltersProps) {
  const [persons, setPersons] = useState<PersonOption[]>([]);

  // Personas precargadas (limit alto, suficiente para selector estático).
  // Si en algún momento se necesita búsqueda async, migrar a Popover+Input.
  useEffect(() => {
    let active = true;
    personsApi
      .list({ pageSize: 200 })
      .then((response) => {
        if (active) setPersons(response.items.map((p) => ({ id: p.id, fullName: p.fullName })));
      })
      .catch(() => {
        if (active) setPersons([]);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <Select
        aria-label="Filtrar por tipo"
        selectSize="sm"
        value={state.type ?? ''}
        onChange={(e) => onChange({ type: e.target.value || null })}
      >
        <option value="">Todos los tipos</option>
        {DOCUMENT_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filtrar por estado"
        selectSize="sm"
        value={state.status ?? ''}
        onChange={(e) => {
          const next = e.target.value;
          onChange({
            status: next === '' ? null : (next as DisplayStatus),
          });
        }}
      >
        <option value="">Todos los estados</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label="Filtrar por persona"
        selectSize="sm"
        value={state.personId ?? ''}
        onChange={(e) => onChange({ personId: e.target.value || null })}
      >
        <option value="">Todas las personas</option>
        {persons.map((p) => (
          <option key={p.id} value={p.id}>
            {p.fullName}
          </option>
        ))}
      </Select>

      <DateRangeFilter
        dateFrom={state.dateFrom}
        dateTo={state.dateTo}
        onChange={(range) => onChange(range)}
      />
    </div>
  );
}
