import { useCallback, useEffect, useState } from 'react';
import { complianceApi } from '../api/complianceApi';
import type { ComplianceFile } from '../types';

interface UseComplianceResult {
  data: ComplianceFile | null;
  loading: boolean;
  revalidating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  revalidate: () => Promise<void>;
}

export function useCompliance(personId: string | null): UseComplianceResult {
  const [data, setData] = useState<ComplianceFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await complianceApi.getForPerson(personId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar la verificación');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  const revalidate = useCallback(async () => {
    if (!personId) return;
    setRevalidating(true);
    setError(null);
    try {
      const result = await complianceApi.revalidate(personId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al re-verificar');
    } finally {
      setRevalidating(false);
    }
  }, [personId]);

  useEffect(() => { refresh(); }, [refresh]);

  return { data, loading, revalidating, error, refresh, revalidate };
}
