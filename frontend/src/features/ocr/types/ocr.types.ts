export type ExtractionMode = 'invoice' | 'receipt' | 'id_card' | 'general' | 'custom';

export const EXTRACTION_MODE_LABELS: Record<ExtractionMode, string> = {
  general: 'Texto libre',
  invoice: 'Factura',
  receipt: 'Recibo / Ticket',
  id_card: 'DPI / Cédula',
  custom:  'Personalizado',
};

export type OCRResponse = {
  documentId: string;
  extractionMode: ExtractionMode;
  extractedData: Record<string, unknown>;
};

export type SuggestedField = {
  key: string;
  label: string;
  description?: string;
};

export type AnalyzeResult = {
  documentId: string;
  detectedType: string;
  detectedTypeLabel: string;
  confidence: number;
  description: string;
  suggestedFields: SuggestedField[];
};

export type QueryResult = {
  documentId: string;
  question: string;
  answer: string;
};

export type QueryHistoryItem = {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
};
