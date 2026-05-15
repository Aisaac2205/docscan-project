import { useCallback, useEffect, useState } from 'react';
import { personsApi } from '../api/personsApi';
import type { CompletenessDetail } from '../types';

interface UsePersonCompletenessResult {
  data: CompletenessDetail | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePersonCompleteness(personId: string | null): UsePersonCompletenessResult {
  const [data, setData] = useState<CompletenessDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!personId) {
      setData(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await personsApi.getCompleteness(personId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar completitud');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { data, loading, error, refresh };
}
