import { api } from '@/shared/api/client';
import type {
  TalentPoolHistoryItem,
  TalentPoolRankPayload,
  TalentPoolRankResult,
  TalentPoolRunMeta,
} from './types/talent-pool.types';

export const talentPoolClient = {
  async rank(payload: TalentPoolRankPayload): Promise<TalentPoolRankResult> {
    const res = await api.post<TalentPoolRankResult>('/api/talent-pool/rank', payload);
    return res.data;
  },

  async listHistory(limit = 20): Promise<TalentPoolHistoryItem[]> {
    const res = await api.get<TalentPoolHistoryItem[]>('/api/talent-pool/history', {
      params: { limit },
    });
    return res.data;
  },

  async setPinned(runId: string, isPinned: boolean): Promise<TalentPoolRunMeta> {
    const res = await api.patch<TalentPoolRunMeta>(`/api/talent-pool/history/${runId}/pin`, {
      isPinned,
    });
    return res.data;
  },
};
