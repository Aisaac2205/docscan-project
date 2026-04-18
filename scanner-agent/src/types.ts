export const EXTRACTION_MODES = [
  'cv',
  'id_card',
  'fiscal_social',
  'medical_cert',
  'general',
  'custom',
] as const;

export type ExtractionMode = (typeof EXTRACTION_MODES)[number];

export interface AgentConfig {
  naps2Path: string;
  scanTempDir: string;
  backendBaseUrl: string;
  scannerAgentKey: string;
  extractionMode: ExtractionMode;
  targetUserId: string;
  naps2Arguments?: string;
  queueFilePath: string;
  queueRetryBaseMs: number;
}

export interface Naps2RunResult {
  exitCode: number;
  stdout: string;
  stderr: string;
}

export interface UploadResult {
  documentId: string;
  extractionMode: ExtractionMode;
  status: 'completed';
  extractedData: unknown;
}

export interface RetryConfig {
  maxAttempts: number;
  waitMs: number;
}

export interface QueuedUpload {
  id: string;
  jobId: string;
  pdfPath: string;
  userId: string;
  extractionMode: ExtractionMode;
  attempts: number;
  createdAt: string;
  lastError: string;
  nextRetryAt: string;
}

export interface AgentRuntimeInfo {
  agentId: string;
  version: string;
}
