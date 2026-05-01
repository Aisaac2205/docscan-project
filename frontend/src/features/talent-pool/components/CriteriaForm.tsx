import type { TalentPoolCriteria } from '../types/talent-pool.types';
import { ListField } from './ListField';

type CriteriaFormProps = {
  criterios: TalentPoolCriteria;
  setCriterio: <K extends keyof TalentPoolCriteria>(key: K, value: TalentPoolCriteria[K]) => void;
};

export function CriteriaForm({ criterios, setCriterio }: CriteriaFormProps) {
  return (
    <article className="rounded-xl border border-[var(--border)] bg-white p-4 md:p-5 lg:p-6 space-y-4">
      <div className="space-y-1">
        <h2 className="text-sm lg:text-base font-semibold text-stone-800">Criterios del proceso</h2>
        <p className="text-xs lg:text-sm text-stone-400">Definí qué perfil buscás y qué no querés en esta vacante.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1.5 md:col-span-1">
          <label className="text-[12px] lg:text-xs font-semibold text-stone-700">Puesto</label>
          <input
            value={criterios.puesto}
            onChange={(e) => setCriterio('puesto', e.target.value)}
            maxLength={120}
            placeholder="Ej: Analista de RRHH"
            className="w-full h-10 lg:h-11 rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 text-sm lg:text-base text-stone-800 input-focus"
          />
        </div>

        <div className="space-y-1.5 md:col-span-1">
          <label className="text-[12px] lg:text-xs font-semibold text-stone-700">Experiencia mínima</label>
          <input
            value={criterios.experienciaMinima}
            onChange={(e) => setCriterio('experienciaMinima', e.target.value)}
            maxLength={120}
            placeholder="Ej: 3 años en reclutamiento"
            className="w-full h-10 lg:h-11 rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 text-sm lg:text-base text-stone-800 input-focus"
          />
        </div>

        <div className="space-y-1.5 md:col-span-2">
          <label className="text-[12px] lg:text-xs font-semibold text-stone-700">Objetivo del rol</label>
          <textarea
            value={criterios.objetivoRol}
            onChange={(e) => setCriterio('objetivoRol', e.target.value)}
            maxLength={1200}
            rows={4}
            placeholder="Contanos para qué existe este rol y qué impacto esperás"
            className="w-full rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base text-stone-800 input-focus resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] lg:text-xs font-semibold text-stone-700">Idioma requerido</label>
          <input
            value={criterios.idiomaRequerido}
            onChange={(e) => setCriterio('idiomaRequerido', e.target.value)}
            maxLength={120}
            placeholder="Ej: Inglés intermedio"
            className="w-full h-10 lg:h-11 rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 text-sm lg:text-base text-stone-800 input-focus"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] lg:text-xs font-semibold text-stone-700">Ubicación/modalidad</label>
          <input
            value={criterios.ubicacionModalidad}
            onChange={(e) => setCriterio('ubicacionModalidad', e.target.value)}
            maxLength={120}
            placeholder="Ej: Híbrido en Ciudad de Guatemala"
            className="w-full h-10 lg:h-11 rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 text-sm lg:text-base text-stone-800 input-focus"
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
