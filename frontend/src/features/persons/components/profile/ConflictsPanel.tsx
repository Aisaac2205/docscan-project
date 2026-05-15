import { Heading } from '@/shared/components/Layout';
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
      className="bg-warning-bg border border-warning-border border-dashed rounded-md p-4"
    >
      <Heading level={4} as="h3" className="text-warning-fg mb-2">
        Inconsistencias detectadas entre documentos
      </Heading>
      <p className="text-caption text-fg-secondary mb-3">
        Diferentes documentos reportan valores distintos para el mismo dato. Revisá cuál es el correcto.
      </p>
      <ul className="space-y-3">
        {conflicts.map((c) => (
          <li key={c.field}>
            <p className="text-overline text-overline-uppercase text-fg-secondary mb-1">
              {FIELD_LABEL[c.field] ?? c.field}
            </p>
            <ul className="space-y-0.5">
              {c.values.map((v, i) => (
                <li key={i} className="text-body-sm text-fg-secondary">
                  <span className="text-fg-tertiary mr-2">{v.source}:</span>
                  <span className="font-mono text-fg-primary">{String(v.value)}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}
