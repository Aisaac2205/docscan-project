'use client';

import { useCallback } from 'react';
import { toast } from '@/shared/ui/toast/store';
import type { ProviderId } from '@/features/ocr/types/ocr.types';
import { useTalentPoolStore } from '../store';
import type { TalentPoolCandidate, TalentPoolCriteria } from '../types/talent-pool.types';

const MAX_CV_LENGTH = 7000;
const MIN_CANDIDATES = 2;

interface UseTalentPoolEvaluationResult {
  readonly evaluando: boolean;
  readonly error: string | null;
  readonly evaluate: (provider: ProviderId, model: string | undefined) => Promise<void>;
}

function validate(criterios: TalentPoolCriteria, candidatos: TalentPoolCandidate[]): string | null {
  if (!criterios.puesto.trim()) return 'Completá el campo "Puesto".';
  if (!criterios.objetivoRol.trim()) return 'Completá el campo "Objetivo del rol".';
  if (candidatos.length < MIN_CANDIDATES) return 'Agregá al menos 2 candidatos para comparar.';

  for (const candidate of candidatos) {
    if (!candidate.nombre.trim()) return 'Cada candidato necesita nombre.';
    if (!candidate.resumenCv.trim()) {
      return `Falta el resumen/CV de ${candidate.nombre || 'un candidato'}.`;
    }
    if (candidate.resumenCv.trim().length > MAX_CV_LENGTH) {
      return `El resumen/CV de ${candidate.nombre} supera ${MAX_CV_LENGTH} caracteres.`;
    }
  }
  return null;
}

/**
 * Validación de criterios+candidatos y disparo de la evaluación, con toasts
 * de éxito/error. El backend de IA y la persistencia del run vive en el store.
 */
export function useTalentPoolEvaluation(): UseTalentPoolEvaluationResult {
  const criterios = useTalentPoolStore((s) => s.criterios);
  const candidatos = useTalentPoolStore((s) => s.candidatos);
  const evaluando = useTalentPoolStore((s) => s.evaluando);
  const error = useTalentPoolStore((s) => s.error);
  const storeEvaluate = useTalentPoolStore((s) => s.evaluate);

  const evaluate = useCallback(
    async (provider: ProviderId, model: string | undefined) => {
      const validationError = validate(criterios, candidatos);
      if (validationError) {
        toast.error(validationError);
        return;
      }

      const result = await storeEvaluate(provider, model);
      if (result) {
        toast.success('Evaluación completada. Ya tenés el ranking ordenado.');
      }
    },
    [criterios, candidatos, storeEvaluate],
  );

  return { evaluando, error, evaluate };
}
