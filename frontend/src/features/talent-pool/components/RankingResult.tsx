import type { TalentPoolLabel, TalentPoolRankResult } from '../types/talent-pool.types';

const labelStyle: Record<TalentPoolLabel, string> = {
  'Muy recomendado': 'bg-success-bg text-success-fg border-success-border',
  Recomendado: 'bg-info-bg text-info-fg border-info-border',
  Revisar: 'bg-warning-bg text-warning-fg border-warning-border',
  'No recomendado': 'bg-danger-bg text-danger-fg border-danger-border',
};

type RankingResultProps = {
  resultado: TalentPoolRankResult;
  updatingPinRunId: string | null;
  onTogglePinned: (runId: string, nextPinned: boolean) => void;
};

export function RankingResult({ resultado, updatingPinRunId, onTogglePinned }: RankingResultProps) {
  return (
    <>
      <div className="rounded-md border border-brand-ink-700 bg-brand-ink-700 px-3 lg:px-4 py-3 text-body-sm text-fg-inverse">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            <span className="font-medium">Resumen:</span> {resultado.resumenGeneral}
          </p>
          <button
            type="button"
            onClick={() => onTogglePinned(resultado.run.id, !resultado.run.isPinned)}
            disabled={updatingPinRunId === resultado.run.id}
            className="h-9 px-3 rounded-md border border-fg-inverse/30 text-button-sm hover:bg-fg-inverse/10 disabled:opacity-50"
          >
            {resultado.run.isPinned ? 'Desfijar' : 'Fijar'}
          </button>
        </div>
        <p className="mt-1 text-caption text-fg-inverse/75">
          Corrida actual · {new Date(resultado.run.createdAt).toLocaleString('es-GT')}
          {resultado.run.model ? ` · ${resultado.run.provider} (${resultado.run.model})` : ` · ${resultado.run.provider}`}
        </p>
      </div>

      <div className="space-y-3">
        {resultado.ranking.map((item) => (
          <article key={`${item.orden}-${item.nombre}`} className="rounded-md border border-border bg-surface-card p-3 lg:p-4">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-7 min-w-7 px-2 rounded-full bg-surface-sunken text-fg-secondary text-button-sm font-medium inline-flex items-center justify-center">
                  #{item.orden}
                </span>
                <h3 className="text-h4 text-fg-primary truncate">{item.nombre}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-body-sm font-medium text-fg-secondary">{item.score}/100</span>
                <span className={`text-caption font-medium px-2 py-1 rounded-full border ${labelStyle[item.etiqueta]}`}>
                  {item.etiqueta}
                </span>
              </div>
            </div>

            <p className="text-body-sm text-fg-secondary mt-2 leading-relaxed">{item.explicacion}</p>

            {item.alertas.length > 0 && (
              <div className="mt-2.5 rounded-md border border-warning-border bg-warning-bg px-3 py-2">
                <p className="text-caption font-medium text-warning-fg mb-1">Alertas para revisar</p>
                <ul className="space-y-0.5">
                  {item.alertas.map((alerta) => (
                    <li key={alerta} className="text-body-sm text-fg-secondary">• {alerta}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
