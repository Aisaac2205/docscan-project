'use client';

import type { ValidationResult, ValidationStatus } from '../types';

interface ValidationSummaryProps {
  validations: ValidationResult[];
  totalDocs?: number;
}

function Counter({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center justify-center p-3 md:p-4 border-r border-stone-100 last:border-r-0">
      <span className="text-2xl md:text-3xl font-semibold text-stone-900">{value}</span>
      <span className="text-xs font-medium text-stone-400 mt-1 text-center">{label}</span>
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
      className="bg-white border border-stone-200 rounded-xl p-4 md:p-5"
    >
      <h3
        id="validation-summary-heading"
        className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-4"
      >
        Resumen de la verificación
      </h3>
      <div className="grid grid-cols-3 divide-x divide-stone-100">
        <Counter label="Aprobadas" value={counts.pass ?? 0} />
        <Counter label="Advertencias" value={counts.warning ?? 0} />
        <Counter label="Fallidas" value={counts.fail ?? 0} />
      </div>
    </section>
  );
}
