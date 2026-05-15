'use client';

import { useState } from 'react';
import { CircleAlert } from 'lucide-react';
import { personsApi } from '../api/personsApi';
import type { Person } from '../types';

interface HiredRoleSuggestionBannerProps {
  person: Person;
  onChanged?: () => void | Promise<void>;
}

/**
 * Shows when a candidate has reached status='hired' but role is still
 * 'candidate'. Suggests flipping the role so the required-docs checklist
 * switches from 2 to 5 slots. NON-blocking — the user decides.
 */
export function HiredRoleSuggestionBanner({ person, onChanged }: HiredRoleSuggestionBannerProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (person.role !== 'candidate' || person.status !== 'hired') return null;

  const applyEmployeeRole = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await personsApi.update(person.id, { role: 'employee' });
      await onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el rol.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      role="status"
      aria-label="Sugerencia de cambio de rol"
      className="bg-info-bg border border-info-border rounded-md p-4 flex items-start gap-3"
    >
      <CircleAlert
        width={18}
        height={18}
        className="text-info-fg flex-shrink-0 mt-0.5"
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-body-sm text-info-fg font-medium">
          Esta persona ya está contratada
        </p>
        <p className="text-caption text-fg-secondary mt-0.5">
          ¿Aplicar el set completo de documentos requeridos para empleados (CV, DPI, Antecedentes Penales, Antecedentes Policíacos, RTU)?
        </p>
        {error && (
          <p role="alert" className="text-caption text-danger-fg mt-1">
            {error}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={applyEmployeeRole}
        disabled={submitting}
        className="flex-shrink-0 px-3 py-1.5 rounded-md text-button-sm bg-fg-primary text-fg-inverse hover:opacity-90 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
      >
        {submitting ? 'Aplicando...' : 'Cambiar a empleado'}
      </button>
    </section>
  );
}
