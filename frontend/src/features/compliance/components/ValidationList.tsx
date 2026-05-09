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
  pass: 'text-stone-500',
  warning: 'text-stone-600 font-semibold',
  fail: 'text-stone-900 font-semibold',
};

export function ValidationList({ validations }: ValidationListProps) {
  return (
    <section aria-labelledby="validation-list-heading">
      <h2
        id="validation-list-heading"
        className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-3"
      >
        Validaciones cruzadas
      </h2>
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {validations.map((v) => (
          <div key={v.id} className="flex items-start gap-4 px-4 py-3.5">
            <span
              className={`text-xs w-20 flex-shrink-0 pt-0.5 ${statusTagClass[v.status]}`}
              aria-label={`Estado: ${statusTag[v.status]}`}
            >
              {statusTag[v.status]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-stone-800">{v.label}</p>
              <p className="text-xs md:text-sm text-stone-500 mt-0.5">{v.message}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
