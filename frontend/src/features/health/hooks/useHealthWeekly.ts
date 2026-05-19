'use client';

import { useMemo } from 'react';
import type { HealthRecord } from '../types';

export interface HealthWeeklyPoint {
  day: string;
  recibidas: number;
  validadas: number;
}

const WEEKDAY_LABELS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Construye 7 buckets diarios (ayer-6 .. hoy) con:
 *  - recibidas: createdAt cae en el día
 *  - validadas: validatedAt cae en el día (status final validated|registered)
 */
export function useHealthWeekly(records: HealthRecord[]): HealthWeeklyPoint[] {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const buckets: HealthWeeklyPoint[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const day = new Date(today);
      day.setDate(today.getDate() - offset);
      buckets.push({
        day: WEEKDAY_LABELS_ES[day.getDay()] ?? '',
        recibidas: 0,
        validadas: 0,
      });
    }

    const startMs = new Date(today).setDate(today.getDate() - 6);

    for (const r of records) {
      const created = new Date(r.createdAt).getTime();
      if (created >= startMs) {
        const idx = Math.floor((created - startMs) / 86_400_000);
        if (idx >= 0 && idx < 7) buckets[idx].recibidas += 1;
      }

      if (r.validatedAt && (r.healthStatus === 'validated' || r.healthStatus === 'registered')) {
        const v = new Date(r.validatedAt).getTime();
        if (v >= startMs) {
          const idx = Math.floor((v - startMs) / 86_400_000);
          if (idx >= 0 && idx < 7) buckets[idx].validadas += 1;
        }
      }
    }

    return buckets;
  }, [records]);
}
