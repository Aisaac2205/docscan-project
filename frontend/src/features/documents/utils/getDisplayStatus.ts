import type { Document } from '../types/document.types';
import { CONFIDENCE_REVIEW_THRESHOLD } from './constants';

/**
 * Estado visible del documento. "review" se deriva acá: cuando el backend
 * dice `completed` pero la confianza no alcanza el umbral, la UI lo
 * presenta como "Revisión".
 */
export type DisplayStatus = 'completed' | 'pending' | 'review' | 'error';

export const DISPLAY_STATUS_LABEL: Record<DisplayStatus, string> = {
  completed: 'Completado',
  pending: 'Pendiente',
  review: 'Revisión',
  error: 'Error',
};

export function getDisplayStatus(doc: Pick<Document, 'status' | 'confidence'>): DisplayStatus {
  switch (doc.status) {
    case 'completed':
      if (doc.confidence === null || doc.confidence === undefined) return 'review';
      return doc.confidence < CONFIDENCE_REVIEW_THRESHOLD ? 'review' : 'completed';
    case 'failed':
      return 'error';
    case 'processing':
    case 'pending':
    default:
      return 'pending';
  }
}
