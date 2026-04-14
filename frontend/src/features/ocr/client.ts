import { api } from '@/shared/api/client';
import type { OCRResponse, ExtractionMode, AnalyzeResult, QueryResult, QueryHistoryItem, ProviderInfo, ProviderId } from './types/ocr.types';

export const ocrClient = {
  async getProviders(): Promise<ProviderInfo[]> {
    const res = await api.get<ProviderInfo[]>('/api/ocr/providers');
    return res.data;
  },

  async processDocument(
    documentId: string,
    extractionMode: ExtractionMode = 'general',
    customFields?: string[],
    provider?: ProviderId,
    model?: string,
  ): Promise<OCRResponse> {
    const res = await api.post<OCRResponse>('/api/ocr/process', {
      documentId,
      extractionMode,
      ...(customFields?.length ? { customFields } : {}),
      ...(provider ? { provider } : {}),
      ...(model ? { model } : {}),
    });
    return res.data;
  },

  async analyzeDocument(documentId: string, provider?: ProviderId, model?: string): Promise<AnalyzeResult> {
    const res = await api.post<AnalyzeResult>('/api/ocr/analyze', {
      documentId,
      ...(provider ? { provider } : {}),
      ...(model ? { model } : {}),
    });
    return res.data;
  },

  async queryDocument(documentId: string, question: string, provider?: ProviderId, model?: string): Promise<QueryResult> {
    const res = await api.post<QueryResult>('/api/ocr/query', {
      documentId,
      question,
      ...(provider ? { provider } : {}),
      ...(model ? { model } : {}),
    });
    return res.data;
  },

  async getQueryHistory(documentId: string): Promise<QueryHistoryItem[]> {
    const res = await api.get<QueryHistoryItem[]>(`/api/ocr/query/${documentId}/history`);
    return res.data;
  },
};
