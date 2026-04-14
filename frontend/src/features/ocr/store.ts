import { create } from 'zustand';
import type { OCRResponse, ExtractionMode, AnalyzeResult, QueryResult, QueryHistoryItem, ProviderId } from './types/ocr.types';
import { ocrClient } from './client';

type OCRState = {
  lastResult: OCRResponse | null;
  analysisResult: AnalyzeResult | null;
  queryHistory: QueryHistoryItem[];
  processing: boolean;
  analyzing: boolean;
  querying: boolean;
  error: string | null;
  processDocument: (
    documentId: string,
    mode?: ExtractionMode,
    customFields?: string[],
    provider?: ProviderId,
    model?: string,
  ) => Promise<OCRResponse | null>;
  analyzeDocument: (documentId: string, provider?: ProviderId, model?: string) => Promise<AnalyzeResult | null>;
  queryDocument: (documentId: string, question: string, provider?: ProviderId, model?: string) => Promise<QueryResult | null>;
  loadQueryHistory: (documentId: string) => Promise<void>;
  resetAnalysis: () => void;
  reset: () => void;
};

export const useOCRStore = create<OCRState>((set) => ({
  lastResult: null,
  analysisResult: null,
  queryHistory: [],
  processing: false,
  analyzing: false,
  querying: false,
  error: null,

  processDocument: async (documentId, mode = 'general', customFields, provider, model) => {
    set({ processing: true, error: null });
    try {
      const res = await ocrClient.processDocument(documentId, mode, customFields, provider, model);
      set({ lastResult: res, processing: false });
      return res;
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Error OCR', processing: false });
      return null;
    }
  },

  analyzeDocument: async (documentId, provider, model) => {
    set({ analyzing: true, error: null, analysisResult: null });
    try {
      const res = await ocrClient.analyzeDocument(documentId, provider, model);
      set({ analysisResult: res, analyzing: false });
      return res;
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Error al analizar', analyzing: false });
      return null;
    }
  },

  queryDocument: async (documentId, question, provider, model) => {
    set({ querying: true, error: null });
    try {
      const res = await ocrClient.queryDocument(documentId, question, provider, model);
      set((s) => ({
        queryHistory: [...s.queryHistory, { id: Date.now().toString(), question: res.question, answer: res.answer, createdAt: new Date().toISOString() }],
        querying: false,
      }));
      return res;
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Error al consultar', querying: false });
      return null;
    }
  },

  loadQueryHistory: async (documentId) => {
    try {
      const history = await ocrClient.getQueryHistory(documentId);
      set({ queryHistory: history });
    } catch {
      // silently ignore
    }
  },

  resetAnalysis: () => set({ analysisResult: null }),
  reset: () => set({ lastResult: null, analysisResult: null, queryHistory: [], error: null }),
}));
