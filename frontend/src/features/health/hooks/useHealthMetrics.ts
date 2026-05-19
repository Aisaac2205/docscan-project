'use client';

import { useMemo } from 'react';
import type { HealthRecord, HealthStatus } from '../types';

export interface HealthMetric {
  /** Valor del mes en curso. */
  value: number;
  /** Delta porcentual vs mes anterior. `null` cuando no se puede calcular. */
  delta: number | null;
  /** Serie diaria del mes en curso. Vacía cuando no hay datos suficientes. */
  sparkline: number[];
}

export interface AvgValidationMetric {
  /** Media de horas entre creación y validación del mes. `null` si no hay datos. */
  value: number | null;
  /** Delta vs mes anterior. */
  delta: number | null;
  /** Promedio diario (horas). 0 en días sin validaciones. Vacía si nada validado en el mes. */
  sparkline: number[];
}

export interface HealthMetrics {
  /** Constancias en estado `pending`. Snapshot actual, no del mes. */
  pending: HealthMetric;
  /** Constancias creadas en el mes en curso. */
  createdThisMonth: HealthMetric;
  /** Constancias que pasaron a validated/registered este mes. */
  validatedThisMonth: HealthMetric;
  /** Tiempo promedio (horas) entre createdAt y validatedAt en el mes. */
  avgValidationHours: AvgValidationMetric;
}

interface MonthBounds {
  start: Date;
  end: Date;
  prevStart: Date;
  prevEnd: Date;
}

function getMonthBounds(now = new Date()): MonthBounds {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevEnd = start;
  return { start, end, prevStart, prevEnd };
}

function pctDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

function dailySeries(dates: Date[], from: Date, to: Date): number[] {
  const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / 86_400_000));
  const buckets = new Array(days).fill(0) as number[];
  for (const d of dates) {
    if (d < from || d >= to) continue;
    const idx = Math.floor((d.getTime() - from.getTime()) / 86_400_000);
    if (idx >= 0 && idx < days) buckets[idx] += 1;
  }
  return buckets;
}

function isCountedAsValidated(status: HealthStatus): boolean {
  return status === 'validated' || status === 'registered';
}

/**
 * Fase 1: cálculo client-side. Reemplazable por endpoint backend en Fase 2.
 * Si dataset > ~200 podría ser lento; aceptable por ahora.
 */
export function useHealthMetrics(records: HealthRecord[]): HealthMetrics {
  return useMemo<HealthMetrics>(() => {
    const { start, end, prevStart, prevEnd } = getMonthBounds();

    const pendingCount = records.filter((r) => r.healthStatus === 'pending').length;

    const pendingByCreated = records
      .filter((r) => r.healthStatus === 'pending')
      .map((r) => new Date(r.createdAt));
    const pendingSparkline = dailySeries(pendingByCreated, start, end);
    const pendingPrev = records.filter((r) => {
      const d = new Date(r.createdAt);
      return r.healthStatus === 'pending' && d >= prevStart && d < prevEnd;
    }).length;

    const createdThisMonthDates: Date[] = [];
    const createdPrevMonthDates: Date[] = [];
    for (const r of records) {
      const d = new Date(r.createdAt);
      if (d >= start && d < end) createdThisMonthDates.push(d);
      else if (d >= prevStart && d < prevEnd) createdPrevMonthDates.push(d);
    }
    const createdValue = createdThisMonthDates.length;
    const createdSparkline = dailySeries(createdThisMonthDates, start, end);

    // Validatadas: contamos por createdAt cuando el record terminó en
    // validated/registered. Sin columna `validatedAt` no podemos saber CUÁNDO
    // se transicionó — Fase 2 lo arregla.
    const validatedThisMonth = records.filter((r) => {
      const d = new Date(r.createdAt);
      return isCountedAsValidated(r.healthStatus) && d >= start && d < end;
    }).length;
    const validatedPrevMonth = records.filter((r) => {
      const d = new Date(r.createdAt);
      return isCountedAsValidated(r.healthStatus) && d >= prevStart && d < prevEnd;
    }).length;

    // Tiempo promedio de validación: hours entre createdAt y validatedAt
    // para records validados en el mes actual. Usa `validatedAt` (proxy de
    // `_health.updatedAt` cuando el status final fue validated|registered).
    const avgValidationHours = computeAvgValidation(records, start, end, prevStart, prevEnd);

    return {
      pending: {
        value: pendingCount,
        delta: pctDelta(pendingCount, pendingPrev),
        sparkline: pendingSparkline,
      },
      createdThisMonth: {
        value: createdValue,
        delta: pctDelta(createdValue, createdPrevMonthDates.length),
        sparkline: createdSparkline,
      },
      validatedThisMonth: {
        value: validatedThisMonth,
        delta: pctDelta(validatedThisMonth, validatedPrevMonth),
        sparkline: [],
      },
      avgValidationHours,
    };
  }, [records]);
}

function computeAvgValidation(
  records: HealthRecord[],
  start: Date,
  end: Date,
  prevStart: Date,
  prevEnd: Date,
): AvgValidationMetric {
  const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / 86_400_000));

  // Buckets: suma de horas y conteo por día del mes en curso.
  const sumByDay = new Array(days).fill(0) as number[];
  const countByDay = new Array(days).fill(0) as number[];

  let monthSum = 0;
  let monthCount = 0;
  let prevSum = 0;
  let prevCount = 0;

  for (const r of records) {
    if (!r.validatedAt) continue;
    if (!isCountedAsValidated(r.healthStatus)) continue;

    const created = new Date(r.createdAt);
    const validated = new Date(r.validatedAt);
    const hours = (validated.getTime() - created.getTime()) / 3_600_000;
    if (!Number.isFinite(hours) || hours < 0) continue;

    if (validated >= start && validated < end) {
      monthSum += hours;
      monthCount += 1;
      const idx = Math.floor((validated.getTime() - start.getTime()) / 86_400_000);
      if (idx >= 0 && idx < days) {
        sumByDay[idx] += hours;
        countByDay[idx] += 1;
      }
    } else if (validated >= prevStart && validated < prevEnd) {
      prevSum += hours;
      prevCount += 1;
    }
  }

  if (monthCount === 0) {
    return { value: null, delta: null, sparkline: [] };
  }

  const value = Math.round((monthSum / monthCount) * 10) / 10;
  const prevAvg = prevCount > 0 ? prevSum / prevCount : 0;
  const delta = prevCount > 0 ? pctDelta(value, Math.round(prevAvg * 10) / 10) : null;

  const sparkline = sumByDay.map((sum, i) =>
    countByDay[i] > 0 ? Math.round((sum / countByDay[i]) * 10) / 10 : 0,
  );

  return { value, delta, sparkline };
}
