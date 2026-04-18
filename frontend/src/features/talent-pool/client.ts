import { api } from '@/shared/api/client';
import type { TalentPoolRankPayload, TalentPoolRankResult } from './types/talent-pool.types';

export const talentPoolClient = {
  async rank(payload: TalentPoolRankPayload): Promise<TalentPoolRankResult> {
    const res = await api.post<TalentPoolRankResult>('/api/talent-pool/rank', payload);
    return res.data;
  },
};
