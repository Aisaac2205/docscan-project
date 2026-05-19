'use client';

import { useCallback, useEffect, useState } from 'react';
import { documentsClient } from '../client';
import type {
  DocumentsStats,
  DocumentsStatsFilters,
} from '../types/document.types';

interface UseDocumentsStatsResult {
  stats: DocumentsStats | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Trae los KPIs del módulo Documentos respetando dateFrom/dateTo. El
 * hook NO se sincroniza con la URL — el caller pasa los filtros que ya
 * tiene resueltos en su propio state/URL.
 */
export function useDocumentsStats(
  filters: DocumentsStatsFilters,
): UseDocumentsStatsResult {
  const { dateFrom, dateTo } = filters;
  const [stats, setStats] = useState<DocumentsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentsClient.stats({ dateFrom, dateTo });
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, loading, error, refresh };
}
