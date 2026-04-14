'use client';

import React from 'react';
import { OcrIcon, SparkleIcon, ChatIcon } from '@/shared/ui/icons';
import type { ExtractionMode, OCRResponse, AnalyzeResult } from '@/features/ocr/types/ocr.types';
import { useOCRPanel } from '../hooks/useOCRPanel';
import { ExtractionConfigPanel } from './ExtractionConfigPanel';
import { OCRResultPanel } from './OCRResultPanel';
import { OCRChatPanel } from './OCRChatPanel';

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
  const panel = useOCRPanel({
    documentId, analysisResult, ocrResult, querying,
    ocrMode, customFields, onExtract, onQuery,
  });

  const fieldCount = ocrResult?.extractedData
    ? Object.keys(ocrResult.extractedData).length
    : 0;

  return (
    <div className="lg:col-span-3 flex flex-col min-h-[320px] sm:min-h-[420px]">
      {/* Tab bar */}
      <div className="flex border-b border-[var(--border)] bg-white">
        <TabBtn active={panel.activePanel === 'config'} onClick={() => panel.setActivePanel('config')}>
          <OcrIcon size={12} />Extracción
        </TabBtn>
        <TabBtn active={panel.activePanel === 'result'} onClick={() => panel.setActivePanel('result')} disabled={!ocrResult}>
          <SparkleIcon size={12} />Resultado
          {ocrResult && (
            <span className="ml-1 text-[9px] font-bold bg-emerald-100 text-emerald-700 rounded-full px-1.5 py-0.5 leading-none">
              {fieldCount}
            </span>
          )}
        </TabBtn>
        <TabBtn active={panel.activePanel === 'chat'} onClick={() => panel.setActivePanel('chat')} disabled={!documentId}>
          <ChatIcon size={12} />Preguntar
          {queryHistory.length > 0 && (
            <span className="ml-1 text-[9px] font-bold bg-stone-200 text-stone-600 rounded-full px-1.5 py-0.5 leading-none">
              {queryHistory.length}
            </span>
          )}
        </TabBtn>
      </div>

      {panel.activePanel === 'config' && (
        <ExtractionConfigPanel
          documentId={documentId}
          ocrMode={ocrMode}
          setOcrMode={setOcrMode}
          customFields={customFields}
          setCustomFields={setCustomFields}
          processingOcr={processingOcr}
          analyzing={analyzing}
          analysisResult={analysisResult}
          selectedFields={panel.selectedFields}
          toggleField={panel.toggleField}
          toggleAllFields={panel.toggleAllFields}
          handleExtract={panel.handleExtract}
          onAnalyze={onAnalyze}
        />
      )}

      {panel.activePanel === 'result' && (
        <OCRResultPanel
          ocrResult={ocrResult}
          copiedKey={panel.copiedKey}
          copyField={panel.copyField}
          exportJson={panel.exportJson}
          onGoToChat={() => panel.setActivePanel('chat')}
          onGoToConfig={() => panel.setActivePanel('config')}
        />
      )}

      {panel.activePanel === 'chat' && (
        <OCRChatPanel
          documentId={documentId}
          queryHistory={queryHistory}
          querying={querying}
          question={panel.question}
          setQuestion={panel.setQuestion}
          handleSendQuestion={panel.handleSendQuestion}
          chatEndRef={panel.chatEndRef}
        />
      )}
    </div>
  );
}

function TabBtn({
  children, active, onClick, disabled,
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
