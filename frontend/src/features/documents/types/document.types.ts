export interface DocumentPersonSummary {
  id: string;
  fullName: string;
}

export interface Document {
  id: string;
  userId: string;
  personId: string | null;
  /** Presente cuando el listado paginado incluye el join con Person. */
  person?: DocumentPersonSummary | null;
  originalName: string;
  mimeType: string;
  filePath: string;
  documentType?: string;
  rawText: string | null;
  confidence: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData: Record<string, unknown> | null;
  retainOriginal?: boolean;
  processedAt?: string | null;
  processingDurationMs?: number | null;
  validatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ListSortField = 'createdAt' | 'confidence' | 'originalName';
export type ListSortOrder = 'asc' | 'desc';

export interface DocumentFilters {
  personId?: string;
  unassigned?: boolean;
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  confidenceMax?: number;
  confidenceMin?: number;
  page?: number;
  limit?: number;
  sort?: ListSortField;
  order?: ListSortOrder;
}

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

export interface DocumentsMetric {
  value: number;
  delta: number;
  sparkline: number[];
}

export interface DocumentsStats {
  total: DocumentsMetric;
  ocrPrecision: DocumentsMetric;
  needsReview: DocumentsMetric;
}

export interface DocumentsStatsFilters {
  dateFrom?: string;
  dateTo?: string;
}
