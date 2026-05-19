// ---------------------------------------------------------------------------
// Helpers de agregación compartidos por DashboardService y DocumentsStatsService.
// Funciones puras, sin DI, sin Prisma — solo math/date.
// ---------------------------------------------------------------------------

export function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

export function endOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(23, 59, 59, 999);
  return out;
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

/**
 * Delta firmado (%) entre `current` y `previous`. Convención:
 * - iguales      → 0
 * - previous=0   → +100 si current>0, -100 si current<0, 0 si ambos 0
 * - resto        → ((current - previous) / previous) * 100, redondeado 1 decimal
 */
export function signedDeltaPercent(current: number, previous: number): number {
  if (current === previous) return 0;
  if (previous === 0) return current > 0 ? 100 : -100;
  const raw = ((current - previous) / previous) * 100;
  return Math.round(raw * 10) / 10;
}

export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Para una fecha dada y un origen `windowStart`, devuelve el índice de día
 * (0..length-1) dentro de una ventana diaria contigua. Devuelve -1 si la
 * fecha cae fuera de la ventana.
 */
export function dayOffsetInWindow(
  date: Date,
  windowStart: Date,
  windowLengthDays: number,
): number {
  const offset = Math.floor(
    (startOfDay(date).getTime() - startOfDay(windowStart).getTime()) / 86_400_000,
  );
  if (offset < 0 || offset >= windowLengthDays) return -1;
  return offset;
}
