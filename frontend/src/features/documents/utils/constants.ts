/**
 * Umbral de confianza (fracción 0–1) bajo el cual un documento `completed`
 * se considera "Revisión". Misma regla que el backend
 * (`CONFIDENCE_REVIEW_THRESHOLD` en documents.constants.ts).
 *
 * Una sola constante. La consumen getDisplayStatus, getConfidenceLevel y
 * el filtro implícito de "Revisión" en el listado.
 */
export const CONFIDENCE_REVIEW_THRESHOLD = 0.85;
