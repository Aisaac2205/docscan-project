'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/auth/authStore';
import { documentsClient } from '@/features/documents/client';
import type { Document } from '@/features/documents/types/document.types';

export const cvDocumentsQueryKey = ['talent-pool', 'cv-documents'] as const;

interface UseCvDocumentsResult {
  readonly documents: Document[];
  readonly loading: boolean;
  readonly error: string | null;
}

// limit=200 cubre el caso real para CVs cargados; cuando se supere, paginar el picker.
const CV_LIST_LIMIT = 200;

export function useCvDocuments(): UseCvDocumentsResult {
  const token = useAuthStore((s) => s.token);

  const query = useQuery({
    queryKey: cvDocumentsQueryKey,
    queryFn: async () => {
      const response = await documentsClient.list({
        type: 'cv',
        limit: CV_LIST_LIMIT,
        sort: 'createdAt',
        order: 'desc',
      });
      return response.data;
    },
    enabled: Boolean(token),
  });

  return {
    documents: query.data ?? [],
    loading: query.isLoading,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : 'Error al cargar CVs'
      : null,
  };
}
