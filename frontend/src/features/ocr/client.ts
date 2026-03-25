import { api } from '@/shared/api/client';
import type { OCRResponse, ExtractionMode, AnalyzeResult, QueryResult, QueryHistoryItem } from './types/ocr.types';

export const ocrClient = {
  async processDocument(
    documentId: string,
    extractionMode: ExtractionMode = 'general',
    customFields?: string[],
  ): Promise<OCRResponse> {
    const res = await api.post<OCRResponse>('/api/ocr/process', {
      documentId,
      extractionMode,
      ...(customFields?.length ? { customFields } : {}),
    });
    return res.data;
  },

  async analyzeDocument(documentId: string): Promise<AnalyzeResult> {
    const res = await api.post<AnalyzeResult>('/api/ocr/analyze', { documentId });
    return res.data;
  },

  async queryDocument(documentId: string, question: string): Promise<QueryResult> {
    const res = await api.post<QueryResult>('/api/ocr/query', { documentId, question });
    return res.data;
  },

  async getQueryHistory(documentId: string): Promise<QueryHistoryItem[]> {
    const res = await api.get<QueryHistoryItem[]>(`/api/ocr/query/${documentId}/history`);
    return res.data;
  },
};
