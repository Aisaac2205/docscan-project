import { SpinnerIcon } from '@/shared/ui/icons';
import type { ProviderId, ProviderInfo } from '@/features/ocr/types/ocr.types';
import { PRIORITY_OPTIONS, TONE_OPTIONS, type TalentPoolCriteria } from '../types/talent-pool.types';

type EvaluationPanelProps = {
  providers: ProviderInfo[];
  selectedProvider: ProviderId;
  selectedModel: string | undefined;
  loadingProviders: boolean;
  criterios: TalentPoolCriteria;
  onProviderSelect: (provider: ProviderId, firstModelId?: string) => void;
  onModelSelect: (model: string | undefined) => void;
  setCriterio: <K extends keyof TalentPoolCriteria>(key: K, value: TalentPoolCriteria[K]) => void;
};

export function EvaluationPanel({
  providers,
  selectedProvider,
  selectedModel,
  loadingProviders,
  criterios,
  onProviderSelect,
  onModelSelect,
  setCriterio,
}: EvaluationPanelProps) {
  const activeProvider = providers.find((p) => p.id === selectedProvider);

  return (
    <article className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 lg:p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm lg:text-base font-semibold text-stone-800">Modo de evaluación con IA</h2>
        <p className="text-xs lg:text-sm text-stone-400">Elegí velocidad o privacidad según tu proceso.</p>
      </div>

      {loadingProviders ? (
        <div className="rounded-lg border border-[var(--border)] bg-stone-50 px-3 py-4 text-sm text-stone-500 flex items-center gap-2">
          <SpinnerIcon className="text-stone-400" /> Cargando opciones de IA…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {providers.filter((p) => p.available).map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  onProviderSelect(p.id, p.models[0]?.id);
                }}
                className={`rounded-lg border px-3 lg:px-4 py-2.5 lg:py-3 text-left transition-colors ${
                  selectedProvider === p.id
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white border-[var(--border)] text-stone-700 hover:bg-stone-50'
                }`}
              >
                <p className="text-[12px] lg:text-sm font-semibold">{p.displayName}</p>
                <p className={`text-[11px] lg:text-xs mt-0.5 ${selectedProvider === p.id ? 'text-white/75' : 'text-stone-400'}`}>
                  {p.id === 'lmstudio' ? 'Usa IA local en tu entorno.' : 'Usa IA en la nube para respuestas ágiles.'}
                </p>
              </button>
            ))}
          </div>

          {providers.length > 0 && (
            <p className="text-[11px] lg:text-xs text-stone-400">
              {activeProvider?.available === false
                ? 'Este modo no está disponible ahora.'
                : `Modo activo: ${activeProvider?.displayName ?? 'Configuración por defecto'}`}
            </p>
          )}

          {activeProvider?.models?.length ? (
            <div className="space-y-1.5">
              <label className="text-[12px] lg:text-xs font-semibold text-stone-700">Modelo</label>
              <select
                value={selectedModel ?? ''}
                onChange={(e) => onModelSelect(e.target.value || undefined)}
                className="w-full h-10 lg:h-11 rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 text-sm lg:text-base text-stone-800 input-focus cursor-pointer"
              >
                {activeProvider.models.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-[11px] text-stone-400">
              No hay modelos listados para este modo. Se usará el modelo por defecto del backend.
            </p>
          )}
        </>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-stone-700">Prioridad del proceso</label>
          <select
            value={criterios.prioridadProceso}
            onChange={(e) => setCriterio('prioridadProceso', e.target.value as TalentPoolCriteria['prioridadProceso'])}
            className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus cursor-pointer"
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400">
            {PRIORITY_OPTIONS.find((item) => item.value === criterios.prioridadProceso)?.helper}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-stone-700">Tono del informe</label>
          <select
            value={criterios.tonoInforme}
            onChange={(e) => setCriterio('tonoInforme', e.target.value as TalentPoolCriteria['tonoInforme'])}
            className="w-full h-10 rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-stone-800 input-focus cursor-pointer"
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="text-[11px] text-stone-400">
            {TONE_OPTIONS.find((item) => item.value === criterios.tonoInforme)?.helper}
          </p>
        </div>
      </div>
    </article>
  );
}
