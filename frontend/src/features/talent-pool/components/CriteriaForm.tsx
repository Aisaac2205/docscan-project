'use client';

import { useState } from 'react';
import { Heading } from '@/shared/components/Layout';
import type { TalentPoolCriteria } from '../types/talent-pool.types';
import { ListField } from './ListField';

type CriteriaFormProps = {
  criterios: TalentPoolCriteria;
  setCriterio: <K extends keyof TalentPoolCriteria>(key: K, value: TalentPoolCriteria[K]) => void;
};

const INPUT_CLASS =
  'w-full h-9 rounded-md border border-border bg-surface-card px-3 text-body-sm text-fg-primary placeholder:text-caption placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]';
const LABEL_CLASS = 'text-overline text-overline-uppercase text-fg-tertiary';

type CollapsibleListFieldProps = {
  label: string;
  helper: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
};

function CollapsibleListField({ label, helper, value, onChange, placeholder }: CollapsibleListFieldProps) {
  // Abre por defecto si ya hay items cargados (ej. evaluación previa).
  const [open, setOpen] = useState(value.length > 0);

  return (
    <details
      open={open}
      className="group rounded-md border border-border bg-surface-sunken"
    >
      <summary
        onClick={(e) => {
          e.preventDefault();
          setOpen((prev) => !prev);
        }}
        className="flex items-center justify-between gap-2 px-3 py-2 cursor-pointer select-none list-none rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className={LABEL_CLASS}>{label}</span>
          {value.length > 0 && (
            <span className="text-caption text-fg-tertiary">· {value.length}</span>
          )}
        </div>
        <span
          aria-hidden="true"
          className="text-caption text-fg-tertiary transition-transform group-open:rotate-90"
        >
          ›
        </span>
      </summary>

      <div className="px-3 pb-3 pt-1 space-y-2">
        <p className="text-caption text-fg-tertiary">{helper}</p>
        <ListField
          label={label}
          helper={helper}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          hideHeader
        />
      </div>
    </details>
  );
}

export function CriteriaForm({ criterios, setCriterio }: CriteriaFormProps) {
  return (
    <article className="rounded-md border border-border bg-surface-card p-3 md:p-4 space-y-3">
      <div className="space-y-0.5">
        <Heading level={4} as="h2" className="text-fg-primary">Criterios del proceso</Heading>
        <p className="text-caption text-fg-tertiary">Definí qué perfil buscás y qué no querés en esta vacante.</p>
      </div>

      <div className="space-y-2.5">
        <div className="space-y-1">
          <label className={LABEL_CLASS}>Puesto</label>
          <input
            value={criterios.puesto}
            onChange={(e) => setCriterio('puesto', e.target.value)}
            maxLength={120}
            placeholder="Ej: Analista Sr. de RRHH"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1">
          <label className={LABEL_CLASS}>Experiencia mínima</label>
          <input
            value={criterios.experienciaMinima}
            onChange={(e) => setCriterio('experienciaMinima', e.target.value)}
            maxLength={120}
            placeholder="Ej: 3+ años reclutando perfiles técnicos"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1">
          <label className={LABEL_CLASS}>Objetivo del rol</label>
          <textarea
            value={criterios.objetivoRol}
            onChange={(e) => setCriterio('objetivoRol', e.target.value)}
            maxLength={1200}
            rows={3}
            placeholder="Ej: Liderar el reclutamiento técnico, bajar el time-to-hire a 30 días y mejorar la calidad de las contrataciones de ingeniería."
            className="w-full rounded-md border border-border bg-surface-card px-3 py-2 text-body-sm text-fg-primary placeholder:text-caption placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] resize-y"
          />
        </div>

        <div className="space-y-1">
          <label className={LABEL_CLASS}>Idioma requerido</label>
          <input
            value={criterios.idiomaRequerido}
            onChange={(e) => setCriterio('idiomaRequerido', e.target.value)}
            maxLength={120}
            placeholder="Ej: Inglés B2 conversacional"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1">
          <label className={LABEL_CLASS}>Ubicación/modalidad</label>
          <input
            value={criterios.ubicacionModalidad}
            onChange={(e) => setCriterio('ubicacionModalidad', e.target.value)}
            maxLength={120}
            placeholder="Ej: Híbrido 2 días/sem, Guatemala"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-2">
          <CollapsibleListField
            label="Imprescindible"
            helper="Lo que sí o sí tiene que cumplir."
            value={criterios.imprescindible}
            onChange={(next) => setCriterio('imprescindible', next)}
            placeholder="Ej: Manejo de ATS (Greenhouse o Lever)"
          />
          <CollapsibleListField
            label="Deseable"
            helper="Suma puntos, pero no bloquea la contratación."
            value={criterios.deseable}
            onChange={(next) => setCriterio('deseable', next)}
            placeholder="Ej: Certificación SHRM-CP"
          />
          <CollapsibleListField
            label="No queremos"
            helper="Alertas rojas o cosas que querés evitar."
            value={criterios.noQueremos}
            onChange={(next) => setCriterio('noQueremos', next)}
            placeholder="Ej: +3 trabajos en <2 años sin justificar"
          />
        </div>
      </div>
    </article>
  );
}
