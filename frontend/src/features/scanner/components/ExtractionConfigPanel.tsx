import { SpinnerIcon, OcrIcon, SparkleIcon } from '@/shared/ui/icons';
import type { ExtractionMode, AnalyzeResult, SuggestedField, ProviderInfo, ProviderId } from '@/features/ocr/types/ocr.types';
import { EXTRACTION_MODE_LABELS } from '@/features/ocr/types/ocr.types';

const MODES = Object.entries(EXTRACTION_MODE_LABELS) as [ExtractionMode, string][];

function confidenceBadge(c: number): string {
  if (c >= 0.85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (c >= 0.65) return 'text-amber-700 bg-amber-50 border-amber-200';
  return 'text-red-700 bg-red-50 border-red-200';
}

interface ExtractionConfigPanelProps {
  documentId: string | null;
  ocrMode: ExtractionMode;
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
  const analyzeLabel = activeProvider?.id === 'lmstudio' ? 'Procesamiento Local' : 'Google Gemini';
  const activeModels = activeProvider?.models ?? [];
  return (
    <div className="flex-1 flex flex-col gap-4 p-3 sm:p-5 overflow-y-auto">

      {/* Smart analyze card */}
      <div className="rounded-lg border border-[var(--border)] overflow-hidden">
        <div className="px-4 pt-4 pb-3 bg-white">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center flex-shrink-0">
              <SparkleIcon size={14} className="text-white" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800">Análisis inteligente</p>
              <p className="text-[11px] text-stone-400 mt-0.5 leading-relaxed">
                {analyzeLabel} detecta el tipo de documento y sugiere qué campos extraer
              </p>
            </div>
          </div>
          <button
            onClick={onAnalyze}
            disabled={!documentId || analyzing}
            className="h-9 w-full flex items-center justify-center gap-2 bg-stone-900 text-white text-xs font-semibold rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {analyzing
              ? <><SpinnerIcon className="text-white/60" size={13} />Analizando documento…</>
              : <><SparkleIcon size={13} />Analizar con IA</>}
          </button>
        </div>

        {analysisResult && (
          <div className="border-t border-[var(--border)] bg-white px-4 py-3 animate-slide-up">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[13px] font-semibold text-stone-800">
                {analysisResult.detectedTypeLabel}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${confidenceBadge(analysisResult.confidence)}`}>
                {Math.round(analysisResult.confidence * 100)}% confianza
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mb-3 leading-relaxed">{analysisResult.description}</p>

            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                Campos sugeridos — {analysisResult.suggestedFields.length} detectados
              </p>
              <button
                onClick={toggleAllFields}
                className="text-[10px] text-stone-400 hover:text-stone-700 underline transition-colors"
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
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all ${
                    selectedFields.has(f.key)
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-500 border-[var(--border)] hover:border-stone-400'
                  }`}
                >
                  {selectedFields.has(f.key) ? '✓ ' : ''}{f.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-stone-400">
              {selectedFields.size} campo{selectedFields.size !== 1 ? 's' : ''} seleccionado{selectedFields.size !== 1 ? 's' : ''}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border)]" />
        <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">
          o elige manualmente
        </span>
        <div className="flex-1 h-px bg-[var(--border)]" />
      </div>

      {/* Mode selector */}
      <div>
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">
          Tipo de extracción
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
          {MODES.map(([mode, label]) => (
            <button
              key={mode}
              onClick={() => setOcrMode(mode)}
              className={`px-3 py-2 rounded-lg text-[12px] font-medium border text-left transition-colors ${
                !analysisResult && ocrMode === mode
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-[var(--border)] hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {ocrMode === 'custom' && !analysisResult && (
          <div className="mt-3">
            <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
              Campos <span className="normal-case font-normal">(separados por coma)</span>
            </label>
            <input
              type="text"
              value={customFields}
              onChange={(e) => setCustomFields(e.target.value)}
              placeholder="nombre_completo, cui, cargo, fecha_inicio…"
              className="w-full h-9 px-3 border border-[var(--border)] rounded-lg bg-white text-stone-800 text-sm input-focus"
            />
          </div>
        )}
      </div>

      {/* Provider + model selector — solo visible si hay más de un provider disponible */}
      {providers.length > 1 && (
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
            Procesamiento
          </p>

          {/* Toggle provider */}
          <div className="flex gap-1.5">
            {providers.map((p) => (
              <button
                key={p.id}
                onClick={() => onProviderChange(p.id)}
                title={p.displayName}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium border transition-colors ${
                  selectedProvider === p.id
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white text-stone-500 border-[var(--border)] hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                {p.id === 'gemini' ? 'Nube' : 'Local'}
              </button>
            ))}
          </div>

          {/* Dropdown de modelos — solo si el provider local tiene modelos */}
          {selectedProvider === 'lmstudio' && activeModels.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Modelo
              </p>
              {activeModels.length === 1 ? (
                <p className="text-[12px] text-stone-600 px-3 py-2 bg-stone-50 rounded-lg border border-[var(--border)] truncate">
                  {activeModels[0].name}
                </p>
              ) : (
                <select
                  value={selectedModel ?? ''}
                  onChange={(e) => onModelChange(e.target.value)}
                  className="w-full h-9 px-3 border border-[var(--border)] rounded-lg bg-white text-stone-800 text-[12px] cursor-pointer focus:outline-none focus:ring-1 focus:ring-stone-400"
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
        disabled={!documentId || processingOcr || (analysisResult !== null && selectedFields.size === 0)}
        className="h-10 w-full flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-semibold rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {processingOcr
          ? <><SpinnerIcon className="text-white/60" />Procesando con Gemini…</>
          : <><OcrIcon />Extraer datos con OCR</>}
      </button>
    </div>
  );
}
