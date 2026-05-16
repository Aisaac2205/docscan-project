import { SpinnerIcon, OcrIcon, SparkleIcon } from '@/shared/ui/icons';
import type { ExtractionMode, AnalyzeResult, SuggestedField, ProviderInfo, ProviderId } from '@/features/ocr/types/ocr.types';
import { EXTRACTION_MODE_LABELS } from '@/features/ocr/types/ocr.types';

const MODES: ExtractionMode[] = [
  'cv',
  'id_card',
  'fiscal_social',
  'medical_cert',
  'background_check',
  'custom',
];

function confidenceBadge(c: number): string {
  if (c >= 0.85) return 'text-success-fg bg-success-bg border-success-border';
  if (c >= 0.65) return 'text-warning-fg bg-warning-bg border-warning-border';
  return 'text-danger-fg bg-danger-bg border-danger-border';
}

interface ExtractionConfigPanelProps {
  documentId: string | null;
  ocrMode: ExtractionMode | null;
  setOcrMode: (mode: ExtractionMode) => void;
  customFields: string;
  setCustomFields: (v: string) => void;
  processingOcr: boolean;
  analyzing: boolean;
  analysisResult: AnalyzeResult | null;
  selectedFields: Set<string>;
  toggleField: (key: string) => void;
  toggleAllFields: () => void;
  handleExtract: () => void;
  onAnalyze: () => void;
  providers: ProviderInfo[];
  selectedProvider: ProviderId | undefined;
  selectedModel: string | undefined;
  onProviderChange: (id: ProviderId) => void;
  onModelChange: (model: string) => void;
}

export function ExtractionConfigPanel({
  documentId, ocrMode, setOcrMode, customFields, setCustomFields,
  processingOcr, analyzing, analysisResult,
  selectedFields, toggleField, toggleAllFields,
  handleExtract, onAnalyze,
  providers, selectedProvider, selectedModel, onProviderChange, onModelChange,
}: ExtractionConfigPanelProps) {
  const activeProvider = providers.find((p) => p.id === selectedProvider);
  const analyzeLabel = activeProvider?.displayName ?? 'IA';
  const activeModels = activeProvider?.models ?? [];
  const activeModelName = activeModels.find((m) => m.id === selectedModel)?.name ?? activeModels[0]?.name;
  return (
    <div className="flex-1 flex flex-col gap-4 p-3 lg:p-4 sm:p-5 overflow-y-auto">

      {/* Smart analyze card */}
      <div className="rounded-md border border-border overflow-hidden">
        <div className="px-4 pt-4 pb-3 bg-surface-card">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 rounded-md bg-fg-primary flex items-center justify-center flex-shrink-0">
              <SparkleIcon size={14} className="text-fg-inverse" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-fg-primary">Análisis inteligente</p>
              <p className="text-caption text-fg-tertiary mt-0.5 leading-relaxed">
                {analyzeLabel} detecta el tipo de documento y sugiere qué campos extraer
              </p>
            </div>
          </div>
          <button
            onClick={onAnalyze}
            disabled={!documentId || analyzing}
            className="h-10 w-full flex items-center justify-center gap-2 bg-fg-primary text-fg-inverse text-button rounded-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing
              ? <><SpinnerIcon size={13} />Analizando documento…</>
              : <><SparkleIcon size={13} />Analizar con IA</>}
          </button>
        </div>

        {analysisResult && (
          <div className="border-t border-border bg-surface-card px-4 py-3 animate-slide-up">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-body-sm font-medium text-fg-primary">
                {analysisResult.detectedTypeLabel}
              </span>
              <span className={`text-overline font-medium px-1.5 py-0.5 rounded-full border ${confidenceBadge(analysisResult.confidence)}`}>
                {Math.round(analysisResult.confidence * 100)}% confianza
              </span>
            </div>
            <p className="text-caption text-fg-secondary mb-3 leading-relaxed">{analysisResult.description}</p>

            <div className="flex items-center justify-between mb-2">
              <p className="text-overline text-overline-uppercase text-fg-tertiary">
                Campos sugeridos — {analysisResult.suggestedFields.length} detectados
              </p>
              <button
                onClick={toggleAllFields}
                className="text-overline text-fg-tertiary hover:text-fg-primary underline transition-colors"
              >
                {selectedFields.size === analysisResult.suggestedFields.length ? 'Ninguno' : 'Todos'}
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2">
              {analysisResult.suggestedFields.map((f: SuggestedField) => (
                <button
                  key={f.key}
                  onClick={() => toggleField(f.key)}
                  title={f.description}
                  className={`px-2.5 py-1 rounded-full text-caption font-medium border transition-all ${
                    selectedFields.has(f.key)
                      ? 'bg-fg-primary text-fg-inverse border-fg-primary'
                      : 'bg-surface-card text-fg-tertiary border-border hover:border-border-strong'
                  }`}
                >
                  {selectedFields.has(f.key) ? '✓ ' : ''}{f.label}
                </button>
              ))}
            </div>
            <p className="text-overline text-fg-tertiary">
              {selectedFields.size} campo{selectedFields.size !== 1 ? 's' : ''} seleccionado{selectedFields.size !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-overline text-overline-uppercase text-fg-tertiary whitespace-nowrap">
          o elige manualmente
        </span>
        <div className="flex-1 h-px bg-border" />
      </div>

      {/* Mode selector */}
      <div>
        <p className="text-overline text-overline-uppercase text-fg-tertiary mb-2">
          Tipo de extracción
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {MODES.map((mode) => (
            <button
              key={mode}
              onClick={() => setOcrMode(mode)}
              className={`px-3 py-2 rounded-md text-button-sm border text-left transition-colors ${
                !analysisResult && ocrMode === mode
                  ? 'bg-fg-primary text-fg-inverse border-fg-primary'
                  : 'bg-surface-card text-fg-secondary border-border hover:bg-surface-sunken hover:border-border-strong'
              }`}
            >
              {EXTRACTION_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        {ocrMode === 'custom' && !analysisResult && (
          <div className="mt-3">
            <label className="block text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
              Campos <span className="normal-case font-normal">(separados por coma)</span>
            </label>
            <input
              type="text"
              value={customFields}
              onChange={(e) => setCustomFields(e.target.value)}
              placeholder="nombre_completo, cui, cargo, fecha_inicio…"
              className="w-full h-10 px-3 border border-border rounded-md bg-surface-card text-fg-primary text-body-sm placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
            />
          </div>
        )}
      </div>

      {/* Provider + model selector */}
      {providers.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-overline text-overline-uppercase text-fg-tertiary">
            Procesamiento
          </p>

          <div className="flex gap-1.5">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => onProviderChange(p.id)}
                title={p.displayName}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-button-sm border transition-colors ${
                  selectedProvider === p.id
                    ? 'bg-fg-primary text-fg-inverse border-fg-primary'
                    : 'bg-surface-card text-fg-tertiary border-border hover:bg-surface-sunken hover:border-border-strong'
                }`}
              >
                {p.displayName}
              </button>
            ))}
          </div>

          {activeModels.length > 0 && (
            <div>
              <p className="text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
                Modelo
              </p>
              {activeModels.length === 1 ? (
                <p className="text-body-sm text-fg-secondary px-3 py-2 bg-surface-sunken rounded-md border border-border truncate">
                  {activeModels[0].name}
                </p>
              ) : (
                <select
                  value={selectedModel ?? ''}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full h-10 px-3 border border-border rounded-md bg-surface-card text-fg-primary text-body-sm cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
                >
                  {activeModels.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      )}

      {/* Extract button */}
      <button
        onClick={handleExtract}
        disabled={
          !documentId
          || processingOcr
          || (analysisResult !== null && selectedFields.size === 0)
          || (analysisResult === null && !ocrMode)
        }
        className="h-11 w-full flex items-center justify-center gap-2 bg-fg-primary text-fg-inverse text-button-lg rounded-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {processingOcr
          ? <><SpinnerIcon />Procesando{activeModelName ? ` con ${activeModelName}` : '…'}</>
          : !analysisResult && !ocrMode
            ? <><OcrIcon />Elegí un tipo o analizá con IA</>
            : <><OcrIcon />Extraer datos con OCR</>}
      </button>
    </div>
  );
}
