'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Heading } from '@/shared/components/Layout';
import type { HealthRecord, UpdateRecordPayload } from '../types';
import { useUpdateHealthRecord } from '../hooks/useUpdateHealthRecord';
import { HealthActions } from './HealthActions';
import { HealthEmployeeSection } from './HealthEmployeeSection';

interface HealthRecordCardProps {
  record: HealthRecord;
}

function AuthChip({ ok, label }: { ok: boolean | null; label: string }) {
  if (ok === null) return null;
  const cls = ok
    ? 'text-success-fg bg-success-bg border-success-border'
    : 'text-danger-fg bg-danger-bg border-danger-border';
  const dot = ok ? 'bg-success-fg' : 'bg-danger-fg';
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-caption font-medium px-2 py-0.5 rounded-full border ${cls}`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {ok ? label : `Sin ${label.toLowerCase()}`}
    </span>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">{label}</p>
      <p className="text-body-sm text-fg-primary">{value ?? '—'}</p>
    </div>
  );
}

const INPUT_CLASS =
  'w-full h-9 px-3 rounded-md border border-border bg-surface-card text-body-sm ' +
  'text-fg-primary placeholder:text-fg-tertiary ' +
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const TEXTAREA_CLASS =
  'w-full min-h-[72px] px-3 py-2 rounded-md border border-border bg-surface-card text-body-sm ' +
  'text-fg-primary placeholder:text-fg-tertiary resize-y ' +
  'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const LABEL_CLASS = 'block text-overline text-overline-uppercase text-fg-tertiary mb-1';

function EditableField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
  type?: 'text' | 'date' | 'number';
}) {
  return (
    <label className="block">
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={INPUT_CLASS}
      />
    </label>
  );
}

interface FormState {
  nombre_paciente: string;
  nombre_medico: string;
  numero_colegiado: string;
  diagnostico: string;
  fecha_emision: string;
  fecha_inicio_reposo: string;
  fecha_fin_reposo: string;
  dias_reposo: string;
  institucion_emisora: string;
  notes: string;
}

function recordToForm(r: HealthRecord): FormState {
  return {
    nombre_paciente: r.nombre_paciente ?? '',
    nombre_medico: r.nombre_medico ?? '',
    numero_colegiado: r.numero_colegiado ?? '',
    diagnostico: r.diagnostico ?? '',
    fecha_emision: r.fecha_emision ?? '',
    fecha_inicio_reposo: r.fecha_inicio_reposo ?? '',
    fecha_fin_reposo: r.fecha_fin_reposo ?? '',
    dias_reposo: r.dias_reposo != null ? String(r.dias_reposo) : '',
    institucion_emisora: r.institucion_emisora ?? '',
    notes: r.notes ?? '',
  };
}

function diff(initial: FormState, current: FormState): UpdateRecordPayload {
  const out: UpdateRecordPayload = {};
  const keys = Object.keys(current) as Array<keyof FormState>;
  for (const key of keys) {
    if (initial[key] === current[key]) continue;
    if (key === 'dias_reposo') {
      const raw = current[key].trim();
      out.dias_reposo = raw === '' ? null : Number(raw);
    } else {
      out[key] = current[key] === '' ? null : current[key];
    }
  }
  return out;
}

/**
 * Body del HealthDetailSheet: campos editables + chips sello/firma + acciones.
 * No es una card de lista — vive dentro del Sheet.
 */
export function HealthRecordCard({ record }: HealthRecordCardProps) {
  const [initial, setInitial] = useState<FormState>(() => recordToForm(record));
  const [form, setForm] = useState<FormState>(() => recordToForm(record));
  const updateRecord = useUpdateHealthRecord();

  // Re-sync cuando el record cambia (refetch, mutación de status, etc.).
  useEffect(() => {
    const next = recordToForm(record);
    setInitial(next);
    setForm(next);
  }, [record]);

  const patch = diff(initial, form);
  const dirty = Object.keys(patch).length > 0;
  const saving = updateRecord.isPending;

  const handleSave = async () => {
    if (!dirty) return;
    await updateRecord.mutateAsync({ id: record.id, payload: patch });
  };

  const handleReset = () => setForm(initial);

  const set = <K extends keyof FormState>(key: K) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="space-y-5">
      {/* Header info */}
      <header className="space-y-1">
        <p className="text-overline text-overline-uppercase text-fg-tertiary">
          Constancia médica
        </p>
        <Heading level={4} as="h3" className="text-fg-primary leading-tight">
          {record.personName ?? record.nombre_paciente ?? record.originalName}
        </Heading>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <Link
            href={`/documents/${record.id}`}
            className="inline-flex items-center gap-1 text-caption text-fg-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
          >
            Ver archivo original
            <ExternalLink width={11} height={11} aria-hidden="true" />
          </Link>
        </div>
      </header>

      {/* Empleado vinculado — sección crítica del workflow */}
      <HealthEmployeeSection record={record} />

      {/* Auth chips (sello/firma) — solo lectura, vienen del OCR */}
      {(record.tiene_sello !== null || record.tiene_firma !== null) && (
        <div className="flex flex-wrap gap-2">
          <AuthChip ok={record.tiene_sello} label="Sello" />
          <AuthChip ok={record.tiene_firma} label="Firma" />
        </div>
      )}

      {/* Campos editables */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <EditableField
            label="Paciente"
            value={form.nombre_paciente}
            onChange={set('nombre_paciente')}
            disabled={saving}
          />
          <EditableField
            label="Institución emisora"
            value={form.institucion_emisora}
            onChange={set('institucion_emisora')}
            disabled={saving}
          />
          <EditableField
            label="Médico"
            value={form.nombre_medico}
            onChange={set('nombre_medico')}
            disabled={saving}
          />
          <EditableField
            label="Nº colegiado"
            value={form.numero_colegiado}
            onChange={set('numero_colegiado')}
            disabled={saving}
          />
        </div>

        <label className="block">
          <span className={LABEL_CLASS}>Diagnóstico</span>
          <textarea
            value={form.diagnostico}
            disabled={saving}
            onChange={(e) => set('diagnostico')(e.target.value)}
            className={TEXTAREA_CLASS}
          />
        </label>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <EditableField
            label="Fecha de emisión"
            type="date"
            value={form.fecha_emision}
            onChange={set('fecha_emision')}
            disabled={saving}
          />
          <EditableField
            label="Inicio de reposo"
            type="date"
            value={form.fecha_inicio_reposo}
            onChange={set('fecha_inicio_reposo')}
            disabled={saving}
          />
          <EditableField
            label="Fin de reposo"
            type="date"
            value={form.fecha_fin_reposo}
            onChange={set('fecha_fin_reposo')}
            disabled={saving}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <EditableField
            label="Días de reposo"
            type="number"
            value={form.dias_reposo}
            onChange={set('dias_reposo')}
            disabled={saving}
          />
        </div>

        <label className="block">
          <span className={LABEL_CLASS}>Notas internas</span>
          <textarea
            value={form.notes}
            disabled={saving}
            placeholder="Notas para el equipo de nómina."
            onChange={(e) => set('notes')(e.target.value)}
            className={TEXTAREA_CLASS}
          />
        </label>

        {updateRecord.error && (
          <div
            role="alert"
            className="px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg"
          >
            {updateRecord.error.message}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-fg-primary text-fg-inverse text-button-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <button
            type="button"
            disabled={!dirty || saving}
            onClick={handleReset}
            className="h-9 px-3 rounded-md border border-border bg-surface-card text-fg-secondary text-button-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-surface-sunken hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            Descartar
          </button>
        </div>
      </section>

      {/* Datos cortos derivados (solo lectura, complementan los inputs) */}
      <section className="border-t border-border-subtle pt-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <ReadOnlyField label="Subido" value={new Date(record.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })} />
          <ReadOnlyField label="Archivo" value={record.originalName} />
        </div>
      </section>

      {/* Acciones de workflow */}
      <section className="border-t border-border-subtle pt-4">
        <HealthActions
          id={record.id}
          currentStatus={record.healthStatus}
          personId={record.personId}
        />
      </section>
    </div>
  );
}
