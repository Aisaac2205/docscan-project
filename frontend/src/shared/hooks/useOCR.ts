import { useCallback, useState } from 'react';
import { useOCRStore } from '@/features/ocr/store';
import type { OCRResponse, ExtractionMode } from '@/features/ocr/types/ocr.types';

export function useOCR() {
  const { lastResult, processing: storeProcessing, error: storeError, processDocument, reset: resetStore } = useOCRStore();
  const [progress, setProgress] = useState(0);

  const processDocumentWithProgress = useCallback(async (
    documentId: string,
    mode?: ExtractionMode,
    customFields?: string[],
  ): Promise<OCRResponse | null> => {
    setProgress(0);
    const res = await processDocument(documentId, mode, customFields);
    setProgress(100);
    return res;
  }, [processDocument]);

  const reset = useCallback(() => {
    resetStore();
    setProgress(0);
  }, [resetStore]);

  return {
    processing: storeProcessing,
    result: lastResult as OCRResponse | null,
    error: storeError,
    progress,
    processDocument: processDocumentWithProgress,
    reset,
  };
}
