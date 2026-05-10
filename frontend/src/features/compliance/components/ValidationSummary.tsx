'use client';

import type { ValidationResult, ValidationStatus } from '../types';

interface ValidationSummaryProps {
  validations: ValidationResult[];
  totalDocs?: number;
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-4 border-r border-border-subtle last:border-r-0">
      <span className="text-display-lg text-fg-primary">{value}</span>
      <span className="text-caption font-medium text-fg-tertiary mt-1 text-center">{label}</span>
    </div>
  );
}

export function ValidationSummary({ validations }: ValidationSummaryProps) {
  const counts = validations.reduce(
    (acc, v) => { acc[v.status] = (acc[v.status] ?? 0) + 1; return acc; },
    {} as Record<ValidationStatus, number>,
  );

  return (
    <section
      aria-labelledby="validation-summary-heading"
      className="bg-surface-card border border-border rounded-md p-4 md:p-5"
    >
      <h3
        id="validation-summary-heading"
        className="text-overline text-overline-uppercase text-fg-tertiary mb-4"
      >
        Resumen de la verificación
      </h3>
      <div className="grid grid-cols-3 divide-x divide-border-subtle">
        <Counter label="Aprobadas" value={counts.pass ?? 0} />
        <Counter label="Advertencias" value={counts.warning ?? 0} />
        <Counter label="Fallidas" value={counts.fail ?? 0} />
      </div>
    </section>
  );
}
