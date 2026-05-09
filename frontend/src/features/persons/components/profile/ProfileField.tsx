interface ProfileFieldProps {
  label: string;
  value: unknown;
  emptyText?: string;
}

export function ProfileField({ label, value, emptyText = '—' }: ProfileFieldProps) {
  const display = formatValue(value, emptyText);
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider font-semibold text-stone-400 mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-stone-800">{display}</dd>
    </div>
  );
}

function formatValue(value: unknown, emptyText: string): string {
  if (value === null || value === undefined) return emptyText;
  if (typeof value === 'string') return value.trim().length > 0 ? value : emptyText;
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
