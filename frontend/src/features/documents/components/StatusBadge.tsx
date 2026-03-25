import type { Document } from '../types/document.types';

const STATUS_MAP: Record<Document['status'], { label: string; className: string }> = {
  pending:    { label: 'Pendiente',  className: 'bg-stone-100 text-stone-500' },
  processing: { label: 'Procesando', className: 'bg-stone-200 text-stone-700' },
  completed:  { label: 'Completado', className: 'bg-stone-900 text-white' },
  failed:     { label: 'Fallido',    className: 'bg-red-50 text-red-600' },
};

export function StatusBadge({ status }: { status: Document['status'] }) {
  const { label, className } = STATUS_MAP[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${className}`}>
      {label}
    </span>
  );
}
