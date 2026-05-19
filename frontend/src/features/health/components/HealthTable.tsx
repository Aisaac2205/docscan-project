'use client';

import { Eye, CheckCircle2, XCircle, BookCheck } from 'lucide-react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { DataTable, type DataTableColumn } from '@/shared/components/data-display/DataTable';
import type { HealthRecord, HealthStatus } from '../types';
import { useUpdateHealthStatus } from '../hooks/useUpdateHealthStatus';
import { HealthStatusBadge } from './HealthActions';

interface HealthTableProps {
  records: HealthRecord[];
  onRowClick: (record: HealthRecord) => void;
  emptyTitle: string;
  emptyHint?: string;
}

// Tailwind necesita strings estáticos para arbitrary values — un mapa explícito.
// `satisfies` valida que cubrimos todos los HealthStatus sin perder tipado literal
// (si mañana agregás un status nuevo y olvidás la entrada, TS te avisa).
const STATUS_ROW_CLASS = {
  pending:
    '[&>td:first-child]:shadow-[inset_3px_0_0_var(--color-warning-fg)] ' +
    'hover:[&>td:first-child]:shadow-[inset_4px_0_0_var(--color-warning-fg)] ' +
    '[&>td:first-child]:transition-shadow [&>td:first-child]:duration-150',
  validated:
    '[&>td:first-child]:shadow-[inset_3px_0_0_var(--color-success-fg)] ' +
    'hover:[&>td:first-child]:shadow-[inset_4px_0_0_var(--color-success-fg)] ' +
    '[&>td:first-child]:transition-shadow [&>td:first-child]:duration-150',
  registered:
    '[&>td:first-child]:shadow-[inset_3px_0_0_var(--color-info-fg)] ' +
    'hover:[&>td:first-child]:shadow-[inset_4px_0_0_var(--color-info-fg)] ' +
    '[&>td:first-child]:transition-shadow [&>td:first-child]:duration-150',
  rejected:
    '[&>td:first-child]:shadow-[inset_3px_0_0_var(--color-danger-fg)] ' +
    'hover:[&>td:first-child]:shadow-[inset_4px_0_0_var(--color-danger-fg)] ' +
    '[&>td:first-child]:transition-shadow [&>td:first-child]:duration-150',
} satisfies Record<HealthStatus, string>;

function formatDate(raw: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function PersonCell({ record }: { record: HealthRecord }) {
  const display = record.personName ?? record.nombre_paciente ?? record.originalName;
  const initial = display?.trim().charAt(0).toUpperCase() || '?';
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <span
        aria-hidden="true"
        className="w-7 h-7 rounded-full bg-surface-sunken text-fg-secondary text-caption font-medium flex items-center justify-center shrink-0"
      >
        {initial}
      </span>
      <div className="min-w-0">
        <p className="text-body-sm text-fg-primary truncate">{display}</p>
        {record.personName &&
          record.nombre_paciente &&
          record.personName !== record.nombre_paciente && (
            <p className="text-caption text-fg-tertiary truncate">OCR: {record.nombre_paciente}</p>
          )}
      </div>
    </div>
  );
}

function TypeTag() {
  return (
    <span className="inline-flex items-center text-caption text-fg-secondary border border-border rounded-full px-2 py-0.5">
      Constancia médica
    </span>
  );
}

function DiagnosticCell({ value }: { value: string | null }) {
  if (!value) return <span className="text-fg-tertiary">—</span>;
  return (
    <span className="text-body-sm text-fg-secondary line-clamp-1" title={value}>
      {value}
    </span>
  );
}

interface ActionsCellProps {
  record: HealthRecord;
  onOpen: () => void;
}

const GATING_TOOLTIP = 'Asigná un empleado antes de validar.';

function ActionsCell({ record, onOpen }: ActionsCellProps) {
  const mutation = useUpdateHealthStatus();
  const busy = mutation.isPending;
  const gated = record.personId === null;

  const handle = async (e: ReactMouseEvent, status: HealthStatus) => {
    e.stopPropagation();
    await mutation.mutateAsync({ id: record.id, payload: { status } });
  };

  const iconBtn =
    'inline-flex items-center justify-center w-8 h-8 rounded-md border border-border bg-surface-card text-fg-secondary ' +
    'hover:bg-surface-sunken hover:border-border-strong hover:text-fg-primary ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]';

  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        aria-label="Ver detalle"
        title="Ver detalle"
        className={iconBtn}
        onClick={(e) => {
          e.stopPropagation();
          onOpen();
        }}
      >
        <Eye width={14} height={14} aria-hidden="true" />
      </button>

      {record.healthStatus === 'pending' && (
        <>
          <button
            type="button"
            disabled={busy || gated}
            aria-label={gated ? GATING_TOOLTIP : 'Validar'}
            aria-disabled={gated || undefined}
            title={gated ? GATING_TOOLTIP : 'Validar'}
            className={`${iconBtn} hover:border-success-border hover:text-success-fg`}
            onClick={(e) => handle(e, 'validated')}
          >
            <CheckCircle2 width={14} height={14} aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled={busy}
            aria-label="Rechazar"
            title="Rechazar"
            className={`${iconBtn} hover:border-danger-border hover:text-danger-fg`}
            onClick={(e) => handle(e, 'rejected')}
          >
            <XCircle width={14} height={14} aria-hidden="true" />
          </button>
        </>
      )}

      {record.healthStatus === 'validated' && (
        <button
          type="button"
          disabled={busy || gated}
          aria-label={gated ? GATING_TOOLTIP : 'Registrar en nómina'}
          aria-disabled={gated || undefined}
          title={gated ? GATING_TOOLTIP : 'Registrar en nómina'}
          className={`${iconBtn} hover:border-info-border hover:text-info-fg`}
          onClick={(e) => handle(e, 'registered')}
        >
          <BookCheck width={14} height={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

export function HealthTable({ records, onRowClick, emptyTitle, emptyHint }: HealthTableProps) {
  const columns: DataTableColumn<HealthRecord>[] = [
    {
      key: 'person',
      header: 'Empleado',
      render: (r) => <PersonCell record={r} />,
    },
    {
      key: 'type',
      header: 'Tipo',
      width: 160,
      render: () => <TypeTag />,
    },
    {
      key: 'fecha_emision',
      header: 'Emitida',
      width: 130,
      render: (r) => (
        <span className="text-body-sm text-fg-secondary">{formatDate(r.fecha_emision)}</span>
      ),
    },
    {
      key: 'dias_reposo',
      header: 'Días',
      width: 72,
      align: 'right',
      render: (r) => (
        <span className="text-body-sm text-fg-primary">{r.dias_reposo ?? '—'}</span>
      ),
    },
    {
      key: 'diagnostico',
      header: 'Diagnóstico',
      render: (r) => <DiagnosticCell value={r.diagnostico} />,
    },
    {
      key: 'status',
      header: 'Estado',
      width: 180,
      render: (r) => <HealthStatusBadge status={r.healthStatus} />,
    },
    {
      key: 'actions',
      header: '',
      width: 140,
      align: 'right',
      render: (r) => <ActionsCell record={r} onOpen={() => onRowClick(r)} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={records}
      getRowKey={(r) => r.id}
      ariaLabel="Listado de constancias médicas"
      onRowClick={(r) => onRowClick(r)}
      rowClassName={(r) => STATUS_ROW_CLASS[r.healthStatus]}
      emptyState={
        <div className="flex flex-col items-center justify-center py-16 text-center bg-surface-card border border-border rounded-md">
          <p className="text-body-sm font-medium text-fg-secondary mb-1">{emptyTitle}</p>
          {emptyHint && <p className="text-caption text-fg-tertiary">{emptyHint}</p>}
        </div>
      }
    />
  );
}
