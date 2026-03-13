import { apiClient } from '@/lib/api-client';
import { Document } from '@/types/document.types';

export const apiService = {
  getDocuments: () => apiClient.get<Document[]>('/documents'),
  
  getDocument: (id: string) => apiClient.get<Document>(`/documents/${id}`),
  
  uploadDocument: (file: File) => apiClient.upload<Document>('/documents/upload', file),
  
  deleteDocument: (id: string) => apiClient.delete<void>(`/documents/${id}`),
};
