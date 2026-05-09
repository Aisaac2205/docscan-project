import { api } from '@/shared/api/client';

export type ActivityType =
  | 'document_processed'
  | 'document_pending'
  | 'person_created'
  | 'evaluation_generated';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  detail: string;
  occurredAt: string;
  link?: string;
}

export interface DashboardStats {
  activePersons: number;
  unassignedDocuments: number;
  pendingHealthRecords: number;
  totalPersons: number;
  recentActivity: ActivityItem[];
}

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/api/dashboard/stats');
    return res.data;
  },
};
