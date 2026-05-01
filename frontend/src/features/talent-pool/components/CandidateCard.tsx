import { TrashIcon } from '@/shared/ui/icons';
import type { TalentPoolCandidate } from '../types/talent-pool.types';

type CandidateCardProps = {
  candidate: TalentPoolCandidate;
  index: number;
  isRemoveDisabled: boolean;
  onRemove: (id: string) => void;
  onUpdate: (id: string, patch: Partial<Pick<TalentPoolCandidate, 'nombre' | 'resumenCv'>>) => void;
};

export function CandidateCard({ candidate, index, isRemoveDisabled, onRemove, onUpdate }: CandidateCardProps) {
  return (
    <article className="rounded-lg border border-[var(--border)] bg-stone-50/45 p-3 lg:p-4 space-y-2.5 lg:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs lg:text-sm font-semibold text-stone-700">Candidato {index + 1}</p>
        <button
          onClick={() => onRemove(candidate.id)}
          disabled={isRemoveDisabled}
          className="h-7 w-7 lg:h-8 lg:w-8 rounded-md border border-[var(--border)] bg-white text-stone-500 hover:text-rose-600 hover:border-rose-200 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
          title="Quitar candidato"
        >
          <TrashIcon className="lg:w-4 lg:h-4" />
        </button>
      </div>

      <input
        value={candidate.nombre}
        onChange={(e) => onUpdate(candidate.id, { nombre: e.target.value })}
        maxLength={120}
        placeholder="Nombre"
        className="w-full h-10 lg:h-11 rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 text-sm lg:text-base text-stone-800 input-focus"
      />

      <textarea
        value={candidate.resumenCv}
        onChange={(e) => onUpdate(candidate.id, { resumenCv: e.target.value })}
        maxLength={7000}
        rows={8}
        placeholder="Pegá acá el resumen o CV del candidato"
        className="w-full rounded-lg border border-[var(--border)] bg-white px-3 lg:px-4 py-2.5 lg:py-3 text-sm lg:text-base text-stone-800 input-focus resize-y"
      />
      <p className="text-[11px] lg:text-xs text-stone-400 text-right">
        {candidate.resumenCv.length}/7000
      </p>
    </article>
  );
}
