import { api } from '@/shared/api/client';
import type {
  Person,
  PersonProfileResponse,
  PersonEvaluation,
  CreatePersonInput,
  UpdatePersonInput,
  PaginatedPersons,
  PersonMetrics,
  CompletenessDetail,
  BackgroundTipoEmisor,
} from '../types';
import type { Document } from '@/features/documents/types/document.types';

export interface ListPersonsParams {
  status?: string;
  q?: string;
  page?: number;
  pageSize?: number;
  include?: 'completeness';
}

export const personsApi = {
  async list(params?: ListPersonsParams): Promise<PaginatedPersons> {
    const res = await api.get<PaginatedPersons>('/api/persons', { params });
    return res.data;
  },

  async getMetrics(): Promise<PersonMetrics> {
    const res = await api.get<PersonMetrics>('/api/persons/metrics');
    return res.data;
  },

  async getCompleteness(id: string): Promise<CompletenessDetail> {
    const res = await api.get<CompletenessDetail>(`/api/persons/${id}/completeness`);
    return res.data;
  },

  async getOne(id: string): Promise<Person> {
    const res = await api.get<Person>(`/api/persons/${id}`);
    return res.data;
  },

  async create(input: CreatePersonInput): Promise<Person> {
    const res = await api.post<Person>('/api/persons', input);
    return res.data;
  },

  async update(id: string, input: UpdatePersonInput): Promise<Person> {
    const res = await api.patch<Person>(`/api/persons/${id}`, input);
    return res.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/api/persons/${id}`);
  },

  async getProfile(id: string): Promise<PersonProfileResponse> {
    const res = await api.get<PersonProfileResponse>(`/api/persons/${id}/profile`);
    return res.data;
  },

  async updateOverrides(id: string, overrides: Record<string, unknown>): Promise<Person> {
    const res = await api.patch<Person>(`/api/persons/${id}/overrides`, { overrides });
    return res.data;
  },

  async listDocuments(id: string): Promise<Document[]> {
    const res = await api.get<Document[]>(`/api/persons/${id}/documents`);
    return res.data;
  },

  async listEvaluations(id: string): Promise<PersonEvaluation[]> {
    const res = await api.get<PersonEvaluation[]>(`/api/persons/${id}/evaluations`);
    return res.data;
  },
};

export const documentsAssignApi = {
  async assign(documentId: string, personId: string | null) {
    const res = await api.patch(`/api/documents/${documentId}/assign`, { personId });
    return res.data;
  },

  async classifyBackground(documentId: string, tipoEmisor: BackgroundTipoEmisor) {
    const res = await api.patch(`/api/documents/${documentId}/classify-background`, {
      tipo_emisor: tipoEmisor,
    });
    return res.data;
  },
};
