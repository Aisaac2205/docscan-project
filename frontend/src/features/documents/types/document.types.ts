export interface Document {
  id: string;
  userId: string;
  personId: string | null;
  originalName: string;
  mimeType: string;
  filePath: string;
  documentType?: string;
  rawText: string | null;
  confidence: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData: Record<string, unknown> | null;
  retainOriginal?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentFilters {
  personId?: string;
  unassigned?: boolean;
  type?: string;
  status?: string;
}

