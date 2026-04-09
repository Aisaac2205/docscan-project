import { create } from 'zustand';
import { documentsClient } from './client';
import type { Document } from './types/document.types';

type DocumentsState = {
  documents: Document[];
  loading: boolean;
  error: string | null;
  setDocuments: (d: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, patch: Partial<Document>) => void;
  fetchDocuments: () => Promise<void>;
  uploadDocument: (file: File, onProgress?: (p: number) => void) => Promise<Document | null>;
  deleteDocument: (id: string) => Promise<void>;
};

export const useDocumentStore = create<DocumentsState>((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  setDocuments: (d) => set({ documents: d }),
  addDocument: (doc) => set((s) => ({ documents: [doc, ...s.documents] })),
  updateDocument: (id, patch) =>
    set((s) => ({
      documents: s.documents.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    })),
  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const docs = await documentsClient.list();
      console.log('[documents] fetched:', docs.map(d => ({ id: d.id, status: d.status, extractedData: d.extractedData })));
      set({ documents: docs });
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Error fetching documents' });
    } finally {
      set({ loading: false });
    }
  },
  uploadDocument: async (file: File) => {
    set({ loading: true, error: null });
    try {
      const doc = await documentsClient.upload(file);
      set((s) => ({ documents: [doc, ...s.documents] }));
      return doc;
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Error uploading' });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  deleteDocument: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await documentsClient.delete(id);
      set((s) => ({ documents: s.documents.filter((d) => d.id !== id) }));
    } catch (err: unknown) {
      set({ error: err instanceof Error ? err.message : 'Error deleting' });
    } finally {
      set({ loading: false });
    }
  },
}));
