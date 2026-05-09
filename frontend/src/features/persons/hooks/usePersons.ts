import { useCallback, useEffect, useState } from 'react';
import { personsApi } from '../api/personsApi';
import type { Person, CreatePersonInput, UpdatePersonInput } from '../types';

interface UsePersonsResult {
  persons: Person[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (input: CreatePersonInput) => Promise<Person>;
  update: (id: string, input: UpdatePersonInput) => Promise<Person>;
  remove: (id: string) => Promise<void>;
  setQuery: (q: string) => void;
  query: string;
}

export function usePersons(initialOpts?: { status?: string }): UsePersonsResult {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await personsApi.list({
        status: initialOpts?.status,
        q: query.trim() || undefined,
      });
      setPersons(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar personas');
    } finally {
      setLoading(false);
    }
  }, [initialOpts?.status, query]);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const create = useCallback(async (input: CreatePersonInput) => {
    const created = await personsApi.create(input);
    setPersons((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: string, input: UpdatePersonInput) => {
    const updated = await personsApi.update(id, input);
    setPersons((prev) => prev.map((p) => (p.id === id ? updated : p)));
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await personsApi.remove(id);
    setPersons((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { persons, loading, error, refresh, create, update, remove, setQuery, query };
}
