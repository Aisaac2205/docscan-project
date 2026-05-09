import { useCallback, useEffect, useState } from 'react';
import { personsApi } from '../api/personsApi';
import type { PersonProfileResponse, UpdatePersonInput, Person } from '../types';

interface UsePersonResult {
  data: PersonProfileResponse | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (input: UpdatePersonInput) => Promise<Person | null>;
  updateOverrides: (overrides: Record<string, unknown>) => Promise<Person | null>;
}

export function usePerson(id: string | null): UsePersonResult {
  const [data, setData] = useState<PersonProfileResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const result = await personsApi.getProfile(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (input: UpdatePersonInput) => {
      if (!id) return null;
      const updated = await personsApi.update(id, input);
      setData((prev) => (prev ? { ...prev, person: updated } : prev));
      return updated;
    },
    [id],
  );

  const updateOverrides = useCallback(
    async (overrides: Record<string, unknown>) => {
      if (!id) return null;
      const updated = await personsApi.updateOverrides(id, overrides);
      await refresh();
      return updated;
    },
    [id, refresh],
  );

  return { data, loading, error, refresh, update, updateOverrides };
}
