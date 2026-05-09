import { api } from '@/shared/api/client';
import type { Document, DocumentFilters } from './types/document.types';
import type { AxiosProgressEvent } from 'axios';

export const documentsClient = {
  async list(filters?: DocumentFilters): Promise<Document[]> {
    const params: Record<string, string> = {};
    if (filters?.personId) params.personId = filters.personId;
    if (filters?.unassigned) params.unassigned = 'true';
    if (filters?.type) params.type = filters.type;
    if (filters?.status) params.status = filters.status;
    const res = await api.get<Document[]>('/api/documents', { params });
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
