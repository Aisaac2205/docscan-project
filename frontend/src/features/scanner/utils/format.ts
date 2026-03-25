export function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(', ');
  }
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}
