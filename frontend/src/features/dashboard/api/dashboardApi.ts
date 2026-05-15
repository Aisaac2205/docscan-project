import { api } from '@/shared/api/client';

// ---------------------------------------------------------------------------
// Shape mirrors backend `dashboard.service.ts`. Keep both files in lockstep.
// TODO: when a shared types package exists (`packages/shared` or codegen),
// move these interfaces there and import from a single source of truth.
// ---------------------------------------------------------------------------

// ── Activity ───────────────────────────────────────────────────────────────

export type ActivityType =
  | 'document_processed'
  | 'document_pending'
  | 'person_created'
  | 'evaluation_generated';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  /** Document filename or event title */
  title: string;
  /** Document type or extra context */
  detail: string;
  occurredAt: string; // ISO 8601
  /**
   * Initials of the user who triggered the event.
   * TODO: backend needs to join with the users table and return this field.
   * Expected: first letter of first name + first letter of last name (e.g. "JD").
   */
  userInitials?: string;
  link?: string;
}

// ── MetricCard adapter types (UI internal — not part of API response) ──────

export interface MetricDelta {
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
}

export type SparklineSeries = readonly number[];

// ── Chart payload types (mirror backend) ───────────────────────────────────

export interface WeeklyProcessingPoint {
  day: string;
  procesados: number;
  validados: number;
}

// Buckets alineados 1:1 con ExtractionMode (ver
// `features/ocr/types/ocr.types.ts`). `general` y `custom` se excluyen
// del chart porque son catch-all sin tipo catalogable.
export type DocumentTypeBucket =
  | 'cv'
  | 'id_card'
  | 'fiscal_social'
  | 'medical_cert'
  | 'background_check';

export interface DocumentTypeBucketCount {
  type: DocumentTypeBucket;
  count: number;
  percentage: number;
}

export type ProcessingStatusBucket =
  | 'completado'
  | 'pendiente'
  | 'revision'
  | 'error';

export interface ProcessingStatusBucketCount {
  status: ProcessingStatusBucket;
  count: number;
  percentage: number;
}

// ── Full dashboard response ────────────────────────────────────────────────

export interface DashboardStats {
  // Pre-existing fields
  activePersons: number;
  unassignedDocuments: number;
  pendingHealthRecords: number;
  totalPersons: number;
  recentActivity: ActivityEvent[];

  // Per-metric
  documentsProcessedToday: number;
  documentsProcessedTodayDelta: number;
  documentsProcessedWeekly: number[];

  ocrPrecision: number;
  ocrPrecisionDelta: number;
  ocrPrecisionWeekly: number[];

  avgProcessingTime: number;
  avgProcessingTimeDelta: number;
  avgProcessingTimeWeekly: number[];

  pendingReview: number;
  pendingReviewDelta: number;
  pendingReviewWeekly: number[];

  // Charts
  weeklyProcessing: WeeklyProcessingPoint[];
  documentTypes: DocumentTypeBucketCount[];
  processingStatus: ProcessingStatusBucketCount[];

  // ── Optional fields the backend has not yet wired (TODO endpoints) ───────
  /**
   * TODO: backend GET /api/system/status should expose
   * { ocrEngineOnline: boolean, activeWorkers: number }.
   */
  ocrEngineOnline?: boolean;
  activeWorkers?: number;
}

// ---------------------------------------------------------------------------
// Adapter helpers — convert backend signed-number deltas to MetricDelta shape
// expected by MetricCard.
// ---------------------------------------------------------------------------

export function toMetricDelta(signedPercent: number): MetricDelta {
  if (signedPercent === 0) return { percentage: 0, direction: 'neutral' };
  return {
    percentage: Math.abs(signedPercent),
    direction: signedPercent > 0 ? 'up' : 'down',
  };
}

// ---------------------------------------------------------------------------
// API module
// ---------------------------------------------------------------------------

export const dashboardApi = {
  async getStats(): Promise<DashboardStats> {
    const res = await api.get<DashboardStats>('/api/dashboard/stats');
    return res.data;
  },
};
