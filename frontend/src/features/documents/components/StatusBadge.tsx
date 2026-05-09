import type { Document } from '../types/document.types';
import { Badge, type BadgeVariant } from '@/shared/components/ui';

const STATUS_MAP: Record<Document['status'], { label: string; variant: BadgeVariant }> = {
  pending:    { label: 'Pendiente',  variant: 'default' },
  processing: { label: 'Procesando', variant: 'info' },
  completed:  { label: 'Completado', variant: 'success' },
  failed:     { label: 'Fallido',    variant: 'danger' },
};

export function StatusBadge({ status }: { status: Document['status'] }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}
