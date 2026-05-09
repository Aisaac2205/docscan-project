import { api } from '@/shared/api/client';
import type { Evaluation, CreateEvaluationInput } from '../types';

export const evaluationsApi = {
  async list(personId: string): Promise<Evaluation[]> {
    const res = await api.get<Evaluation[]>(`/api/persons/${personId}/evaluations`);
    return res.data;
  },

  async create(personId: string, input: CreateEvaluationInput): Promise<Evaluation> {
    const res = await api.post<Evaluation>(`/api/persons/${personId}/evaluations`, input);
    return res.data;
  },

  async remove(personId: string, evaluationId: string): Promise<void> {
    await api.delete(`/api/persons/${personId}/evaluations/${evaluationId}`);
  },
};
