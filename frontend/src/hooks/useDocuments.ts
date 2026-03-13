import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { Document } from '@/types/document.types';

export function useDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const docs = await apiClient.get<Document[]>('/documents');
      setDocuments(docs);
    } catch (err: any) {
      setError(err.message || 'Error al obtener documentos');
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File, onProgress?: (p: number) => void) => {
    setLoading(true);
    setError(null);
    try {
      const doc = await apiClient.upload<Document>('/documents/upload', file, onProgress);
      setDocuments((prev) => [doc, ...prev]);
      return doc;
    } catch (err: any) {
      setError(err.message || 'Error al subir documento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await apiClient.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    } catch (err: any) {
      setError(err.message || 'Error al eliminar documento');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    uploadDocument,
    deleteDocument,
  };
}
