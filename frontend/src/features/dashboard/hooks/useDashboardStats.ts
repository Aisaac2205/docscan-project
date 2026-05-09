import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDocumentStore } from '../../documents/store';
import type { Document } from '@/features/documents/types/document.types';
import { dashboardApi, type DashboardStats } from '../api/dashboardApi';

interface UseDashboardStatsResult {
  firstName: string;
  loading: boolean;
  recentDocuments: Document[];
  stats: DashboardStats | null;
  statsLoading: boolean;
  statsError: string | null;
  refreshStats: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const { user } = useAuth();
  const { documents, fetchDocuments, loading } = useDocumentStore();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const loadStats = async () => {
    setStatsLoading(true);
    setStatsError(null);
    try {
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      setStatsError(err instanceof Error ? err.message : 'Error al cargar métricas');
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  const recentDocuments = useMemo(() => {
    return [...documents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6);
  }, [documents]);

  return {
    firstName,
    loading,
    recentDocuments,
    stats,
    statsLoading,
    statsError,
    refreshStats: loadStats,
  };
}
