'use client';

import Link from 'next/link';
import type { HealthRecord } from '../types';
import { HealthActions } from './HealthActions';

interface HealthRecordCardProps {
  record: HealthRecord;
}

function formatDate(raw: string | null): string {
  if (!raw) return '—';
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw;
  return d.toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' });
}

function AuthBadge({ ok, label }: { ok: boolean | null; label: string }) {
  if (ok === null) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full border ${
        ok
          ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
          : 'text-rose-700 bg-rose-50 border-rose-200'
      }`}
    >
      <span
        aria-hidden="true"
        className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500' : 'bg-rose-500'}`}
      />
      {ok ? label : `Sin ${label.toLowerCase()}`}
    </span>
  );
}

function Field({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <p className="text-[10px] md:text-xs uppercase tracking-wider font-semibold text-stone-400 mb-0.5">
        {label}
      </p>
      <p className="text-sm text-stone-800">{value ?? '—'}</p>
    </div>
  );
}

export function HealthRecordCard({ record }: HealthRecordCardProps) {
  const daysLabel =
    record.dias_reposo != null
      ? `${record.dias_reposo} ${record.dias_reposo === 1 ? 'dia' : 'dias'}`
      : null;

  return (
    <article
      aria-label={`Constancia medica: ${record.nombre_paciente ?? record.originalName}`}
      className="bg-white border border-stone-200 rounded-xl p-4 md:p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wider font-semibold text-stone-400 mb-0.5">
            Constancia medica
          </p>
          <h3 className="text-base md:text-lg font-semibold text-stone-900 leading-tight">
            {record.personName ?? record.nombre_paciente ?? record.originalName}
          </h3>
          {record.personId ? (
            <Link
              href={`/persons/${record.personId}`}
              className="text-xs text-stone-600 hover:text-stone-900 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
            >
              Ver perfil de la persona
            </Link>
          ) : (
            <p className="text-xs text-stone-400 italic mt-0.5">Sin persona asignada</p>
          )}
          {record.institucion_emisora && (
            <p className="text-xs text-stone-500 mt-0.5">{record.institucion_emisora}</p>
          )}
        </div>
        <Link
          href={`/documents/${record.id}`}
          className="flex-shrink-0 text-xs text-stone-500 hover:text-stone-900 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
        >
          Ver documento
        </Link>
      </div>

      {/* Datos extraídos */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4 mb-4">
        {record.diagnostico && (
          <div className="col-span-2 sm:col-span-3">
            <Field label="Diagnostico" value={record.diagnostico} />
          </div>
        )}
        <Field label="Inicio de reposo" value={formatDate(record.fecha_inicio_reposo)} />
        <Field label="Fin de reposo" value={formatDate(record.fecha_fin_reposo)} />
        <Field label="Total" value={daysLabel} />
        {record.nombre_medico && (
          <div className="col-span-2 sm:col-span-1">
            <Field label="Medico" value={record.nombre_medico} />
          </div>
        )}
        {record.numero_colegiado && (
          <Field label="Colegiado" value={record.numero_colegiado} />
        )}
      </div>

      {/* Badges de autenticidad */}
      <div className="flex flex-wrap gap-2 mb-1">
        <AuthBadge ok={record.tiene_sello} label="Sello" />
        <AuthBadge ok={record.tiene_firma} label="Firma" />
      </div>

      {/* Acciones */}
      <HealthActions id={record.id} currentStatus={record.healthStatus} />
    </article>
  );
}
