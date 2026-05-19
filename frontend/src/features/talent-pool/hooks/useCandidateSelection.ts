'use client';

import { useCallback, useState } from 'react';
import { toast } from '@/shared/ui/toast/store';
import type { Document } from '@/features/documents/types/document.types';
import { useTalentPoolStore } from '../store';

interface UseCandidateSelectionArgs {
  readonly availableDocuments: readonly Document[];
}

interface UseCandidateSelectionResult {
  readonly selectedIds: string[];
  readonly toggle: (id: string) => void;
  readonly addSelected: () => void;
  readonly clear: () => void;
}

/**
 * Estado UI del picker de CVs + acción "agregar al pool" con toasts derivados
 * del outcome del store. Vive cerca del feature porque el resultado
 * (`agregados`/`omitidos*`) sólo tiene sentido aquí.
 */
export function useCandidateSelection({
  availableDocuments,
}: UseCandidateSelectionArgs): UseCandidateSelectionResult {
  const addCandidatesFromDocuments = useTalentPoolStore((s) => s.addCandidatesFromDocuments);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => (
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    ));
  }, []);

  const clear = useCallback(() => setSelectedIds([]), []);

  const addSelected = useCallback(() => {
    if (selectedIds.length === 0) {
      toast.info('Seleccioná al menos un CV para agregarlo.');
      return;
    }

    const selected = availableDocuments.filter((d) => selectedIds.includes(d.id));
    const result = addCandidatesFromDocuments(selected);

    if (result.agregados > 0) {
      toast.success(`Se agregaron ${result.agregados} candidato(s) desde documentos escaneados.`);
    }
    if (result.omitidosSinContenido > 0) {
      toast.info(`${result.omitidosSinContenido} documento(s) no tenían texto ni datos extraídos y se omitieron.`);
    }
    if (result.omitidosDuplicados > 0) {
      toast.info(`${result.omitidosDuplicados} documento(s) ya estaban cargados o excedían el límite de 25 candidatos.`);
    }
    if (
      result.agregados === 0
      && result.omitidosSinContenido === 0
      && result.omitidosDuplicados === 0
    ) {
      toast.info('No hubo cambios para agregar.');
    }

    setSelectedIds([]);
  }, [selectedIds, availableDocuments, addCandidatesFromDocuments]);

  return { selectedIds, toggle, addSelected, clear };
}
