import type { TalentPoolLabel, TalentPoolRankResult } from '../types/talent-pool.types';

const labelStyle: Record<TalentPoolLabel, string> = {
  'Muy recomendado': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Recomendado: 'bg-blue-50 text-blue-700 border-blue-200',
  Revisar: 'bg-amber-50 text-amber-700 border-amber-200',
  'No recomendado': 'bg-rose-50 text-rose-700 border-rose-200',
};

type RankingResultProps = {
  resultado: TalentPoolRankResult;
  updatingPinRunId: string | null;
  onTogglePinned: (runId: string, nextPinned: boolean) => void;
};

export function RankingResult({ resultado, updatingPinRunId, onTogglePinned }: RankingResultProps) {
  return (
    <>
      <div className="rounded-lg border border-stone-300 bg-stone-900 px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base text-white">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p>
            <span className="font-semibold">Resumen:</span> {resultado.resumenGeneral}
          </p>
          <button
            type="button"
            onClick={() => onTogglePinned(resultado.run.id, !resultado.run.isPinned)}
            disabled={updatingPinRunId === resultado.run.id}
            className="h-8 lg:h-9 px-3 rounded-md border border-white/30 text-[11px] lg:text-xs font-semibold hover:bg-white/10 disabled:opacity-50"
          >
            {resultado.run.isPinned ? 'Desfijar' : 'Fijar'}
          </button>
        </div>
        <p className="mt-1 text-[11px] lg:text-xs text-white/75">
          Corrida actual · {new Date(resultado.run.createdAt).toLocaleString('es-GT')}
          {resultado.run.model ? ` · ${resultado.run.provider} (${resultado.run.model})` : ` · ${resultado.run.provider}`}
        </p>
      </div>

      <div className="space-y-2.5 lg:space-y-3">
        {resultado.ranking.map((item) => (
          <article key={`${item.orden}-${item.nombre}`} className="rounded-lg border border-[var(--border)] bg-white p-3 lg:p-4">
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <span className="h-6 lg:h-7 min-w-6 lg:min-w-7 px-2 rounded-full bg-stone-100 text-stone-700 text-xs lg:text-sm font-semibold inline-flex items-center justify-center">
                  #{item.orden}
                </span>
                <h3 className="text-sm lg:text-base font-semibold text-stone-800 truncate">{item.nombre}</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs lg:text-sm font-semibold text-stone-700">{item.score}/100</span>
                <span className={`text-[11px] lg:text-xs font-semibold px-2 py-1 rounded-full border ${labelStyle[item.etiqueta]}`}>
                  {item.etiqueta}
                </span>
              </div>
            </div>

            <p className="text-sm lg:text-base text-stone-600 mt-2 leading-relaxed">{item.explicacion}</p>

            {item.alertas.length > 0 && (
              <div className="mt-2.5 rounded-md border border-[var(--warning-border)] bg-[var(--warning-bg)] px-2.5 lg:px-3 py-2">
                <p className="text-[11px] lg:text-xs font-semibold text-[var(--warning)] mb-1">Alertas para revisar</p>
                <ul className="space-y-0.5">
                  {item.alertas.map((alerta) => (
                    <li key={alerta} className="text-[12px] lg:text-sm text-stone-700">• {alerta}</li>
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
