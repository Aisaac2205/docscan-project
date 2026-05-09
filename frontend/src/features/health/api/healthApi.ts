import { api } from '@/shared/api/client';
import type { HealthRecord, UpdateStatusPayload } from '../types';

export const healthApi = {
  async getAll(): Promise<HealthRecord[]> {
    const res = await api.get<HealthRecord[]>('/api/health-records');
    return res.data;
  },

  async updateStatus(id: string, payload: UpdateStatusPayload): Promise<HealthRecord> {
    const res = await api.patch<HealthRecord>(`/api/health-records/${id}/status`, payload);
    return res.data;
  },
};
