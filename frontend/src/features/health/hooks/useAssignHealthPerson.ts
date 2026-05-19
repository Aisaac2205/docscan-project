'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentsAssignApi } from '@/features/persons/api/personsApi';
import { healthApi } from '../api/healthApi';
import type { HealthRecord } from '../types';
import { healthRecordsQueryKey } from './useHealthRecords';
import { personSuggestionsKey } from './usePersonSuggestions';

interface MutationVars {
  recordId: string;
  personId: string | null;
}

/**
 * Vincula (o desvincula) una constancia médica a una persona.
 * Una constancia médica ES un Document — reusamos `PATCH /api/documents/:id/assign`
 * en vez de duplicar endpoint. Después refetcheamos el record para actualizar
 * el `personName` derivado desde el backend.
 */
export function useAssignHealthPerson() {
  const queryClient = useQueryClient();

  return useMutation<HealthRecord, Error, MutationVars>({
    mutationFn: async ({ recordId, personId }) => {
      await documentsAssignApi.assign(recordId, personId);
      // El backend de documents/assign no devuelve el HealthRecord shape, así
      // que refetcheamos la lista entera (es barata) y devolvemos el record
      // actualizado desde ahí.
      const records = await healthApi.getAll();
      const updated = records.find((r) => r.id === recordId);
      if (!updated) throw new Error('Registro no encontrado tras vincular');
      return updated;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<HealthRecord[]>(healthRecordsQueryKey, (prev) =>
        prev ? prev.map((r) => (r.id === updated.id ? updated : r)) : prev,
      );
      // Invalida sugerencias del record: si quedó linked ya no aplican, y
      // si fue unlink puede haber cambiado el ranking.
      queryClient.invalidateQueries({ queryKey: personSuggestionsKey(updated.id) });
    },
  });
}
