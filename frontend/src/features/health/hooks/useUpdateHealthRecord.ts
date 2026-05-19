'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';
import type { HealthRecord, UpdateRecordPayload } from '../types';
import { healthRecordsQueryKey } from './useHealthRecords';

interface MutationVars {
  id: string;
  payload: UpdateRecordPayload;
}

export function useUpdateHealthRecord() {
  const queryClient = useQueryClient();

  return useMutation<HealthRecord, Error, MutationVars>({
    mutationFn: ({ id, payload }) => healthApi.patchRecord(id, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<HealthRecord[]>(healthRecordsQueryKey, (prev) =>
        prev ? prev.map((r) => (r.id === updated.id ? updated : r)) : prev,
      );
    },
  });
}
