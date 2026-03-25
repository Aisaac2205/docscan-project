/** @deprecated Use Record<string, any> — extractedData is dynamic per document type */
export interface ExtractedData {
  proveedor?: string | null;
  fecha?: string | null;
  total?: number | null;
  nit?: string | null;
  [key: string]: any;
}

export interface Document {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  filePath: string;
  rawText: string | null;
  confidence: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  documentId: string;
}
