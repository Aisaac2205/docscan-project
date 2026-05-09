import { api } from '@/shared/api/client';
import type { ComplianceFile } from '../types';

export const complianceApi = {
  async getForPerson(personId: string): Promise<ComplianceFile> {
    const res = await api.get<ComplianceFile>(`/api/compliance/persons/${personId}`);
    return res.data;
  },

  async revalidate(personId: string): Promise<ComplianceFile> {
    const res = await api.post<ComplianceFile>(`/api/compliance/persons/${personId}/validate`);
    return res.data;
  },
};
