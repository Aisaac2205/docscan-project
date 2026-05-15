// ---------------------------------------------------------------------------
// Dashboard constants — status buckets, type buckets, and config thresholds.
// Keep this in sync with the corresponding frontend constants in
// `frontend/src/features/dashboard/api/dashboardApi.ts`.
// ---------------------------------------------------------------------------

/** Internal Document.status values currently used across the codebase. */
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

/**
 * Confidence threshold below which a completed document is bucketed as
 * "needs review" instead of "completed" in the processing-status chart.
 * Documents without an explicit confidence value are treated as < threshold.
 */
export const OCR_REVIEW_CONFIDENCE_THRESHOLD = 0.7;

/** Processing-status buckets surfaced to the frontend. */
export type ProcessingStatusBucket =
  | 'completado'
  | 'pendiente'
  | 'revision'
  | 'error';

/** Document-type buckets surfaced to the frontend. */
export type DocumentTypeBucket =
  | 'cv'
  | 'dpi'
  | 'contrato'
  | 'pasaporte'
  | 'factura';

/**
 * Maps an internal Document.documentType to a chart bucket.
 *
 * Current ExtractionMode values that have NO matching bucket
 * (medical_cert, background_check, general, custom, "document"):
 * they are intentionally excluded from the chart — only the 5 HR-relevant
 * types are surfaced. Documents with those types still count in the
 * overall metrics, just not in this specific chart.
 *
 * TODO: when ExtractionMode adds CONTRATO and separates PASAPORTE from
 * ID_CARD, extend this mapping. For invoices ("factura"), a future
 * ExtractionMode.INVOICE should map directly.
 */
export const DOCUMENT_TYPE_BUCKET_MAP: Readonly<Record<string, DocumentTypeBucket>> = {
  cv: 'cv',
  id_card: 'dpi',
  // Placeholder mappings for future ExtractionMode values — keys included
  // for clarity. Until OCR populates them, counts stay at 0 (real, not mocked).
  contrato: 'contrato',
  pasaporte: 'pasaporte',
  factura: 'factura',
  invoice: 'factura',
};

export const ALL_TYPE_BUCKETS: readonly DocumentTypeBucket[] = [
  'cv', 'dpi', 'contrato', 'pasaporte', 'factura',
];

export const ALL_STATUS_BUCKETS: readonly ProcessingStatusBucket[] = [
  'completado', 'pendiente', 'revision', 'error',
];

/** Spanish day-of-week labels, lunes-first (matches user-facing weekly chart). */
export const WEEK_DAY_LABELS_ES: readonly string[] = [
  'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom',
];
