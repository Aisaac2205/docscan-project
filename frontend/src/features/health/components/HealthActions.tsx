'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, BookCheck, RotateCcw } from 'lucide-react';
import type { HealthStatus } from '../types';
import { useUpdateHealthStatus } from '../hooks/useUpdateHealthStatus';

interface HealthActionsProps {
  id: string;
  currentStatus: HealthStatus;
  /** Si es null, Validar/Registrar quedan disabled (enforcement de "no validar sin empleado"). */
  personId: string | null;
  layout?: 'inline' | 'stack';
}

const STATUS_LABELS = {
  pending: 'Pendiente',
  validated: 'Validada',
  registered: 'Registrada en nómina',
  rejected: 'Rechazada',
} satisfies Record<HealthStatus, string>;

const STATUS_CLASS = {
  pending:    'text-warning-fg bg-warning-bg border-warning-border',
  validated:  'text-success-fg bg-success-bg border-success-border',
  registered: 'text-info-fg bg-info-bg border-info-border',
  rejected:   'text-danger-fg bg-danger-bg border-danger-border',
} satisfies Record<HealthStatus, string>;

const GATING_TOOLTIP = 'Asigná un empleado a la constancia antes de validar.';

const BTN_BASE =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-button-sm border transition-colors ' +
  'disabled:opacity-50 disabled:cursor-not-allowed ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]';

export function HealthStatusBadge({ status }: { status: HealthStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-caption font-medium border ${STATUS_CLASS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function HealthActions({ id, currentStatus, personId, layout = 'inline' }: HealthActionsProps) {
  const mutation = useUpdateHealthStatus();
  const [busy, setBusy] = useState(false);

  const handle = async (status: HealthStatus) => {
    setBusy(true);
    try {
      await mutation.mutateAsync({ id, payload: { status } });
    } finally {
      setBusy(false);
    }
  };

  const wrapperClass =
    layout === 'stack'
      ? 'flex flex-col items-stretch gap-2'
      : 'flex flex-wrap items-center gap-2';

  const gated = personId === null;

  return (
    <div className={wrapperClass}>
      <HealthStatusBadge status={currentStatus} />

      {currentStatus === 'pending' && (
        <>
          <button
            type="button"
            disabled={busy || gated}
            onClick={() => handle('validated')}
            title={gated ? GATING_TOOLTIP : undefined}
            aria-disabled={gated || undefined}
            className={`${BTN_BASE} bg-surface-card border-border text-fg-secondary hover:border-success-border hover:text-success-fg`}
          >
            <CheckCircle2 width={14} height={14} aria-hidden="true" />
            Validar
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => handle('rejected')}
            className={`${BTN_BASE} bg-surface-card border-border text-fg-secondary hover:border-danger-border hover:text-danger-fg`}
          >
            <XCircle width={14} height={14} aria-hidden="true" />
            Rechazar
          </button>
        </>
      )}

      {currentStatus === 'validated' && (
        <button
          type="button"
          disabled={busy || gated}
          onClick={() => handle('registered')}
          title={gated ? GATING_TOOLTIP : undefined}
          aria-disabled={gated || undefined}
          className={`${BTN_BASE} bg-fg-primary border-fg-primary text-fg-inverse hover:opacity-90`}
        >
          <BookCheck width={14} height={14} aria-hidden="true" />
          Registrar en nómina
        </button>
      )}

      {currentStatus === 'registered' && (
        <span className="text-caption text-fg-tertiary">Registrado en nómina</span>
      )}

      {currentStatus === 'rejected' && (
        <button
          type="button"
          disabled={busy}
          onClick={() => handle('pending')}
          className={`${BTN_BASE} bg-surface-card border-border text-fg-secondary hover:border-border-strong hover:text-fg-primary`}
        >
          <RotateCcw width={14} height={14} aria-hidden="true" />
          Reabrir
        </button>
      )}
    </div>
  );
}
