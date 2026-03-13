import { useState, useCallback } from 'react';
import { ocrClient } from '@/lib/ocr-client';
import { OCRResult } from '@/types/document.types';

export function useOCR() {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const processImage = useCallback(async (file: File): Promise<OCRResult | null> => {
    setProcessing(true);
    setError(null);
    setProgress(0);

    try {
      const ocrResult = await ocrClient.recognizeImage(file, (p) => {
        setProgress(p);
      });

      const resultWithId: OCRResult = {
        text: ocrResult.text,
        confidence: ocrResult.confidence,
        documentId: '',
      };

      setResult(resultWithId);
      return resultWithId;
    } catch (err: any) {
      setError(err.message || 'Error al procesar OCR');
      return null;
    } finally {
      setProcessing(false);
      setProgress(0);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setProgress(0);
  }, []);

  return {
    processing,
    result,
    error,
    progress,
    processImage,
    reset,
  };
}
