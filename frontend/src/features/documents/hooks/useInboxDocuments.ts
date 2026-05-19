import { useCallback, useEffect, useState } from 'react';
import { documentsClient } from '../client';
import type { Document } from '../types/document.types';

interface UseInboxDocumentsResult {
  documents: Document[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useInboxDocuments(): UseInboxDocumentsResult {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // limit=100: la bandeja se muestra completa, sin paginación visible.
      // Si crece más allá, hay que paginarla — por ahora cubre el caso real.
      const response = await documentsClient.list({ unassigned: true, limit: 100 });
      setDocuments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la bandeja');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { documents, loading, error, refresh };
}
