'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { dashboardApi, type DashboardStats } from '../api/dashboardApi';

// ---------------------------------------------------------------------------
// Hook return type
// ---------------------------------------------------------------------------

interface UseDashboardStatsResult {
  readonly firstName: string;
  readonly stats: DashboardStats | null;
  readonly statsLoading: boolean;
  readonly statsError: string | null;
  readonly refreshStats: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useDashboardStats — fetches OCR dashboard stats from the backend.
 *
 * Uses the shared `api` client (Axios + JWT). All data comes from
 * GET /api/dashboard/stats. Fields marked with TODO in `dashboardApi.ts`
 * will be `undefined` until the backend implements them.
 */
export function useDashboardStats(): UseDashboardStatsResult {
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setStatsError(
        err instanceof Error ? err.message : 'Error al cargar las métricas'
      );
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  return {
    firstName,
    stats,
    statsLoading,
    statsError,
    refreshStats: loadStats,
  } as const;
}
