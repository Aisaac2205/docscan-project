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
  pending: 'text-amber-700 bg-amber-50 border-amber-200',
  validated: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  registered: 'text-stone-700 bg-stone-100 border-stone-200',
  rejected: 'text-rose-700 bg-rose-50 border-rose-200',
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
    'px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium border transition-all disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700';

  return (
    <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-stone-100">
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_COLORS[currentStatus]}`}
      >
        {STATUS_LABELS[currentStatus]}
      </span>

      {currentStatus === 'pending' && (
        <>
          <button
            disabled={busy}
            onClick={() => handle('validated')}
            className={`${btnBase} bg-white border-stone-200 text-stone-700 hover:border-emerald-400 hover:text-emerald-700`}
          >
            Validar
          </button>
          <button
            disabled={busy}
            onClick={() => handle('rejected')}
            className={`${btnBase} bg-white border-stone-200 text-stone-700 hover:border-rose-400 hover:text-rose-700`}
          >
            Rechazar
          </button>
        </>
      )}

      {currentStatus === 'validated' && (
        <button
          disabled={busy}
          onClick={() => handle('registered')}
          className={`${btnBase} bg-stone-900 border-stone-900 text-white hover:bg-stone-700`}
        >
          Registrar en nomina
        </button>
      )}

      {currentStatus === 'registered' && (
        <span className="text-xs text-stone-500">Registrado en nomina</span>
      )}

      {currentStatus === 'rejected' && (
        <button
          disabled={busy}
          onClick={() => handle('pending')}
          className={`${btnBase} bg-white border-stone-200 text-stone-600 hover:border-stone-400`}
        >
          Reabrir
        </button>
      )}
    </div>
  );
}
