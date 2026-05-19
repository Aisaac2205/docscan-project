// ---------------------------------------------------------------------------
// Dashboard — constantes propias del dashboard (buckets y labels). Las
// constantes canónicas de documento (DOCUMENT_STATUS, CONFIDENCE_REVIEW_THRESHOLD,
// DocumentTypeBucket) viven en `documents.constants.ts` y se reexportan acá
// por conveniencia para no romper imports legacy.
// ---------------------------------------------------------------------------

export {
  DOCUMENT_STATUS,
  CONFIDENCE_REVIEW_THRESHOLD,
  ALL_TYPE_BUCKETS,
  DOCUMENT_TYPE_BUCKET_MAP,
  type DocumentTypeBucket,
} from '../documents/documents.constants';

/** Processing-status buckets surfaced to the frontend. */
export type ProcessingStatusBucket =
  | 'completado'
  | 'pendiente'
  | 'revision'
  | 'error';

export const ALL_STATUS_BUCKETS: readonly ProcessingStatusBucket[] = [
  'completado', 'pendiente', 'revision', 'error',
];

/** Spanish day-of-week labels, lunes-first (matches user-facing weekly chart). */
export const WEEK_DAY_LABELS_ES: readonly string[] = [
  'lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom',
];
