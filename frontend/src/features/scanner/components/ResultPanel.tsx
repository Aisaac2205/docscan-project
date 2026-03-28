'use client';

import { useState } from 'react';
import { PrintIcon, SparkleIcon, OcrIcon, SpinnerIcon } from '@/shared/ui/icons';
import type { ExtractionMode, OCRResponse, AnalyzeResult } from '@/features/ocr/types/ocr.types';
import { OCRPanel } from './OCRPanel';

interface ResultPanelProps {
  previewUrl: string;
  ocrResult: OCRResponse | null;
  documentId: string | null;
  ocrMode: ExtractionMode;
  setOcrMode: (mode: ExtractionMode) => void;
  customFields: string;
  setCustomFields: (v: string) => void;
  processingOcr: boolean;
  analyzing: boolean;
  querying: boolean;
  analysisResult: AnalyzeResult | null;
  queryHistory: { id: string; question: string; answer: string; createdAt: string }[];
  onExtract: (fields?: string[]) => void;
  onAnalyze: () => void;
  onQuery: (question: string) => void;
  onPrint: () => void;
}

export function ResultPanel({
  previewUrl, ocrResult, documentId,
  ocrMode, setOcrMode, customFields, setCustomFields,
  processingOcr, analyzing, querying,
  analysisResult, queryHistory,
  onExtract, onAnalyze, onQuery, onPrint,
}: ResultPanelProps) {
  const [imgExpanded, setImgExpanded] = useState(false);
  const hasOcrData = !!ocrResult?.extractedData;

  const status = analyzing || processingOcr
    ? 'processing'
    : hasOcrData ? 'completed'
    : analysisResult ? 'analyzed'
    : 'captured';

  const statusMeta = {
    processing: { label: 'Procesando…', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    completed:  { label: 'Datos extraídos', cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    analyzed:   { label: 'Analizado', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
    captured:   { label: 'Capturado', cls: 'bg-stone-100 text-stone-500 border-stone-200' },
  }[status];

  return (
    <div className="mt-6 bg-white border border-[var(--border)] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-5 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-stone-100 flex items-center justify-center">
            <OcrIcon size={13} className="text-stone-500" />
          </div>
          <div>
            <p className="text-[12px] font-semibold text-stone-800 leading-none">Visor de documento</p>
            <p className="text-[10px] text-stone-400 mt-0.5 leading-none">
              {documentId ? `ID: ${documentId.slice(0, 10)}…` : 'Sin documento cargado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusMeta.cls}`}>
            {(analyzing || processingOcr) && <SpinnerIcon size={9} />}
            {statusMeta.label}
          </span>
          {hasOcrData && (
            <button
              onClick={onPrint}
              className="h-7 px-3 flex items-center gap-1.5 text-xs font-medium border border-[var(--border)] text-stone-600 bg-white rounded-md hover:bg-stone-50 hover:text-stone-900 transition-colors"
            >
              <PrintIcon />Imprimir
            </button>
          )}
        </div>
      </div>

      {/* Body: image (2/5) + OCR panel (3/5) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-[var(--border)]">
        {/* Image pane */}
        <div className="lg:col-span-2 flex flex-col">
          <div
            className={`relative bg-[#F0EDE8] flex items-center justify-center overflow-hidden transition-all duration-300 ${
              imgExpanded ? 'h-[360px] sm:h-[560px]' : 'h-[260px] sm:h-[420px]'
            }`}
          >
            {previewUrl.toLowerCase().endsWith('.pdf') ? (
              <iframe
                src={previewUrl}
                title="Documento PDF"
                className="w-full h-full border-0"
              />
            ) : (
              <img
                src={previewUrl}
                alt="Documento capturado"
                className="max-w-full max-h-full object-contain drop-shadow-md"
              />
            )}
            <button
              onClick={() => setImgExpanded((v) => !v)}
              className="absolute bottom-2 right-2 h-6 px-2.5 text-[10px] font-semibold bg-black/40 text-white rounded-md hover:bg-black/60 transition-colors backdrop-blur-sm"
            >
              {imgExpanded ? '↑ Reducir' : '↓ Expandir'}
            </button>
          </div>

          {/* Image footer */}
          <div className="px-3 sm:px-4 py-2.5 bg-stone-50 border-t border-[var(--border)] flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">
                {previewUrl.toLowerCase().endsWith('.pdf') ? 'PDF' : 'Imagen'}
              </p>
              <p className="text-[11px] text-stone-600 mt-0.5 truncate">
                {ocrResult
                  ? `Modo: ${ocrResult.extractionMode}`
                  : previewUrl.toLowerCase().endsWith('.pdf')
                  ? 'PDF · Listo para procesar'
                  : 'Listo para procesar'}
              </p>
            </div>
            {analysisResult && (
              <div className="flex items-center gap-1 flex-shrink-0 bg-stone-100 rounded-full px-2 py-1">
                <SparkleIcon size={10} className="text-stone-500" />
                <span className="text-[10px] text-stone-600 font-medium">{analysisResult.detectedTypeLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* OCR Panel */}
        <OCRPanel
          documentId={documentId}
          ocrMode={ocrMode}
          setOcrMode={setOcrMode}
          customFields={customFields}
          setCustomFields={setCustomFields}
          processingOcr={processingOcr}
          analyzing={analyzing}
          querying={querying}
          ocrResult={ocrResult}
          analysisResult={analysisResult}
          queryHistory={queryHistory}
          onExtract={onExtract}
          onAnalyze={onAnalyze}
          onQuery={onQuery}
        />
      </div>
    </div>
  );
}
