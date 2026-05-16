interface ProfileFieldProps {
  label: string;
  value: unknown;
  emptyText?: string;
}

export function ProfileField({ label, value, emptyText = '—' }: ProfileFieldProps) {
  const display = formatValue(value, emptyText);
  return (
    <div>
      <dt className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">
        {label}
      </dt>
      <dd className="text-body-sm text-fg-primary">{display}</dd>
    </div>
  );
}

function formatValue(value: unknown, emptyText: string): string {
  if (value === null || value === undefined) return emptyText;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.length === 0) return emptyText;
    const lower = trimmed.toLowerCase();
    if (lower === 'true') return 'Sí';
    if (lower === 'false') return 'No';
    return trimmed;
  }
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
