import { Badge, type BadgeVariant } from '@/shared/components/ui';
import type { Document } from '../types/document.types';
import {
  DISPLAY_STATUS_LABEL,
  type DisplayStatus,
  getDisplayStatus,
} from '../utils/getDisplayStatus';

interface DocumentStatusBadgeProps {
  doc: Pick<Document, 'status' | 'confidence'>;
}

const STATUS_VARIANT: Record<DisplayStatus, BadgeVariant> = {
  completed: 'success',
  pending: 'warning',
  review: 'info',
  error: 'danger',
};

/**
 * Badge semántico del estado visible. El estado se deriva con
 * getDisplayStatus — completed AND confidence<0.85 → "Revisión".
 */
export function DocumentStatusBadge({ doc }: DocumentStatusBadgeProps) {
  const display = getDisplayStatus(doc);
  return <Badge variant={STATUS_VARIANT[display]}>{DISPLAY_STATUS_LABEL[display]}</Badge>;
}
