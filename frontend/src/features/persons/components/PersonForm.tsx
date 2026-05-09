'use client';

import { FormEvent, useState } from 'react';
import type { CreatePersonInput, Person, PersonRole, PersonStatus } from '../types';

interface PersonFormProps {
  initial?: Person | null;
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

export function PersonForm({ initial, submitLabel = 'Guardar', onSubmit, onCancel }: PersonFormProps) {
  const [fullName, setFullName] = useState(initial?.fullName ?? '');
  const [cui, setCui] = useState(initial?.cui ?? '');
  const [email, setEmail] = useState(initial?.email ?? '');
  const [phone, setPhone] = useState(initial?.phone ?? '');
  const [role, setRole] = useState<PersonRole>(initial?.role ?? 'candidate');
  const [status, setStatus] = useState<PersonStatus>(initial?.status ?? 'active');
  const [notes, setNotes] = useState(initial?.notes ?? '');
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
    'w-full h-10 px-3 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700';

  return (
    <form onSubmit={submit} className="space-y-4">
      {error && (
        <div role="alert" className="px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm text-stone-800">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="person-name" className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
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
          <label htmlFor="person-cui" className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
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
          <label htmlFor="person-phone" className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
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
        <label htmlFor="person-email" className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
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
          <label htmlFor="person-role" className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
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
          <label htmlFor="person-status" className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
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
        <label htmlFor="person-notes" className="block text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
          Notas internas (opcional)
        </label>
        <textarea
          id="person-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-white text-sm text-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
          placeholder="Observaciones para uso interno de RRHH."
        />
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-900 text-white hover:bg-stone-700 disabled:opacity-50 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
        >
          {submitting ? 'Guardando...' : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-stone-700 border border-stone-200 hover:border-stone-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
