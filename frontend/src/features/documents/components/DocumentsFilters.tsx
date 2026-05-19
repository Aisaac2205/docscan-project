'use client';

import { UserX } from 'lucide-react';
import { Select } from '@/shared/components/ui';
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

export function DocumentsFilters({ state, onChange, className }: DocumentsFiltersProps) {
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
          onChange({ status: next === '' ? null : (next as DisplayStatus) });
        }}
      >
        <option value="">Todos los estados</option>
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>

      <DateRangeFilter
        dateFrom={state.dateFrom}
        dateTo={state.dateTo}
        onChange={(range) => onChange(range)}
      />

      <UnassignedToggle
        active={state.unassigned}
        onToggle={(next) => onChange({ unassigned: next })}
      />
    </div>
  );
}

interface UnassignedToggleProps {
  active: boolean;
  onToggle: (next: boolean) => void;
}

/**
 * Toggle pill "Solo sin asignar". Reemplaza al Select de persona — para
 * ver documentos de UNA persona específica, la ruta canónica es
 * /persons/[id] · tab Documentos. Acá el caso de uso real es encontrar
 * docs huérfanos para clasificarlos.
 */
function UnassignedToggle({ active, onToggle }: UnassignedToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      onClick={() => onToggle(!active)}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 rounded-md border text-body-sm transition-colors',
        'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]',
        active
          ? 'bg-warning-bg text-warning-fg border-warning-border'
          : 'bg-surface-card text-fg-secondary border-border hover:bg-surface-sunken',
      )}
    >
      <UserX width={14} height={14} aria-hidden="true" />
      Solo sin asignar
    </button>
  );
}
