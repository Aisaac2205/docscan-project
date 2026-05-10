'use client';

import { useState } from 'react';
import { useEvaluations } from '@/features/evaluations/hooks/useEvaluations';
import { useOCRProviders } from '@/features/ocr/hooks/useOCRProviders';
import { MarkdownRenderer } from '@/shared/components/MarkdownRenderer/MarkdownRenderer';
import type { EvaluationProvider } from '@/features/evaluations/types';

interface EvaluationsPanelProps {
  personId: string;
}

const PROVIDER_LABEL: Record<EvaluationProvider, string> = {
  gemini: 'Gemini (en la nube)',
  lmstudio: 'LM Studio (local)',
};

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function EvaluationsPanel({ personId }: EvaluationsPanelProps) {
  const { evaluations, loading, generating, error, generate, remove } = useEvaluations(personId);
  const { providers } = useOCRProviders();
  const [provider, setProvider] = useState<EvaluationProvider>('gemini');
  const [model, setModel] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const availableProviders = providers.filter((p) => p.available) as Array<{
    id: EvaluationProvider;
    displayName: string;
    available: boolean;
    models: { id: string; name: string }[];
  }>;
  const currentProviderInfo = availableProviders.find((p) => p.id === provider);
  const availableModels = currentProviderInfo?.models ?? [];

  const handleGenerate = async () => {
    await generate({
      provider,
      model: model.trim() || undefined,
      customPrompt: customPrompt.trim() || undefined,
    });
    setCustomPrompt('');
    setShowCustom(false);
  };

  const inputClass =
    'h-10 px-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]';

  const labelClass = 'block text-overline text-overline-uppercase text-fg-tertiary mb-1';

  return (
    <div className="space-y-5">
      {/* Generador */}
      <section
        aria-label="Generar nueva evaluación"
        className="bg-surface-card border border-border rounded-md p-4 md:p-5"
      >
        <h3 className="text-h4 text-fg-primary mb-1">
          Generar evaluación con IA
        </h3>
        <p className="text-caption text-fg-secondary mb-4">
          La IA analiza los datos extraídos del expediente y devuelve una recomendación. No procesa los documentos originales.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <div>
            <label htmlFor="eval-provider" className={labelClass}>
              Motor de IA
            </label>
            <select
              id="eval-provider"
              value={provider}
              onChange={(e) => { setProvider(e.target.value as EvaluationProvider); setModel(''); }}
              className={inputClass + ' w-full'}
            >
              {availableProviders.length === 0 && (
                <option value="gemini">Gemini (verificar conexión)</option>
              )}
              {availableProviders.map((p) => (
                <option key={p.id} value={p.id}>{PROVIDER_LABEL[p.id] ?? p.displayName}</option>
              ))}
            </select>
          </div>

          {availableModels.length > 0 && (
            <div>
              <label htmlFor="eval-model" className={labelClass}>
                Modelo
              </label>
              <select
                id="eval-model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={inputClass + ' w-full'}
              >
                <option value="">Por defecto ({availableModels[0]?.name})</option>
                {availableModels.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowCustom((s) => !s)}
            className="text-caption text-fg-tertiary hover:text-fg-primary"
          >
            {showCustom ? 'Quitar instrucción adicional' : 'Agregar instrucción adicional (opcional)'}
          </button>
          {showCustom && (
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Ej: enfocá el análisis en compatibilidad con un puesto de cajero."
              className="mt-2 w-full px-3 py-2 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
            />
          )}
        </div>

        {error && (
          <div role="alert" className="mb-3 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={handleGenerate}
          disabled={generating}
          className="px-4 py-2 rounded-md text-button bg-fg-primary text-fg-inverse hover:opacity-90 disabled:opacity-50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
        >
          {generating ? 'Analizando expediente...' : 'Generar evaluación'}
        </button>
      </section>

      {/* Historial */}
      <section aria-label="Historial de evaluaciones">
        <h3 className="text-overline text-overline-uppercase text-fg-tertiary mb-3">
          Historial
        </h3>

        {loading && evaluations.length === 0 ? (
          <div aria-busy="true" className="space-y-2">
            <div className="h-32 rounded-md bg-surface-sunken animate-pulse" />
          </div>
        ) : evaluations.length === 0 ? (
          <p className="text-body-sm text-fg-tertiary italic">
            Aún no hay evaluaciones. Generá la primera con el botón de arriba.
          </p>
        ) : (
          <ul className="space-y-3">
            {evaluations.map((e) => (
              <li key={e.id} className="bg-surface-card border border-border rounded-md p-4 md:p-5">
                <header className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <p className="text-overline text-overline-uppercase text-fg-tertiary">
                      {PROVIDER_LABEL[e.provider as EvaluationProvider] ?? e.provider}
                      {e.model && <span className="text-fg-disabled font-normal"> · {e.model}</span>}
                    </p>
                    <p className="text-caption text-fg-secondary mt-0.5">{formatDateTime(e.createdAt)}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    {e.score != null && (
                      <span className="text-display-lg text-fg-primary leading-none">
                        {e.score}
                        <span className="text-body-sm text-fg-tertiary font-normal">/100</span>
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(e.id)}
                      className="text-caption text-fg-tertiary hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
                      aria-label="Eliminar evaluación"
                    >
                      Eliminar
                    </button>
                  </div>
                </header>
                <div className="prose prose-stone prose-sm max-w-none text-body-sm text-fg-primary">
                  <MarkdownRenderer text={e.result} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
