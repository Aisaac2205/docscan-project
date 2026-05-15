import type { PersonStatus, PersonRole } from '../types';
import { Badge, type BadgeVariant } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

const STATUS_MAP: Record<PersonStatus, { label: string; variant: BadgeVariant; className?: string }> = {
  active:   { label: 'Activo',     variant: 'info' },
  hired:    { label: 'Contratado', variant: 'success' },
  archived: { label: 'Archivado',  variant: 'default', className: 'opacity-70' },
  rejected: { label: 'Descartado', variant: 'danger' },
};

const ROLE_LABEL: Record<PersonRole, string> = {
  candidate: 'Candidato',
  employee: 'Empleado',
};

export function PersonStatusBadge({ status }: { status: PersonStatus }) {
  const { label, variant, className } = STATUS_MAP[status];
  return <Badge variant={variant} className={cn(className)}>{label}</Badge>;
}

export function PersonRoleBadge({ role }: { role: PersonRole }) {
  return <Badge variant="default">{ROLE_LABEL[role]}</Badge>;
}
