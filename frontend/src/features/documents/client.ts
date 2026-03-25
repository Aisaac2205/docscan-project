import { api } from '@/shared/api/client';
import type { Document } from './types/document.types';
import type { AxiosProgressEvent } from 'axios';

export const documentsClient = {
  async list(): Promise<Document[]> {
    const res = await api.get<Document[]>('/api/documents');
    return res.data;
  },

  async upload(file: File, onProgress?: (p: number) => void): Promise<Document> {
    const form = new FormData();
    form.append('file', file);
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
