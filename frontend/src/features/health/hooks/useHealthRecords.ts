'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/auth/authStore';
import { healthApi } from '../api/healthApi';
import type { HealthRecord } from '../types';

export const healthRecordsQueryKey = ['health', 'records'] as const;

interface UseHealthRecordsResult {
  readonly records: HealthRecord[];
  readonly loading: boolean;
  readonly error: string | null;
  readonly refetch: () => Promise<unknown>;
}

export function useHealthRecords(): UseHealthRecordsResult {
  const token = useAuthStore((s) => s.token);

  const query = useQuery({
    queryKey: healthRecordsQueryKey,
    queryFn: () => healthApi.getAll(),
    enabled: Boolean(token),
  });

  return {
    records: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : 'Error al cargar registros'
      : null,
    refetch: () => query.refetch(),
  };
}
