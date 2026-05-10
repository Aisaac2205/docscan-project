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
    <article className="rounded-md border border-border bg-surface-sunken/45 p-3 lg:p-4 space-y-2.5 lg:space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-overline text-overline-uppercase text-fg-tertiary">Candidato {index + 1}</p>
        <button
          onClick={() => onRemove(candidate.id)}
          disabled={isRemoveDisabled}
          className="h-8 w-8 rounded-md border border-border bg-surface-card text-fg-tertiary hover:text-danger-fg hover:border-danger-border disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center justify-center"
          title="Quitar candidato"
        >
          <TrashIcon />
        </button>
      </div>

      <input
        value={candidate.nombre}
        onChange={(e) => onUpdate(candidate.id, { nombre: e.target.value })}
        maxLength={120}
        placeholder="Nombre"
        className="w-full h-10 rounded-md border border-border bg-surface-card px-3 text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
      />

      <textarea
        value={candidate.resumenCv}
        onChange={(e) => onUpdate(candidate.id, { resumenCv: e.target.value })}
        maxLength={7000}
        rows={8}
        placeholder="Pegá acá el resumen o CV del candidato"
        className="w-full rounded-md border border-border bg-surface-card px-3 py-2.5 text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] resize-y"
      />
      <p className="text-caption text-fg-tertiary text-right">
        {candidate.resumenCv.length}/7000
      </p>
    </article>
  );
}
