import type { Document } from '@prisma/client';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DocumentPersonSummary {
  id: string;
  fullName: string;
}

export type DocumentListItem = Document & {
  person: DocumentPersonSummary | null;
};

export interface PaginatedDocuments {
  data: DocumentListItem[];
  pagination: PaginationMeta;
}
