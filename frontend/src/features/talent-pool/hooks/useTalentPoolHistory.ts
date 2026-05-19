'use client';

import { useCallback, useEffect } from 'react';
import { toast } from '@/shared/ui/toast/store';
import { useTalentPoolStore } from '../store';

const HISTORY_LIMIT = 20;
const CONFIRM_CLEAR_TOKEN = 'ELIMINAR';

interface UseTalentPoolHistoryResult {
  readonly historial: ReturnType<typeof useTalentPoolStore.getState>['historial'];
  readonly loadingHistorial: boolean;
  readonly clearingHistory: boolean;
  readonly updatingPinRunId: string | null;
  readonly togglePinned: (runId: string, nextPinned: boolean) => Promise<void>;
  readonly clearHistory: () => Promise<void>;
}

/**
 * Bootstrap del historial + acciones (pin/unpin, borrado total) con toasts.
 * El borrado pide confirmación con prompt nativo — escribir "ELIMINAR" — para
 * evitar acciones destructivas accidentales mientras no haya modal de confirmación.
 */
export function useTalentPoolHistory(): UseTalentPoolHistoryResult {
  const historial = useTalentPoolStore((s) => s.historial);
  const loadingHistorial = useTalentPoolStore((s) => s.loadingHistorial);
  const clearingHistory = useTalentPoolStore((s) => s.clearingHistory);
  const updatingPinRunId = useTalentPoolStore((s) => s.updatingPinRunId);
  const loadHistory = useTalentPoolStore((s) => s.loadHistory);
  const storeTogglePinned = useTalentPoolStore((s) => s.togglePinned);
  const storeClearHistory = useTalentPoolStore((s) => s.clearHistory);

  useEffect(() => {
    loadHistory(HISTORY_LIMIT).catch(() => {
      toast.info('No pudimos cargar el historial de evaluaciones por ahora.');
    });
  }, [loadHistory]);

  const togglePinned = useCallback(
    async (runId: string, nextPinned: boolean) => {
      const success = await storeTogglePinned(runId, nextPinned);
      if (success) {
        toast.success(
          nextPinned
            ? 'Evaluación fijada en historial.'
            : 'Evaluación desfijada del historial.',
        );
        return;
      }
      toast.error('No pudimos actualizar el estado fijado de esta evaluación.');
    },
    [storeTogglePinned],
  );

  const clearHistory = useCallback(async () => {
    if (historial.length === 0) {
      toast.info('No hay evaluaciones en historial para eliminar.');
      return;
    }

    const confirmation = window.prompt(
      `Esta acción elimina TODO el historial de evaluaciones de tu cuenta y no se puede deshacer. Escribí ${CONFIRM_CLEAR_TOKEN} para confirmar.`,
    );

    if (confirmation !== CONFIRM_CLEAR_TOKEN) {
      toast.info(`Cancelado. Para confirmar el borrado, escribí ${CONFIRM_CLEAR_TOKEN} exactamente.`);
      return;
    }

    const deletedCount = await storeClearHistory();
    if (deletedCount === null) {
      toast.error('No pudimos eliminar el historial por ahora.');
      return;
    }
    if (deletedCount === 0) {
      toast.info('No encontramos evaluaciones para eliminar.');
      return;
    }

    toast.success(`Historial eliminado: ${deletedCount} evaluación(es).`);
  }, [historial.length, storeClearHistory]);

  return {
    historial,
    loadingHistorial,
    clearingHistory,
    updatingPinRunId,
    togglePinned,
    clearHistory,
  };
}
