import { api } from '@/shared/api/client';

// ---------------------------------------------------------------------------
// Activity types & shape
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Metric delta shape
// ---------------------------------------------------------------------------

/**
 * Delta relative to the previous period.
 * `direction` is the raw direction of change (up = value increased, down = decreased).
 * Whether "up" is good or bad depends on the metric — callers decide the color.
 */
export interface MetricDelta {
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
}

// ---------------------------------------------------------------------------
// Sparkline: last-7-days data points (raw numbers, no labels)
// ---------------------------------------------------------------------------

export type SparklineSeries = readonly [
  number, number, number, number, number, number, number
];

// ---------------------------------------------------------------------------
// Dashboard stats
// ---------------------------------------------------------------------------

export interface DashboardStats {
  // ── Existing fields (backend: GET /api/dashboard/stats) ──────────────────
  activePersons: number;
  unassignedDocuments: number;
  pendingHealthRecords: number;
  totalPersons: number;
  /** @deprecated Use `recentActivity` (typed as ActivityEvent[]) instead */
  recentActivity: ActivityEvent[];

  // ── OCR metrics (backend: TODO — these fields are not yet implemented) ────
  /**
   * TODO: backend needs to expose `documentsProcessedToday` in
   * GET /api/dashboard/stats. Query: COUNT of documents with
   * status='processed' AND processedAt >= today_start.
   */
  documentsProcessedToday?: number;
  /** 7-day sparkline for documentsProcessedToday */
  documentsProcessedSparkline?: SparklineSeries;
  /** Delta vs yesterday */
  documentsProcessedDelta?: MetricDelta;

  /**
   * TODO: backend needs to expose `ocrAccuracyAvgPercent` in
   * GET /api/dashboard/stats. Query: AVG(ocrConfidenceScore * 100)
   * from documents processed today, rounded to 1 decimal.
   */
  ocrAccuracyAvgPercent?: number;
  /** 7-day sparkline for ocrAccuracyAvgPercent */
  ocrAccuracySparkline?: SparklineSeries;
  /** Delta vs yesterday */
  ocrAccuracyDelta?: MetricDelta;

  /**
   * TODO: backend needs to expose `avgProcessingTimeSeconds` in
   * GET /api/dashboard/stats. Query: AVG(processingDurationMs / 1000)
   * from documents processed today.
   */
  avgProcessingTimeSeconds?: number;
  /** 7-day sparkline for avgProcessingTimeSeconds */
  processingTimeSparkline?: SparklineSeries;
  /** Delta vs yesterday */
  processingTimeDelta?: MetricDelta;

  /**
   * TODO: backend needs to expose `pendingReviewCount` in
   * GET /api/dashboard/stats. Query: COUNT of documents with
   * status='pending_review'.
   */
  pendingReviewCount?: number;
  /** 7-day sparkline for pendingReviewCount */
  pendingReviewSparkline?: SparklineSeries;
  /** Delta vs yesterday */
  pendingReviewDelta?: MetricDelta;

  // ── System status (backend: TODO — GET /api/system/status) ───────────────
  /**
   * TODO: backend needs to expose system health via GET /api/system/status.
   * Should return { ocrEngineOnline: boolean, activeWorkers: number }.
   */
  ocrEngineOnline?: boolean;
  activeWorkers?: number;
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
