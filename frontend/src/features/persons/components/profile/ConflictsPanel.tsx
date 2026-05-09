import type { FieldConflict } from '../../types';

interface ConflictsPanelProps {
  conflicts: FieldConflict[];
}

const FIELD_LABEL: Record<string, string> = {
  cui: 'CUI',
};

export function ConflictsPanel({ conflicts }: ConflictsPanelProps) {
  if (conflicts.length === 0) return null;

  return (
    <section
      aria-label="Inconsistencias detectadas"
      className="bg-stone-50 border border-stone-300 border-dashed rounded-xl p-4"
    >
      <h3 className="text-sm font-semibold text-stone-800 mb-2">
        Inconsistencias detectadas entre documentos
      </h3>
      <p className="text-xs text-stone-500 mb-3">
        Diferentes documentos reportan valores distintos para el mismo dato. Revisá cuál es el correcto.
      </p>
      <ul className="space-y-3">
        {conflicts.map((c) => (
          <li key={c.field}>
            <p className="text-xs font-semibold text-stone-700 uppercase tracking-wider mb-1">
              {FIELD_LABEL[c.field] ?? c.field}
            </p>
            <ul className="space-y-0.5">
              {c.values.map((v, i) => (
                <li key={i} className="text-sm text-stone-600">
                  <span className="text-stone-400 mr-2">{v.source}:</span>
                  <span className="font-mono">{String(v.value)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
