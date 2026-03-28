'use client';

import { useState, useRef, useEffect } from 'react';
import { SpinnerIcon, OcrIcon, SparkleIcon, SendIcon, ChatIcon } from '@/shared/ui/icons';
import type { ExtractionMode, OCRResponse, AnalyzeResult, SuggestedField } from '@/features/ocr/types/ocr.types';
import { EXTRACTION_MODE_LABELS } from '@/features/ocr/types/ocr.types';
import { formatValue } from '../utils/format';

// Inline icons to avoid touching shared file
function CopyIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <rect x="4" y="4" width="8" height="8" rx="1.2" stroke="currentColor" strokeWidth="1.2" />
      <path d="M2 9H1.5A.5.5 0 0 1 1 8.5v-7A.5.5 0 0 1 1.5 1h7a.5.5 0 0 1 .5.5V2"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function CheckSmallIcon({ size = 13, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <path d="M2.5 6.5l3 3 5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon({ size = 12, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M6 1v7M3 5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M1 10h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

const MODES = Object.entries(EXTRACTION_MODE_LABELS) as [ExtractionMode, string][];

type Panel = 'config' | 'result' | 'chat';

interface OCRPanelProps {
  documentId: string | null;
  ocrMode: ExtractionMode;
  setOcrMode: (mode: ExtractionMode) => void;
  customFields: string;
  setCustomFields: (v: string) => void;
  processingOcr: boolean;
  analyzing: boolean;
  querying: boolean;
  ocrResult: OCRResponse | null;
  analysisResult: AnalyzeResult | null;
  queryHistory: { id: string; question: string; answer: string; createdAt: string }[];
  onExtract: (fields?: string[]) => void;
  onAnalyze: () => void;
  onQuery: (question: string) => void;
}

export function OCRPanel({
  documentId, ocrMode, setOcrMode, customFields, setCustomFields,
  processingOcr, analyzing, querying,
  ocrResult, analysisResult, queryHistory,
  onExtract, onAnalyze, onQuery,
}: OCRPanelProps) {
  const [activePanel, setActivePanel] = useState<Panel>('config');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (analysisResult) {
      setSelectedFields(new Set(analysisResult.suggestedFields.map((f) => f.key)));
    }
  }, [analysisResult]);

  useEffect(() => {
    if (ocrResult) setActivePanel('result');
  }, [ocrResult]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [queryHistory]);

  const toggleField = (key: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const handleExtract = () => {
    if (analysisResult && selectedFields.size > 0) {
      onExtract(Array.from(selectedFields));
    } else if (ocrMode === 'custom') {
      const fields = customFields.split(',').map((f) => f.trim()).filter(Boolean);
      onExtract(fields.length > 0 ? fields : undefined);
    } else {
      onExtract();
    }
  };

  const handleSendQuestion = () => {
    if (!question.trim() || querying) return;
    onQuery(question.trim());
    setQuestion('');
  };

  const copyField = (key: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 1500);
    }).catch(() => {});
  };

  const exportJson = () => {
    if (!ocrResult?.extractedData) return;
    const blob = new Blob([JSON.stringify(ocrResult.extractedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-${ocrResult.documentId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const confidenceBadge = (c: number) =>
    c >= 0.85 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    c >= 0.65 ? 'text-amber-700 bg-amber-50 border-amber-200' :
    'text-red-700 bg-red-50 border-red-200';

  const fieldCount = ocrResult?.extractedData ? Object.keys(ocrResult.extractedData).length : 0;

  return (
    <div className="lg:col-span-3 flex flex-col min-h-[320px] sm:min-h-[420px]">
      {/* ── Tab bar ── */}
      <div className="flex border-b border-[var(--border)] bg-white">
        <TabBtn active={activePanel === 'config'} onClick={() => setActivePanel('config')}>
          <OcrIcon size={12} />Extracción
        </TabBtn>
        <TabBtn active={activePanel === 'result'} onClick={() => setActivePanel('result')} disabled={!ocrResult}>
          <SparkleIcon size={12} />Resultado
          {ocrResult && (
            <span className="ml-1 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 leading-none">
              {fieldCount}
            </span>
          )}
        </TabBtn>
        <TabBtn active={activePanel === 'chat'} onClick={() => setActivePanel('chat')} disabled={!documentId}>
          <ChatIcon size={12} />Preguntar
          {queryHistory.length > 0 && (
            <span className="ml-1 text-[9px] font-bold bg-stone-200 text-stone-600 rounded-full px-1.5 py-0.5 leading-none">
              {queryHistory.length}
            </span>
          )}
        </TabBtn>
      </div>

      {/* ── EXTRACCIÓN ── */}
      {activePanel === 'config' && (
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
                    Gemini detecta el tipo de documento y sugiere qué campos extraer
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

            {/* Analysis result */}
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
                    onClick={() =>
                      selectedFields.size === analysisResult.suggestedFields.length
                        ? setSelectedFields(new Set())
                        : setSelectedFields(new Set(analysisResult.suggestedFields.map((f: SuggestedField) => f.key)))
                    }
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
                  placeholder="proveedor, fecha, monto, NIT…"
                  className="w-full h-9 px-3 border border-[var(--border)] rounded-lg bg-white text-stone-800 text-sm focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10 transition-all"
                />
              </div>
            )}
          </div>

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
      )}

      {/* ── RESULTADO ── */}
      {activePanel === 'result' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {ocrResult?.extractedData ? (
            <>
              {/* Result header */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-semibold text-stone-700">
                    {fieldCount} campo{fieldCount !== 1 ? 's' : ''} extraído{fieldCount !== 1 ? 's' : ''}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 font-medium border border-[var(--border)]">
                    {EXTRACTION_MODE_LABELS[ocrResult.extractionMode] ?? ocrResult.extractionMode}
                  </span>
                </div>
                <button
                  onClick={exportJson}
                  className="h-6 px-2.5 flex items-center gap-1 text-[10px] font-semibold border border-[var(--border)] text-stone-500 bg-white rounded-md hover:bg-stone-50 hover:text-stone-800 transition-colors"
                >
                  <DownloadIcon size={11} />JSON
                </button>
              </div>

              {/* Fields */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {Object.entries(ocrResult.extractedData).map(([key, value]) => {
                  const formatted = formatValue(value);
                  const copied = copiedKey === key;
                  return (
                    <div
                      key={key}
                      className="group bg-white rounded-lg px-3 py-2.5 border border-[var(--border)] hover:border-stone-300 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wide mb-1 flex-1">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <button
                          onClick={() => copyField(key, formatted)}
                          title="Copiar valor"
                          className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity h-5 w-5 flex items-center justify-center text-stone-400 hover:text-stone-700 rounded"
                        >
                          {copied
                            ? <CheckSmallIcon size={12} className="text-emerald-500" />
                            : <CopyIcon size={12} />}
                        </button>
                      </div>
                      <p className="text-[13px] text-stone-800 font-medium break-words leading-relaxed">
                        {formatted}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-[var(--border)]">
                <button
                  onClick={() => setActivePanel('chat')}
                  className="w-full h-8 flex items-center justify-center gap-2 text-xs font-medium border border-[var(--border)] text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
                >
                  <ChatIcon size={11} />¿Tienes preguntas sobre este documento?
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-2">
              <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center mb-1">
                <OcrIcon size={20} className="text-stone-400" />
              </div>
              <p className="text-sm font-medium text-stone-600">Sin datos extraídos aún</p>
              <p className="text-xs text-stone-400 max-w-[200px] leading-relaxed">
                Ve a Extracción y presiona "Extraer datos con OCR"
              </p>
              <button
                onClick={() => setActivePanel('config')}
                className="mt-3 h-8 px-4 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
              >
                Ir a Extracción
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── PREGUNTAR ── */}
      {activePanel === 'chat' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {queryHistory.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-6 gap-2">
                <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center mb-1">
                  <ChatIcon size={20} className="text-stone-400" />
                </div>
                <p className="text-sm font-medium text-stone-600">Pregunta al documento</p>
                <p className="text-xs text-stone-400 max-w-[210px] leading-relaxed">
                  Haz preguntas en lenguaje natural sobre el contenido del documento
                </p>
                <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                  {['¿Cuál es el total?', '¿Quién firma?', '¿Está vencido?', '¿Cuál es la fecha?'].map((hint) => (
                    <button
                      key={hint}
                      onClick={() => setQuestion(hint)}
                      className="px-2.5 py-1 text-[11px] font-medium rounded-full border border-[var(--border)] text-stone-500 hover:bg-stone-50 hover:border-stone-300 transition-colors"
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              queryHistory.map((item) => (
                <div key={item.id} className="space-y-2">
                  {/* Question */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-stone-900 text-white text-[12px] px-3.5 py-2.5 rounded-2xl rounded-tr-sm leading-relaxed">
                      {item.question}
                    </div>
                  </div>
                  {/* Answer */}
                  <div className="flex justify-start items-end gap-2">
                    <div className="w-6 h-6 rounded-full bg-stone-100 border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                      <SparkleIcon size={11} className="text-stone-500" />
                    </div>
                    <div className="max-w-[85%] bg-stone-50 border border-[var(--border)] text-stone-800 text-[12px] px-3.5 py-2.5 rounded-2xl rounded-tl-sm leading-relaxed">
                      {item.answer}
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* Typing indicator */}
            {querying && (
              <div className="flex justify-start items-end gap-2">
                <div className="w-6 h-6 rounded-full bg-stone-100 border border-[var(--border)] flex items-center justify-center flex-shrink-0">
                  <SparkleIcon size={11} className="text-stone-500" />
                </div>
                <div className="bg-stone-50 border border-[var(--border)] px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center">
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0ms]" />
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[var(--border)] bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendQuestion()}
                placeholder="Pregunta sobre el documento…"
                disabled={!documentId || querying}
                className="flex-1 h-9 px-3 border border-[var(--border)] rounded-xl bg-white text-stone-800 text-sm focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10 transition-all disabled:opacity-50 placeholder:text-stone-300"
              />
              <button
                onClick={handleSendQuestion}
                disabled={!question.trim() || querying || !documentId}
                className="h-9 w-9 flex items-center justify-center bg-stone-900 text-white rounded-xl hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
              >
                <SendIcon size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TabBtn({
  children,
  active,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 px-4 py-2.5 text-[11px] font-semibold transition-colors border-b-2 -mb-px disabled:opacity-40 disabled:cursor-not-allowed ${
        active
          ? 'text-stone-900 border-stone-900 bg-white'
          : 'text-stone-400 border-transparent hover:text-stone-600 hover:bg-white/60'
      }`}
    >
      {children}
    </button>
  );
}
