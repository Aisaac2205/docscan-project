export type ExtractionMode = 'cv' | 'id_card' | 'fiscal_social' | 'medical_cert' | 'general' | 'custom';

export type ProviderId = 'gemini' | 'lmstudio';

export type ModelInfo = {
  id: string;
  name: string;
};

export type ProviderInfo = {
  id: ProviderId;
  displayName: string;
  available: boolean;
  models: ModelInfo[];
};

export const EXTRACTION_MODE_LABELS: Record<ExtractionMode, string> = {
  cv:           'Currículum Vitae',
  id_card:      'DPI / Pasaporte',
  fiscal_social: 'NIT / IGSS',
  medical_cert: 'Constancia Médica',
  general:      'Texto libre',
  custom:       'Personalizado',
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
