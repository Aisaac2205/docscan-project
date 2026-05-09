import { useMemo } from 'react';
import { useDocumentStore } from '@/features/documents/store';

export function useScannerMetrics() {
  const { documents } = useDocumentStore();

  const today = useMemo(() => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return documents.filter((d) => {
      try {
        return new Date(d.createdAt) >= startOfDay;
      } catch {
        return false;
      }
    });
  }, [documents]);

  const yesterday = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return documents.filter((d) => {
      try {
        const date = new Date(d.createdAt);
        return date >= start && date < end;
      } catch {
        return false;
      }
    });
  }, [documents]);

  const docsToday = today.length;
  const docsYesterday = yesterday.length;

  /* Tasa de éxito = completados hoy / total hoy */
  const successRate = useMemo(() => {
    if (docsToday === 0) return null;
    const completed = today.filter((d) => d.status === 'completed');
    return completed.length / docsToday;
  }, [today, docsToday]);

  /* En cola = pendientes + procesando */
  const processingCount = useMemo(() => {
    return today.filter(
      (d) => d.status === 'pending' || d.status === 'processing',
    ).length;
  }, [today]);

  /* Confianza promedio de los completados hoy */
  const avgConfidence = useMemo(() => {
    const completed = today.filter(
      (d) => d.confidence !== null && d.confidence !== undefined,
    );
    if (completed.length === 0) return null;
    const sum = completed.reduce((acc, d) => acc + (d.confidence ?? 0), 0);
    return sum / completed.length;
  }, [today]);

  /* Tendencia vs ayer */
  const trend = useMemo(() => {
    if (docsYesterday === 0) return docsToday > 0 ? 100 : 0;
    return Math.round(((docsToday - docsYesterday) / docsYesterday) * 100);
  }, [docsToday, docsYesterday]);

  return {
    docsToday,
    docsYesterday,
    trend,
    successRate,
    processingCount,
    avgConfidence,
  };
}
