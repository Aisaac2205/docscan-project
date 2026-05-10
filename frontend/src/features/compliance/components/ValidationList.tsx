'use client';

import type { ValidationResult, ValidationStatus } from '../types';

interface ValidationListProps {
  validations: ValidationResult[];
}

const statusTag: Record<ValidationStatus, string> = {
  pass: 'Aprobado',
  warning: 'Advertencia',
  fail: 'Fallido',
};

const statusTagClass: Record<ValidationStatus, string> = {
  pass: 'text-success-fg',
  warning: 'text-warning-fg font-medium',
  fail: 'text-danger-fg font-medium',
};

export function ValidationList({ validations }: ValidationListProps) {
  return (
    <section aria-labelledby="validation-list-heading">
      <h2
        id="validation-list-heading"
        className="text-overline text-overline-uppercase text-fg-tertiary mb-3"
      >
        Validaciones cruzadas
      </h2>
      <div className="bg-surface-card border border-border rounded-md divide-y divide-border-subtle">
        {validations.map((v) => (
          <div key={v.id} className="flex items-start gap-4 px-4 py-3.5">
            <span
              className={`text-caption w-20 flex-shrink-0 pt-0.5 ${statusTagClass[v.status]}`}
              aria-label={`Estado: ${statusTag[v.status]}`}
            >
              {statusTag[v.status]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-sm font-medium text-fg-primary">{v.label}</p>
              <p className="text-caption text-fg-secondary mt-0.5">{v.message}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
