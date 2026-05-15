import { useCallback, useEffect, useState } from 'react';
import { personsApi } from '../api/personsApi';
import type {
  PersonWithCompleteness,
  CreatePersonInput,
  UpdatePersonInput,
  Person,
} from '../types';

interface UsePersonsOpts {
  status?: string;
  page?: number;
  pageSize?: number;
  includeCompleteness?: boolean;
}

interface UsePersonsResult {
  persons: PersonWithCompleteness[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  create: (input: CreatePersonInput) => Promise<Person>;
  update: (id: string, input: UpdatePersonInput) => Promise<Person>;
  remove: (id: string) => Promise<void>;
  setQuery: (q: string) => void;
  setPage: (p: number) => void;
  query: string;
}

export function usePersons(opts?: UsePersonsOpts): UsePersonsResult {
  const initialPage = opts?.page ?? 1;
  const pageSize = opts?.pageSize ?? 25;

  const [persons, setPersons] = useState<PersonWithCompleteness[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await personsApi.list({
        status: opts?.status,
        q: query.trim() || undefined,
        page,
        pageSize,
        include: opts?.includeCompleteness ? 'completeness' : undefined,
      });
      setPersons(data.items);
      setTotal(data.total);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar personas');
    } finally {
      setLoading(false);
    }
  }, [opts?.status, opts?.includeCompleteness, query, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  // Reset to page 1 whenever search query or status filter changes.
  useEffect(() => {
    setPage(1);
  }, [query, opts?.status]);

  const create = useCallback(async (input: CreatePersonInput) => {
    const created = await personsApi.create(input);
    await refresh();
    return created;
  }, [refresh]);

  const update = useCallback(async (id: string, input: UpdatePersonInput) => {
    const updated = await personsApi.update(id, input);
    setPersons((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updated } : p)),
    );
    return updated;
  }, []);

  const remove = useCallback(async (id: string) => {
    await personsApi.remove(id);
    await refresh();
  }, [refresh]);

  return {
    persons,
    total,
    page,
    pageSize,
    hasMore,
    loading,
    error,
    refresh,
    create,
    update,
    remove,
    setQuery,
    setPage,
    query,
  };
}
