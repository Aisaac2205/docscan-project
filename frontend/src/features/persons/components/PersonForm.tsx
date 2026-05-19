'use client';

import { FormEvent, useState } from 'react';
import type { CreatePersonInput, Person, PersonRole, PersonStatus } from '../types';

interface PersonFormProps {
  initial?: Person | null;
  /** Prefill parcial — útil para creación desde flujos externos (ej: OCR de constancia). */
  initialDraft?: Partial<CreatePersonInput> | null;
  submitLabel?: string;
  onSubmit: (input: CreatePersonInput) => Promise<unknown>;
  onCancel?: () => void;
}

const ROLE_OPTIONS: { value: PersonRole; label: string }[] = [
  { value: 'candidate', label: 'Candidato' },
  { value: 'employee', label: 'Empleado' },
];

const STATUS_OPTIONS: { value: PersonStatus; label: string }[] = [
  { value: 'active', label: 'Activo' },
  { value: 'hired', label: 'Contratado' },
  { value: 'archived', label: 'Archivado' },
  { value: 'rejected', label: 'Descartado' },
];

export function PersonForm({
  initial,
  initialDraft,
  submitLabel = 'Guardar',
  onSubmit,
  onCancel,
}: PersonFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? initialDraft?.fullName ?? '');
  const [cui, setCui] = useState(initial?.cui ?? initialDraft?.cui ?? '');
  const [email, setEmail] = useState(initial?.email ?? initialDraft?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? initialDraft?.phone ?? '');
  const [role, setRole] = useState<PersonRole>(initial?.role ?? initialDraft?.role ?? 'candidate');
  const [status, setStatus] = useState<PersonStatus>(initial?.status ?? initialDraft?.status ?? 'active');
  const [notes, setNotes] = useState(initial?.notes ?? initialDraft?.notes ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit({
        fullName: fullName.trim(),
        cui: cui.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role,
        status,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      const msg =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios shape
            (err.response?.data?.message as string) ?? 'No se pudo guardar.'
          : 'No se pudo guardar.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full h-10 px-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]';

  const labelClass = 'block text-overline text-overline-uppercase text-fg-tertiary mb-1';

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div role="alert" className="px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="person-name" className={labelClass}>
          Nombre completo
        </label>
        <input
          id="person-name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          maxLength={200}
          className={inputClass}
          placeholder="Ej: Juan Pérez García"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="person-cui" className={labelClass}>
            CUI (opcional)
          </label>
          <input
            id="person-cui"
            value={cui}
            onChange={(e) => setCui(e.target.value)}
            maxLength={20}
            className={inputClass}
            placeholder="1234567890101"
          />
        </div>
        <div>
          <label htmlFor="person-phone" className={labelClass}>
            Teléfono (opcional)
          </label>
          <input
            id="person-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            className={inputClass}
            placeholder="+502 0000-0000"
          />
        </div>
      </div>

      <div>
        <label htmlFor="person-email" className={labelClass}>
          Correo (opcional)
        </label>
        <input
          id="person-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={200}
          className={inputClass}
          placeholder="ejemplo@correo.com"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="person-role" className={labelClass}>
            Tipo
          </label>
          <select
            id="person-role"
            value={role}
            onChange={(e) => setRole(e.target.value as PersonRole)}
            className={inputClass}
          >
            {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="person-status" className={labelClass}>
            Estado
          </label>
          <select
            id="person-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as PersonStatus)}
            className={inputClass}
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="person-notes" className={labelClass}>
          Notas internas (opcional)
        </label>
        <textarea
          id="person-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
          placeholder="Observaciones para uso interno de RRHH."
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-md text-button bg-fg-primary text-fg-inverse hover:opacity-90 disabled:opacity-50 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md text-button bg-surface-card text-fg-secondary border border-border hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
