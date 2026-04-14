export interface Document {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  filePath: string;
  rawText: string | null;
  confidence: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

