import { useCallback, useEffect, useState } from 'react';
import { evaluationsApi } from '../api/evaluationsApi';
import type { Evaluation, CreateEvaluationInput } from '../types';

interface UseEvaluationsResult {
  evaluations: Evaluation[];
  loading: boolean;
  generating: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  generate: (input: CreateEvaluationInput) => Promise<Evaluation | null>;
  remove: (id: string) => Promise<void>;
}

export function useEvaluations(personId: string | null): UseEvaluationsResult {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!personId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await evaluationsApi.list(personId);
      setEvaluations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar evaluaciones');
    } finally {
      setLoading(false);
    }
  }, [personId]);

  useEffect(() => { refresh(); }, [refresh]);

  const generate = useCallback(
    async (input: CreateEvaluationInput): Promise<Evaluation | null> => {
      if (!personId) return null;
      setGenerating(true);
      setError(null);
      try {
        const created = await evaluationsApi.create(personId, input);
        setEvaluations((prev) => [created, ...prev]);
        return created;
      } catch (err) {
        const msg = err && typeof err === 'object' && 'response' in err
          // @ts-expect-error axios shape
          ? (err.response?.data?.message as string) ?? 'No se pudo generar la evaluación.'
          : 'No se pudo generar la evaluación.';
        setError(msg);
        return null;
      } finally {
        setGenerating(false);
      }
    },
    [personId],
  );

  const remove = useCallback(
    async (id: string) => {
      if (!personId) return;
      await evaluationsApi.remove(personId, id);
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
    },
    [personId],
  );

  return { evaluations, loading, generating, error, refresh, generate, remove };
}
