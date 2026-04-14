import { useState, useRef, useEffect } from 'react';
import { useOCRStore } from '@/features/ocr/store';
import { useDocumentStore } from '@/features/documents/store';
import { ocrClient } from '@/features/ocr/client';
import { toast } from '@/shared/ui/toast/store';
import type { ExtractionMode, ProviderInfo, ProviderId } from '@/features/ocr/types/ocr.types';
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

  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<ProviderId | undefined>(undefined);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);

  useEffect(() => {
    ocrClient.getProviders()
      .then((list) => {
        const available = list.filter((p) => p.available);
        setProviders(available);
        if (available.length > 1) {
          setSelectedProvider(available[0].id);
          setSelectedModel(available[0].models[0]?.id);
        }
      })
      .catch(() => {});
  }, []);

  // Cuando cambia el provider, resetear el modelo al primero disponible de ese provider
  const handleProviderChange = (id: ProviderId) => {
    setSelectedProvider(id);
    const provider = providers.find((p) => p.id === id);
    setSelectedModel(provider?.models[0]?.id);
  };

  const applyResult = (res: CaptureResult | null): boolean => {
    if (!res?.url) return false;
    setPreviewUrl(res.url);
    documentIdRef.current = res.documentId;
    setDocumentId(res.documentId);
    addDocument({
      id: res.documentId,
      originalName: res.originalName,
      filePath: res.url,
      mimeType: res.url.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/webp',
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
    const result = await analyzeDocument(documentIdRef.current, selectedProvider, selectedModel);
    if (!result) toast.error('No se pudo analizar el documento');
  };

  const handleExtract = async (fields?: string[]) => {
    if (!documentIdRef.current) return;
    setProcessingOcr(true);
    try {
      let mode: ExtractionMode = ocrMode;
      let customFieldsArr: string[] | undefined = fields;

      if (fields && fields.length > 0) {
        mode = 'custom';
        customFieldsArr = fields;
      } else if (ocrMode === 'custom') {
        customFieldsArr = customFields.split(',').map((f) => f.trim()).filter(Boolean);
      }

      const result = await processDocument(documentIdRef.current, mode, customFieldsArr, selectedProvider, selectedModel);
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
    const result = await queryDocument(documentIdRef.current, question, selectedProvider, selectedModel);
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
    providers,
    selectedProvider,
    selectedModel,
    setSelectedModel,
    onProviderChange: handleProviderChange,
    applyResult,
    handleAnalyze,
    handleExtract,
    handleQuery,
  };
}
