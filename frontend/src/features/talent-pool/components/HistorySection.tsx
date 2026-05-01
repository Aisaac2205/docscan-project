import { SpinnerIcon } from '@/shared/ui/icons';
import type { TalentPoolHistoryItem } from '../types/talent-pool.types';

type HistorySectionProps = {
  historial: TalentPoolHistoryItem[];
  loadingHistorial: boolean;
  clearingHistory: boolean;
  updatingPinRunId: string | null;
  onTogglePinned: (runId: string, nextPinned: boolean) => void;
  onClearHistory: () => void;
};

export function HistorySection({
  historial,
  loadingHistorial,
  clearingHistory,
  updatingPinRunId,
  onTogglePinned,
  onClearHistory,
}: HistorySectionProps) {
  return (
    <section className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 lg:p-6 space-y-3 lg:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="text-sm lg:text-base font-semibold text-stone-800">Historial de evaluaciones</h2>
          <p className="text-xs lg:text-sm text-stone-400">
            Las evaluaciones fijadas quedan arriba. Después se ordena por fecha más reciente.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={loadingHistorial || clearingHistory || historial.length === 0}
          className="h-8 lg:h-9 px-3 rounded-md border border-rose-200 bg-rose-50 text-[11px] lg:text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {clearingHistory ? 'Eliminando…' : 'Eliminar historial'}
        </button>
      </div>

      {loadingHistorial ? (
        <div className="rounded-lg border border-[var(--border)] bg-stone-50 px-3 lg:px-4 py-4 text-sm lg:text-base text-stone-500 flex items-center gap-2">
          <SpinnerIcon className="text-stone-400" /> Cargando historial…
        </div>
      ) : historial.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[var(--border)] bg-stone-50 px-4 lg:px-5 py-6 text-center text-sm lg:text-base text-stone-400">
          Todavía no hay evaluaciones guardadas.
        </div>
      ) : (
        <div className="space-y-2.5 lg:space-y-3">
          {historial.map((run) => (
            <article
              key={run.id}
              className={`rounded-lg border p-3 lg:p-4 ${run.isPinned ? 'border-amber-300 bg-amber-50/40' : 'border-[var(--border)] bg-white'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm lg:text-base font-semibold text-stone-800 truncate">{run.puesto}</h3>
                    {run.isPinned && (
                      <span className="text-[10px] lg:text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-300 text-amber-700 bg-amber-100">
                        Fijada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] lg:text-xs text-stone-500 mt-0.5">
                    {new Date(run.createdAt).toLocaleString('es-GT')} · {run.totalCandidatos} candidato(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePinned(run.id, !run.isPinned)}
                  disabled={updatingPinRunId === run.id}
                  className="h-8 lg:h-9 px-3 rounded-md border border-[var(--border)] bg-white text-[11px] lg:text-xs font-semibold text-stone-700 hover:bg-stone-50 disabled:opacity-50"
                >
                  {run.isPinned ? 'Desfijar' : 'Fijar'}
                </button>
              </div>

              <p className="mt-2 text-[12px] lg:text-sm text-stone-600">{run.resumenGeneral}</p>

              {run.rankingTop3.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {run.rankingTop3.map((item) => (
                    <span
                      key={`${run.id}-${item.orden}-${item.nombre}`}
                      className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] bg-stone-50 px-2 py-1 text-[11px] lg:text-xs text-stone-700"
                    >
                      #{item.orden} {item.nombre} ({item.score})
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
