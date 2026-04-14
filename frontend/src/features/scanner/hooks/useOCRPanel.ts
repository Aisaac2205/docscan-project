import { useState, useRef, useEffect } from 'react';
import type { ExtractionMode, OCRResponse, AnalyzeResult } from '@/features/ocr/types/ocr.types';

export type Panel = 'config' | 'result' | 'chat';

interface UseOCRPanelOptions {
  documentId: string | null;
  analysisResult: AnalyzeResult | null;
  ocrResult: OCRResponse | null;
  querying: boolean;
  ocrMode: ExtractionMode;
  customFields: string;
  onExtract: (fields?: string[]) => void;
  onQuery: (question: string) => void;
}

export interface OCRPanelHandlers {
  activePanel: Panel;
  setActivePanel: (p: Panel) => void;
  selectedFields: Set<string>;
  toggleField: (key: string) => void;
  toggleAllFields: () => void;
  question: string;
  setQuestion: (v: string) => void;
  copiedKey: string | null;
  copyField: (key: string, value: string) => void;
  exportJson: () => void;
  handleExtract: () => void;
  handleSendQuestion: () => void;
  chatEndRef: React.RefObject<HTMLDivElement>;
}

export function useOCRPanel({
  documentId,
  analysisResult,
  ocrResult,
  querying,
  ocrMode,
  customFields,
  onExtract,
  onQuery,
}: UseOCRPanelOptions): OCRPanelHandlers {
  const [activePanel, setActivePanel] = useState<Panel>('config');
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [question, setQuestion] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-seleccionar todos los campos sugeridos cuando llega un nuevo análisis
  useEffect(() => {
    if (analysisResult) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- patrón intencional: sincronizar campos sugeridos cuando cambia el análisis
      setSelectedFields(new Set(analysisResult.suggestedFields.map((f) => f.key)));
    }
  }, [analysisResult]);

  // Cambiar al panel de resultado automáticamente cuando llega el OCR
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- patrón intencional: cambiar panel activo cuando llega el resultado OCR
    if (ocrResult) setActivePanel('result');
  }, [ocrResult]);

  // Scroll al final del chat cuando llega una nueva respuesta
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatEndRef]);

  const toggleField = (key: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const toggleAllFields = () => {
    if (!analysisResult) return;
    const allKeys = analysisResult.suggestedFields.map((f) => f.key);
    setSelectedFields(
      selectedFields.size === allKeys.length ? new Set() : new Set(allKeys),
    );
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
    if (!question.trim() || querying || !documentId) return;
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
    const blob = new Blob(
      [JSON.stringify(ocrResult.extractedData, null, 2)],
      { type: 'application/json' },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ocr-${ocrResult.documentId.slice(0, 8)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return {
    activePanel,
    setActivePanel,
    selectedFields,
    toggleField,
    toggleAllFields,
    question,
    setQuestion,
    copiedKey,
    copyField,
    exportJson,
    handleExtract,
    handleSendQuestion,
    chatEndRef,
  };
}
