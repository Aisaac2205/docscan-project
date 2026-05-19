import { CONFIDENCE_REVIEW_THRESHOLD } from './constants';

/**
 * Niveles semánticos de confianza, usados para colorear el texto en la
 * tabla y en el detalle. Los umbrales en fracción 0–1:
 *   - high     ≥ 0.95
 *   - medium   [0.85, 0.95)
 *   - low      [0, 0.85)
 *   - unknown  cuando no hay valor de confianza
 *
 * El borde "medium" coincide con CONFIDENCE_REVIEW_THRESHOLD: medium y
 * low marcan el bucket de "Revisión".
 */
export type ConfidenceLevel = 'high' | 'medium' | 'low' | 'unknown';

const HIGH_CONFIDENCE_THRESHOLD = 0.95;

export function getConfidenceLevel(confidence: number | null | undefined): ConfidenceLevel {
  if (confidence === null || confidence === undefined) return 'unknown';
  if (confidence >= HIGH_CONFIDENCE_THRESHOLD) return 'high';
  if (confidence >= CONFIDENCE_REVIEW_THRESHOLD) return 'medium';
  return 'low';
}

/** Devuelve el % redondeado a entero para mostrar. Null si no hay valor. */
export function formatConfidencePercent(confidence: number | null | undefined): string | null {
  if (confidence === null || confidence === undefined) return null;
  return `${Math.round(confidence * 100)}%`;
}
