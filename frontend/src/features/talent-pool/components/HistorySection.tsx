import { SpinnerIcon } from '@/shared/ui/icons';
import { Heading } from '@/shared/components/Layout';
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
    <section className="rounded-md border border-border bg-surface-card p-4 md:p-5 lg:p-6 space-y-3 lg:space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Heading level={4} as="h2" className="text-fg-primary">Historial de evaluaciones</Heading>
          <p className="text-caption text-fg-tertiary">
            Las evaluaciones fijadas quedan arriba. Después se ordena por fecha más reciente.
          </p>
        </div>
        <button
          type="button"
          onClick={onClearHistory}
          disabled={loadingHistorial || clearingHistory || historial.length === 0}
          className="h-9 px-3 rounded-md border border-danger-border bg-danger-bg text-button-sm text-danger-fg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {clearingHistory ? 'Eliminando…' : 'Eliminar historial'}
        </button>
      </div>

      {loadingHistorial ? (
        <div className="rounded-md border border-border bg-surface-sunken px-3 py-4 text-body-sm text-fg-secondary flex items-center gap-2">
          <SpinnerIcon className="text-fg-tertiary" /> Cargando historial…
        </div>
      ) : historial.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface-sunken px-4 py-6 text-center text-body-sm text-fg-tertiary">
          Todavía no hay evaluaciones guardadas.
        </div>
      ) : (
        <div className="space-y-3">
          {historial.map((run) => (
            <article
              key={run.id}
              className={`rounded-md border p-3 lg:p-4 ${run.isPinned ? 'border-warning-border bg-warning-bg/40' : 'border-border bg-surface-card'}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Heading level={4} as="h3" className="text-fg-primary truncate">{run.puesto}</Heading>
                    {run.isPinned && (
                      <span className="text-overline font-medium px-2 py-0.5 rounded-full border border-warning-border text-warning-fg bg-warning-bg">
                        Fijada
                      </span>
                    )}
                  </div>
                  <p className="text-caption text-fg-secondary mt-0.5">
                    {new Date(run.createdAt).toLocaleString('es-GT')} · {run.totalCandidatos} candidato(s)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onTogglePinned(run.id, !run.isPinned)}
                  disabled={updatingPinRunId === run.id}
                  className="h-9 px-3 rounded-md border border-border bg-surface-card text-button-sm text-fg-secondary hover:bg-surface-sunken disabled:opacity-50"
                >
                  {run.isPinned ? 'Desfijar' : 'Fijar'}
                </button>
              </div>

              <p className="mt-2 text-body-sm text-fg-secondary">{run.resumenGeneral}</p>

              {run.rankingTop3.length > 0 && (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {run.rankingTop3.map((item) => (
                    <span
                      key={`${run.id}-${item.orden}-${item.nombre}`}
                      className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-sunken px-2 py-1 text-caption text-fg-secondary"
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
