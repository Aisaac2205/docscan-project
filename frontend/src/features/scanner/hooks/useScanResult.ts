import { useState, useRef } from 'react';
import { useOCRStore } from '@/features/ocr/store';
import { useDocumentStore } from '@/features/documents/store';
import { toast } from '@/shared/ui/toast/store';
import type { ExtractionMode } from '@/features/ocr/types/ocr.types';
import type { CaptureResult } from '../types/scanner.types';

export function useScanResult() {
  const {
    processDocument, analyzeDocument, queryDocument,
    lastResult, analysisResult, queryHistory,
    analyzing, querying,
  } = useOCRStore();
  const { addDocument } = useDocumentStore();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [processingOcr, setProcessingOcr] = useState(false);
  const [ocrMode, setOcrMode] = useState<ExtractionMode>('general');
  const [customFields, setCustomFields] = useState('');
  const documentIdRef = useRef<string | null>(null);

  const applyResult = (res: CaptureResult | null): boolean => {
    if (!res?.url) return false;
    setPreviewUrl(res.url);
    documentIdRef.current = res.documentId;
    setDocumentId(res.documentId);
    addDocument({
      id: res.documentId,
      originalName: res.originalName,
      filePath: res.url,
      mimeType: 'image/png',
      userId: '',
      rawText: null,
      confidence: null,
      status: 'pending',
      extractedData: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return true;
  };

  const handleAnalyze = async () => {
    if (!documentIdRef.current) return;
    const result = await analyzeDocument(documentIdRef.current);
    if (!result) toast.error('No se pudo analizar el documento');
  };

  const handleExtract = async (fields?: string[]) => {
    if (!documentIdRef.current) return;
    setProcessingOcr(true);
    try {
      let mode: ExtractionMode = ocrMode;
      let customFieldsArr: string[] | undefined = fields;

      if (fields && fields.length > 0) {
        // When coming from smart analysis, use custom mode with selected fields
        mode = 'custom';
        customFieldsArr = fields;
      } else if (ocrMode === 'custom') {
        customFieldsArr = customFields.split(',').map((f) => f.trim()).filter(Boolean);
      }

      const result = await processDocument(documentIdRef.current, mode, customFieldsArr);
      if (result) toast.success('Datos extraídos correctamente');
      else toast.error('No se pudieron extraer los datos');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error en el procesamiento OCR');
    } finally {
      setProcessingOcr(false);
    }
  };

  const handleQuery = async (question: string) => {
    if (!documentIdRef.current) return;
    const result = await queryDocument(documentIdRef.current, question);
    if (!result) toast.error('No se pudo consultar el documento');
  };

  return {
    previewUrl,
    documentId,
    documentIdRef,
    processingOcr,
    analyzing,
    querying,
    ocrMode,
    setOcrMode,
    customFields,
    setCustomFields,
    ocrResult: lastResult,
    analysisResult,
    queryHistory,
    applyResult,
    handleAnalyze,
    handleExtract,
    handleQuery,
  };
}
