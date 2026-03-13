export interface Document {
  id: string;
  userId: string;
  originalName: string;
  mimeType: string;
  filePath: string;
  rawText: string | null;
  confidence: number | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface OCRResult {
  text: string;
  confidence: number;
  documentId: string;
}

export interface ScannerDevice {
  id: string;
  name: string;
  manufacturer: string;
}
