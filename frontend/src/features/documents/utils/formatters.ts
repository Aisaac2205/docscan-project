/**
 * Formatters puros. Usamos Intl nativo para evitar agregar date-fns sólo
 * por esto.
 */

const dateShortFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const dateLongFormatter = new Intl.DateTimeFormat('es-GT', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const isoDateOnly = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

export function formatShortDate(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return dateShortFormatter.format(date);
}

export function formatLongDate(input: string | Date | null | undefined): string {
  if (!input) return '—';
  const date = typeof input === 'string' ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return '—';
  return dateLongFormatter.format(date);
}

/** YYYY-MM-DD en zona local. Útil para mandar dateFrom/dateTo a la API. */
export function toIsoDate(input: Date): string {
  return isoDateOnly.format(input);
}

/**
 * Iniciales (máximo 2 caracteres) a partir de un nombre completo. Si el
 * nombre está vacío, retorna "?".
 */
export function getInitials(fullName: string | null | undefined): string {
  if (!fullName) return '?';
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return '?';
  if (tokens.length === 1) return tokens[0].slice(0, 2).toUpperCase();
  return `${tokens[0][0]}${tokens[tokens.length - 1][0]}`.toUpperCase();
}
