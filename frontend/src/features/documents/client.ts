import { api } from '@/shared/api/client';
import type {
  Document,
  DocumentFilters,
  DocumentsStats,
  DocumentsStatsFilters,
  PaginatedDocuments,
} from './types/document.types';
import type { AxiosProgressEvent } from 'axios';

function buildListParams(filters?: DocumentFilters): Record<string, string> {
  const params: Record<string, string> = {};
  if (!filters) return params;
  if (filters.personId) params.personId = filters.personId;
  if (filters.unassigned) params.unassigned = 'true';
  if (filters.type) params.type = filters.type;
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom;
  if (filters.dateTo) params.dateTo = filters.dateTo;
  if (typeof filters.confidenceMax === 'number') params.confidenceMax = String(filters.confidenceMax);
  if (typeof filters.confidenceMin === 'number') params.confidenceMin = String(filters.confidenceMin);
  if (typeof filters.page === 'number') params.page = String(filters.page);
  if (typeof filters.limit === 'number') params.limit = String(filters.limit);
  if (filters.sort) params.sort = filters.sort;
  if (filters.order) params.order = filters.order;
  return params;
}

export const documentsClient = {
  async list(filters?: DocumentFilters): Promise<PaginatedDocuments> {
    const res = await api.get<PaginatedDocuments>('/api/documents', {
      params: buildListParams(filters),
    });
    return res.data;
  },

  async stats(filters?: DocumentsStatsFilters): Promise<DocumentsStats> {
    const params: Record<string, string> = {};
    if (filters?.dateFrom) params.dateFrom = filters.dateFrom;
    if (filters?.dateTo) params.dateTo = filters.dateTo;
    const res = await api.get<DocumentsStats>('/api/documents/stats', { params });
    return res.data;
  },

  async assignPerson(documentId: string, personId: string | null): Promise<Document> {
    const res = await api.patch<Document>(`/api/documents/${documentId}/assign`, { personId });
    return res.data;
  },

  async upload(
    file: File,
    onProgress?: (p: number) => void,
    personId?: string,
  ): Promise<Document> {
    const form = new FormData();
    form.append('file', file);
    if (personId) form.append('personId', personId);
    const res = await api.post('/api/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return res.data as Document;
  },

  async get(id: string): Promise<Document> {
    const res = await api.get<Document>(`/api/documents/${id}`);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/api/documents/${id}`);
  },
};
