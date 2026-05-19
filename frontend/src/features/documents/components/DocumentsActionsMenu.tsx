'use client';

import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';

interface DocumentsActionsMenuProps {
  documentName: string;
  onView: () => void;
  onDownload: () => void;
  onReassign: () => void;
  onDelete: () => void;
  /** Cuando está presente, habilita "Extraer datos" (filas pending/error). */
  onExtract?: () => void;
  extracting?: boolean;
}

/**
 * Dropdown único de acciones por fila. El trigger es un botón ícono que
 * detiene la propagación para no abrir el detalle al clickearlo.
 */
export function DocumentsActionsMenu({
  documentName,
  onView,
  onDownload,
  onReassign,
  onDelete,
  onExtract,
  extracting = false,
}: DocumentsActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label={`Acciones para ${documentName}`}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          className={cn(
            'inline-flex items-center justify-center h-8 w-8 rounded-md',
            'text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken',
            'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]',
          )}
        >
          <MoreHorizontal width={16} height={16} aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onSelect={onView}>Ver</DropdownMenuItem>
        {onExtract && (
          <DropdownMenuItem
            onSelect={onExtract}
            disabled={extracting}
          >
            {extracting ? 'Extrayendo…' : 'Extraer datos'}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onDownload}>Descargar</DropdownMenuItem>
        <DropdownMenuItem onSelect={onReassign}>Reasignar persona</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={onDelete}>
          Eliminar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
