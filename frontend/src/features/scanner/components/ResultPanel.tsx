'use client';

import { useState } from 'react';
import { PrintIcon, SparkleIcon, OcrIcon, SpinnerIcon } from '@/shared/ui/icons';
import type { ExtractionMode, OCRResponse, AnalyzeResult, ProviderInfo, ProviderId } from '@/features/ocr/types/ocr.types';
import { OCRPanel } from './OCRPanel';

function buildPdfViewerSrc(url: string): string {
  const params = 'navpanes=0&view=FitH';
  if (url.includes('#')) return `${url}&${params}`;
  return `${url}#${params}`;
}

interface ResultPanelProps {
  previewUrl: string;
  ocrResult: OCRResponse | null;
  documentId: string | null;
  ocrMode: ExtractionMode | null;
  setOcrMode: (mode: ExtractionMode) => void;
  customFields: string;
  setCustomFields: (v: string) => void;
  processingOcr: boolean;
  analyzing: boolean;
  querying: boolean;
  analysisResult: AnalyzeResult | null;
  queryHistory: { id: string; question: string; answer: string; createdAt: string }[];
  providers: ProviderInfo[];
  selectedProvider: ProviderId | undefined;
  selectedModel: string | undefined;
  onProviderChange: (id: ProviderId) => void;
  onModelChange: (model: string) => void;
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
  providers, selectedProvider, selectedModel, onProviderChange, onModelChange,
  onExtract, onAnalyze, onQuery, onPrint,
}: ResultPanelProps) {
  const [imgExpanded, setImgExpanded] = useState(false);
  const isPdf = previewUrl.toLowerCase().endsWith('.pdf');
  const pdfViewerSrc = isPdf ? buildPdfViewerSrc(previewUrl) : previewUrl;
  const hasOcrData = !!ocrResult?.extractedData;
  const hasResultLikeState = hasOcrData || !!analysisResult;

  const status = analyzing || processingOcr
    ? 'processing'
    : hasOcrData ? 'completed'
    : analysisResult ? 'analyzed'
    : 'captured';

  const statusMeta = {
    processing: { label: 'Procesando…', cls: 'bg-warning-bg text-warning-fg border-warning-border' },
    completed:  { label: 'Datos extraídos', cls: 'bg-success-bg text-success-fg border-success-border' },
    analyzed:   { label: 'Analizado', cls: 'bg-info-bg text-info-fg border-info-border' },
    captured:   { label: 'Capturado', cls: 'bg-surface-sunken text-fg-tertiary border-border' },
  }[status];

  return (
    <div className="mt-6 bg-surface-card border border-border rounded-md overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 sm:px-5 lg:px-6 py-3 lg:py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-surface-sunken flex items-center justify-center">
            <OcrIcon size={14} className="text-fg-tertiary" />
          </div>
          <div>
            <p className="text-body-sm font-medium text-fg-primary leading-none">Visor de documento</p>
            <p className="text-caption text-fg-tertiary mt-0.5 leading-none">
              {documentId ? `ID: ${documentId.slice(0, 10)}…` : 'Sin documento cargado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-overline font-medium px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusMeta.cls}`}>
            {(analyzing || processingOcr) && <SpinnerIcon size={10} />}
            {statusMeta.label}
          </span>
          {hasOcrData && (
            <button
              onClick={onPrint}
              className="h-8 px-3 flex items-center gap-1.5 text-button-sm font-medium border border-border text-fg-secondary bg-surface-card rounded-md hover:bg-surface-sunken hover:text-fg-primary transition-colors"
            >
              <PrintIcon />Imprimir
            </button>
          )}
        </div>
      </div>

      {/* Body: preview + OCR panel */}
      <div className="flex flex-col lg:flex-row lg:items-start">
        {/* Image pane */}
        <div
          className={`flex flex-col border-b lg:border-b-0 lg:border-r border-border ${
            isPdf ? 'lg:w-[50%] lg:max-w-[760px]' : 'lg:w-[42%] lg:max-w-[560px]'
          }`}
        >
          <div
            className={`relative bg-surface-page flex items-center justify-center overflow-hidden transition-all duration-300 ${
              imgExpanded
                ? isPdf ? 'h-[360px] sm:h-[560px] lg:h-[760px]' : 'h-[340px] sm:h-[520px] lg:h-[640px]'
                : hasResultLikeState
                  ? isPdf ? 'h-[280px] sm:h-[420px] lg:h-[620px]' : 'h-[230px] sm:h-[330px] lg:h-[380px]'
                  : isPdf ? 'h-[320px] sm:h-[500px] lg:h-[700px]' : 'h-[260px] sm:h-[420px] lg:h-[560px]'
            }`}
          >
            {isPdf ? (
              <div className="w-full h-full p-2 sm:p-3 lg:p-4">
                <iframe
                  src={pdfViewerSrc}
                  title="Documento PDF"
                  className="w-full h-full border border-border rounded-md bg-surface-card"
                />
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Documento capturado"
                className="max-w-full max-h-full object-contain drop-shadow-md"
              />
            )}
            <button
              onClick={() => setImgExpanded((v) => !v)}
              className="absolute bottom-2 right-2 h-7 px-2.5 text-overline font-medium bg-brand-ink-700/70 text-fg-inverse rounded-md hover:bg-brand-ink-700 transition-colors backdrop-blur-sm"
            >
              {imgExpanded ? '↙ Ajustar' : '↗ Expandir'}
            </button>
          </div>

          {/* Image footer */}
          <div className="px-3 sm:px-4 lg:px-5 py-2.5 lg:py-3 bg-surface-sunken border-t border-border flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-overline text-overline-uppercase text-fg-tertiary">
                {isPdf ? 'PDF' : 'Imagen'}
              </p>
              <p className="text-caption text-fg-secondary mt-0.5 truncate">
                {ocrResult
                  ? `Modo: ${ocrResult.extractionMode}`
                  : isPdf
                  ? 'PDF · Listo para procesar'
                  : 'Listo para procesar'}
              </p>
            </div>
            {analysisResult && (
              <div className="flex items-center gap-1 flex-shrink-0 bg-surface-card border border-border rounded-full px-2 py-1">
                <SparkleIcon size={11} className="text-fg-tertiary" />
                <span className="text-caption text-fg-secondary font-medium">{analysisResult.detectedTypeLabel}</span>
              </div>
            )}
          </div>
        </div>

        {/* OCR Panel */}
        <div className="flex-1 min-w-0">
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
            providers={providers}
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            onExtract={onExtract}
            onAnalyze={onAnalyze}
            onQuery={onQuery}
          />
        </div>
      </div>
    </div>
  );
}
