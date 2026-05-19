import { Avatar } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';
import { getInitials } from '../utils/formatters';

interface PersonCellProps {
  personName: string | null | undefined;
  className?: string;
}

/**
 * Celda de persona: avatar con iniciales sobre fondo neutral + nombre.
 * Si no hay persona asignada, muestra "Sin asignar" en --color-fg-tertiary.
 */
export function PersonCell({ personName, className }: PersonCellProps) {
  if (!personName) {
    return (
      <span className={cn('text-body-sm text-fg-tertiary italic', className)}>
        Sin asignar
      </span>
    );
  }

  return (
    <div className={cn('flex items-center gap-2 min-w-0', className)}>
      <Avatar size="sm" fallback={getInitials(personName)} />
      <span className="truncate text-body-sm text-fg-primary" title={personName}>
        {personName}
      </span>
    </div>
  );
}
