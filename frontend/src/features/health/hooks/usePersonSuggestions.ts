'use client';

import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';
import type { PersonSuggestion } from '../types';

export const personSuggestionsKey = (recordId: string) =>
  ['health', 'records', recordId, 'person-suggestions'] as const;

/**
 * Top-3 empleados sugeridos por similitud contra `nombre_paciente` del OCR.
 * Solo se dispara cuando `enabled === true` (típicamente: drawer abierto y
 * record SIN personId asignado).
 */
export function usePersonSuggestions(recordId: string | null, enabled: boolean) {
  const query = useQuery({
    queryKey: personSuggestionsKey(recordId ?? '__none'),
    queryFn: () => healthApi.getPersonSuggestions(recordId as string),
    enabled: Boolean(recordId) && enabled,
    staleTime: 30_000,
  });

  return {
    suggestions: (query.data ?? []) as PersonSuggestion[],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : null,
  };
}
