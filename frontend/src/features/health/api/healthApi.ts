import { api } from '@/shared/api/client';
import type {
  HealthRecord,
  PersonSuggestion,
  UpdateRecordPayload,
  UpdateStatusPayload,
} from '../types';

export const healthApi = {
  async getAll(): Promise<HealthRecord[]> {
    const res = await api.get<HealthRecord[]>('/api/health-records');
    return res.data;
  },

  async updateStatus(id: string, payload: UpdateStatusPayload): Promise<HealthRecord> {
    const res = await api.patch<HealthRecord>(`/api/health-records/${id}/status`, payload);
    return res.data;
  },

  async patchRecord(id: string, payload: UpdateRecordPayload): Promise<HealthRecord> {
    const res = await api.patch<HealthRecord>(`/api/health-records/${id}`, payload);
    return res.data;
  },

  async getPersonSuggestions(id: string): Promise<PersonSuggestion[]> {
    const res = await api.get<PersonSuggestion[]>(`/api/health-records/${id}/person-suggestions`);
    return res.data;
  },
};
