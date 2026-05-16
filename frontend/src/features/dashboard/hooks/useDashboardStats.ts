'use client';

import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/shared/auth/useCurrentUser';
import { useAuthStore } from '@/shared/auth/authStore';
import { dashboardApi, type DashboardStats } from '../api/dashboardApi';

interface UseDashboardStatsResult {
  readonly firstName: string | null;
  readonly userLoading: boolean;
  readonly stats: DashboardStats | null;
  readonly statsLoading: boolean;
  readonly statsError: string | null;
  readonly refreshStats: () => Promise<unknown>;
}

export const dashboardStatsQueryKey = ['dashboard', 'stats'] as const;

/**
 * Dashboard stats backed by react-query.
 * - Cached 30s across navigations (defaults from queryClient).
 * - Dedupes parallel requests across components.
 * - `firstName` is null while the user query is in-flight so the UI can
 *   render a skeleton instead of flashing the "Usuario" fallback.
 */
export function useDashboardStats(): UseDashboardStatsResult {
  const token = useAuthStore((s) => s.token);
  const userQuery = useCurrentUser();

  const statsQuery = useQuery({
    queryKey: dashboardStatsQueryKey,
    queryFn: () => dashboardApi.getStats(),
    enabled: Boolean(token),
  });

  const firstName = userQuery.data?.name
    ? userQuery.data.name.split(' ')[0]
    : null;

  return {
    firstName,
    userLoading: Boolean(token) && userQuery.isLoading,
    stats: statsQuery.data ?? null,
    statsLoading: statsQuery.isLoading,
    statsError: statsQuery.error
      ? statsQuery.error instanceof Error
        ? statsQuery.error.message
        : 'Error al cargar las métricas'
      : null,
    refreshStats: () => statsQuery.refetch(),
  } as const;
}
