// ---------------------------------------------------------------------------
// Documents — constantes canónicas del módulo. Única fuente de verdad para
// estados, umbral de revisión y tipos OCR conocidos. Otros módulos
// (dashboard) reexportan/consumen desde acá.
// ---------------------------------------------------------------------------

/** Valores de `Document.status` usados en todo el codebase. */
export const DOCUMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type DocumentStatusValue = (typeof DOCUMENT_STATUS)[keyof typeof DOCUMENT_STATUS];

/**
 * Umbral de confianza (fracción 0–1) bajo el cual un documento `completed`
 * se considera "Revisión". Es la única constante para la regla — la
 * consumen: stats.needsReview (SQL), filtro implícito "Revisión" del
 * listado, y los helpers frontend getDisplayStatus / getConfidenceLevel.
 *
 * 0.85 = 85% de confianza.
 */
export const CONFIDENCE_REVIEW_THRESHOLD = 0.85;

/** Tipos OCR catalogables (alineados con `ExtractionMode`). */
export type DocumentTypeBucket =
  | 'cv'
  | 'id_card'
  | 'fiscal_social'
  | 'medical_cert'
  | 'background_check';

export const ALL_TYPE_BUCKETS: readonly DocumentTypeBucket[] = [
  'cv',
  'id_card',
  'fiscal_social',
  'medical_cert',
  'background_check',
];

/**
 * Tipos UI aceptados por el filtro del listado (incluye `general`, que el
 * OCR usa como fallback cuando no clasifica). NO incluye `custom` ni el
 * placeholder histórico `"document"`.
 */
export const ALL_LIST_FILTER_TYPES: readonly string[] = [
  ...ALL_TYPE_BUCKETS,
  'general',
];

/** Map identidad de `Document.documentType` → bucket del chart. */
export const DOCUMENT_TYPE_BUCKET_MAP: Readonly<Record<string, DocumentTypeBucket>> = {
  cv: 'cv',
  id_card: 'id_card',
  fiscal_social: 'fiscal_social',
  medical_cert: 'medical_cert',
  background_check: 'background_check',
};
