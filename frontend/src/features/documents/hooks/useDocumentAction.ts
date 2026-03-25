import { useState } from 'react';
import { useDocumentStore } from '../store';
import { useOCRStore } from '../../ocr/store';
import type { Document } from '../types/document.types';

export function useDocumentAction(doc: Document) {
  const { updateDocument } = useDocumentStore();
  const { processDocument, analyzeDocument, processing } = useOCRStore();
  const [isProcessingLocal, setIsProcessingLocal] = useState(false);

  const handleExtract = async () => {
    setIsProcessingLocal(true);
    const result = await processDocument(doc.id);
    if (result) {
      updateDocument(doc.id, { status: 'completed', extractedData: result.extractedData });
    }
    setIsProcessingLocal(false);
  };

  const handleSmartExtract = async () => {
    setIsProcessingLocal(true);
    const analysis = await analyzeDocument(doc.id);
    if (analysis) {
      const fields = analysis.suggestedFields.map((f: { key: string }) => f.key);
      const result = await processDocument(doc.id, 'custom', fields);
      if (result) {
        updateDocument(doc.id, { status: 'completed', extractedData: result.extractedData });
      }
    }
    setIsProcessingLocal(false);
  };

  const isLocked = processing && !isProcessingLocal;

  return {
    handleExtract,
    handleSmartExtract,
    isProcessingLocal,
    isLocked,
  };
}
