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

  const inputClass = 'w-full h-10 rounded-md border border-border bg-surface-card px-3 text-body-sm text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] cursor-pointer';
  const labelClass = 'text-overline text-overline-uppercase text-fg-tertiary';

  return (
    <article className="rounded-md border border-border bg-surface-card p-4 md:p-5 lg:p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-h4 text-fg-primary">Modo de evaluación con IA</h2>
        <p className="text-caption text-fg-tertiary">Elegí velocidad o privacidad según tu proceso.</p>
      </div>

      {loadingProviders ? (
        <div className="rounded-md border border-border bg-surface-sunken px-3 py-4 text-body-sm text-fg-secondary flex items-center gap-2">
          <SpinnerIcon className="text-fg-tertiary" /> Cargando opciones de IA…
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
                className={`rounded-md border px-3 py-3 text-left transition-colors ${
                  selectedProvider === p.id
                    ? 'bg-fg-primary text-fg-inverse border-fg-primary'
                    : 'bg-surface-card border-border text-fg-secondary hover:bg-surface-sunken'
                }`}
              >
                <p className="text-body-sm font-medium">{p.displayName}</p>
                <p className={`text-caption mt-0.5 ${selectedProvider === p.id ? 'text-fg-inverse/75' : 'text-fg-tertiary'}`}>
                  {p.id === 'lmstudio' ? 'Usa IA local en tu entorno.' : 'Usa IA en la nube para respuestas ágiles.'}
                </p>
              </button>
            ))}
          </div>

          {providers.length > 0 && (
            <p className="text-caption text-fg-tertiary">
              {activeProvider?.available === false
                ? 'Este modo no está disponible ahora.'
                : `Modo activo: ${activeProvider?.displayName ?? 'Configuración por defecto'}`}
            </p>
          )}

          {activeProvider?.models?.length ? (
            <div className="space-y-1.5">
              <label className={labelClass}>Modelo</label>
              <select
                value={selectedModel ?? ''}
                onChange={(e) => onModelSelect(e.target.value || undefined)}
                className={inputClass}
              >
                {activeProvider.models.map((model) => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <p className="text-caption text-fg-tertiary">
              No hay modelos listados para este modo. Se usará el modelo por defecto del backend.
            </p>
          )}
        </>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        <div className="space-y-1.5">
          <label className={labelClass}>Prioridad del proceso</label>
          <select
            value={criterios.prioridadProceso}
            onChange={(e) => setCriterio('prioridadProceso', e.target.value as TalentPoolCriteria['prioridadProceso'])}
            className={inputClass}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="text-caption text-fg-tertiary">
            {PRIORITY_OPTIONS.find((item) => item.value === criterios.prioridadProceso)?.helper}
          </p>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Tono del informe</label>
          <select
            value={criterios.tonoInforme}
            onChange={(e) => setCriterio('tonoInforme', e.target.value as TalentPoolCriteria['tonoInforme'])}
            className={inputClass}
          >
            {TONE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <p className="text-caption text-fg-tertiary">
            {TONE_OPTIONS.find((item) => item.value === criterios.tonoInforme)?.helper}
          </p>
        </div>
      </div>
    </article>
  );
}
