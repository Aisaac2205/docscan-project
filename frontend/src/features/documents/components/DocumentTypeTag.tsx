import { cn } from '@/shared/lib/cn';
import { getDocumentTypeShort } from '../utils/documentTypes';

interface DocumentTypeTagProps {
  type: string | null | undefined;
  className?: string;
}

/**
 * Tag outline neutral. CERO color semántico: la distinción entre tipos
 * vive en el texto, no en el color. Borde --color-border-subtle, texto
 * --color-fg-secondary. Tonos uniformes.
 */
export function DocumentTypeTag({ type, className }: DocumentTypeTagProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center h-6 px-2 rounded-md',
        'border border-border-subtle bg-transparent',
        'text-caption text-fg-secondary whitespace-nowrap',
        className,
      )}
    >
      {getDocumentTypeShort(type)}
    </span>
  );
}
