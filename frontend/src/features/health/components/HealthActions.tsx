'use client';

import { useState } from 'react';
import type { HealthStatus } from '../types';
import { useHealthStore } from '../store';

interface HealthActionsProps {
  id: string;
  currentStatus: HealthStatus;
}

const STATUS_LABELS: Record<HealthStatus, string> = {
  pending: 'Pendiente',
  validated: 'Validada',
  registered: 'Registrada en nómina',
  rejected: 'Rechazada',
};

const STATUS_COLORS: Record<HealthStatus, string> = {
  pending: 'text-warning-fg bg-warning-bg border-warning-border',
  validated: 'text-success-fg bg-success-bg border-success-border',
  registered: 'text-fg-secondary bg-surface-sunken border-border',
  rejected: 'text-danger-fg bg-danger-bg border-danger-border',
};

export function HealthActions({ id, currentStatus }: HealthActionsProps) {
  const { updateStatus } = useHealthStore();
  const [busy, setBusy] = useState(false);

  const handle = async (status: HealthStatus, notes?: string) => {
    setBusy(true);
    await updateStatus(id, { status, notes });
    setBusy(false);
  };

  const btnBase =
    'px-3 py-1.5 rounded-md text-button-sm border transition-all disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]';

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-border-subtle">
      <span
        className={`px-2.5 py-1 rounded-full text-caption font-medium border ${STATUS_COLORS[currentStatus]}`}
      >
        {STATUS_LABELS[currentStatus]}
      </span>

      {currentStatus === 'pending' && (
        <>
          <button
            disabled={busy}
            onClick={() => handle('validated')}
            className={`${btnBase} bg-surface-card border-border text-fg-secondary hover:border-success-border hover:text-success-fg`}
          >
            Validar
          </button>
          <button
            disabled={busy}
            onClick={() => handle('rejected')}
            className={`${btnBase} bg-surface-card border-border text-fg-secondary hover:border-danger-border hover:text-danger-fg`}
          >
            Rechazar
          </button>
        </>
      )}

      {currentStatus === 'validated' && (
        <button
          disabled={busy}
          onClick={() => handle('registered')}
          className={`${btnBase} bg-fg-primary border-fg-primary text-fg-inverse hover:opacity-90`}
        >
          Registrar en nomina
        </button>
      )}

      {currentStatus === 'registered' && (
        <span className="text-caption text-fg-tertiary">Registrado en nomina</span>
      )}

      {currentStatus === 'rejected' && (
        <button
          disabled={busy}
          onClick={() => handle('pending')}
          className={`${btnBase} bg-surface-card border-border text-fg-secondary hover:border-border-strong`}
        >
          Reabrir
        </button>
      )}
    </div>
  );
}
