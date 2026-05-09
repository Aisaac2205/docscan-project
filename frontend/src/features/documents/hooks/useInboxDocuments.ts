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
      const docs = await documentsClient.list({ unassigned: true });
      setDocuments(docs);
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
