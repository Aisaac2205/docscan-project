import { useCallback, useEffect, useState } from 'react';
import { personsApi } from '../api/personsApi';
import type { PersonMetrics } from '../types';

interface UsePersonMetricsResult {
  metrics: PersonMetrics | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function usePersonMetrics(): UsePersonMetricsResult {
  const [metrics, setMetrics] = useState<PersonMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await personsApi.getMetrics();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { metrics, loading, error, refresh };
}
