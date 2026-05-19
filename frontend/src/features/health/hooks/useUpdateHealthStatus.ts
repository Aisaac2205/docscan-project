'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';
import type { HealthRecord, UpdateStatusPayload } from '../types';
import { healthRecordsQueryKey } from './useHealthRecords';

interface MutationVars {
  id: string;
  payload: UpdateStatusPayload;
}

export function useUpdateHealthStatus() {
  const queryClient = useQueryClient();

  return useMutation<HealthRecord, Error, MutationVars>({
    mutationFn: ({ id, payload }) => healthApi.updateStatus(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<HealthRecord[]>(healthRecordsQueryKey, (prev) =>
        prev ? prev.map((r) => (r.id === updated.id ? updated : r)) : prev,
      );
    },
  });
}
