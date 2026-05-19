import type { Document } from '@prisma/client';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedDocuments {
  data: Document[];
  pagination: PaginationMeta;
}
