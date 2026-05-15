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

/**
 * Document-type buckets surfaced to the frontend.
 *
 * Aligned 1:1 con los ExtractionMode reales que el OCR populates en
 * `Document.documentType` (ver `backend/src/modules/ocr/dto/ocr.dto.ts`
 * y `frontend/src/features/ocr/types/ocr.types.ts` para los labels).
 *
 * Excluidos a propósito:
 * - `general` y `custom`: catch-all sin tipo claro, no aportan valor en
 *   un chart de distribución por tipo.
 * - El default histórico `"document"`: no es un tipo extraído, es el
 *   placeholder pre-OCR.
 */
export type DocumentTypeBucket =
  | 'cv'
  | 'id_card'
  | 'fiscal_social'
  | 'medical_cert'
  | 'background_check';

/**
 * Maps `Document.documentType` (string libre actualmente) al bucket
 * del chart. Identidad para los 5 modos catalogables; el resto cae
 * fuera del chart sin contarlo como ruido.
 */
export const DOCUMENT_TYPE_BUCKET_MAP: Readonly<Record<string, DocumentTypeBucket>> = {
  cv: 'cv',
  id_card: 'id_card',
  fiscal_social: 'fiscal_social',
  medical_cert: 'medical_cert',
  background_check: 'background_check',
};

export const ALL_TYPE_BUCKETS: readonly DocumentTypeBucket[] = [
  'cv', 'id_card', 'fiscal_social', 'medical_cert', 'background_check',
];

export const ALL_STATUS_BUCKETS: readonly ProcessingStatusBucket[] = [
  'completado', 'pendiente', 'revision', 'error',
];

/** Spanish day-of-week labels, lunes-first (matches user-facing weekly chart). */
export const WEEK_DAY_LABELS_ES: readonly string[] = [
  'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom',
];
