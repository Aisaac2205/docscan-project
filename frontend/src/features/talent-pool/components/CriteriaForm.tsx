import { Heading } from '@/shared/components/Layout';
import type { TalentPoolCriteria } from '../types/talent-pool.types';
import { ListField } from './ListField';

type CriteriaFormProps = {
  criterios: TalentPoolCriteria;
  setCriterio: <K extends keyof TalentPoolCriteria>(key: K, value: TalentPoolCriteria[K]) => void;
};

export function CriteriaForm({ criterios, setCriterio }: CriteriaFormProps) {
  const inputClass = 'w-full h-10 rounded-md border border-border bg-surface-card px-3 text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]';
  const labelClass = 'text-overline text-overline-uppercase text-fg-tertiary';

  return (
    <article className="rounded-md border border-border bg-surface-card p-4 md:p-5 lg:p-6 space-y-4">
      <div className="space-y-1">
        <Heading level={4} as="h2" className="text-fg-primary">Criterios del proceso</Heading>
        <p className="text-caption text-fg-tertiary">Definí qué perfil buscás y qué no querés en esta vacante.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-1">
          <label className={labelClass}>Puesto</label>
          <input
            value={criterios.puesto}
            onChange={(e) => setCriterio('puesto', e.target.value)}
            maxLength={120}
            placeholder="Ej: Analista de RRHH"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className={labelClass}>Experiencia mínima</label>
          <input
            value={criterios.experienciaMinima}
            onChange={(e) => setCriterio('experienciaMinima', e.target.value)}
            maxLength={120}
            placeholder="Ej: 3 años en reclutamiento"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className={labelClass}>Objetivo del rol</label>
          <textarea
            value={criterios.objetivoRol}
            onChange={(e) => setCriterio('objetivoRol', e.target.value)}
            maxLength={1200}
            rows={4}
            placeholder="Contanos para qué existe este rol y qué impacto esperás"
            className="w-full rounded-md border border-border bg-surface-card px-3 py-2.5 text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Idioma requerido</label>
          <input
            value={criterios.idiomaRequerido}
            onChange={(e) => setCriterio('idiomaRequerido', e.target.value)}
            maxLength={120}
            placeholder="Ej: Inglés intermedio"
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Ubicación/modalidad</label>
          <input
            value={criterios.ubicacionModalidad}
            onChange={(e) => setCriterio('ubicacionModalidad', e.target.value)}
            maxLength={120}
            placeholder="Ej: Híbrido en Ciudad de Guatemala"
            className={inputClass}
          />
        </div>

        <div className="md:col-span-2 grid gap-3 lg:grid-cols-2">
          <ListField
            label="Imprescindible"
            helper="Lo que sí o sí tiene que cumplir."
            value={criterios.imprescindible}
            onChange={(next) => setCriterio('imprescindible', next)}
            placeholder="Ej: Manejo de nómina"
          />
          <ListField
            label="Deseable"
            helper="Suma puntos, pero no bloquea la contratación."
            value={criterios.deseable}
            onChange={(next) => setCriterio('deseable', next)}
            placeholder="Ej: Manejo de ATS"
          />
        </div>

        <div className="md:col-span-2">
          <ListField
            label="No queremos"
            helper="Alertas rojas o cosas que querés evitar."
            value={criterios.noQueremos}
            onChange={(next) => setCriterio('noQueremos', next)}
            placeholder="Ej: Alta rotación sin explicación"
          />
        </div>
      </div>
    </article>
  );
}
