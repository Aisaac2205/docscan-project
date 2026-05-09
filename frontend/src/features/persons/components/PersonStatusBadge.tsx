import type { PersonStatus, PersonRole } from '../types';

const STATUS_LABEL: Record<PersonStatus, string> = {
  active: 'Activo',
  hired: 'Contratado',
  archived: 'Archivado',
  rejected: 'Descartado',
};

const STATUS_WEIGHT: Record<PersonStatus, string> = {
  active: 'text-stone-700',
  hired: 'text-stone-900 font-semibold',
  archived: 'text-stone-400',
  rejected: 'text-stone-400 line-through',
};

const ROLE_LABEL: Record<PersonRole, string> = {
  candidate: 'Candidato',
  employee: 'Empleado',
};

export function PersonStatusBadge({ status }: { status: PersonStatus }) {
  return (
    <span
      className={`inline-flex items-center text-xs px-2 py-0.5 rounded-md border border-stone-200 bg-stone-50 ${STATUS_WEIGHT[status]}`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

export function PersonRoleBadge({ role }: { role: PersonRole }) {
  return (
    <span className="inline-flex items-center text-xs px-2 py-0.5 rounded-md text-stone-500 bg-stone-100">
      {ROLE_LABEL[role]}
    </span>
  );
}
