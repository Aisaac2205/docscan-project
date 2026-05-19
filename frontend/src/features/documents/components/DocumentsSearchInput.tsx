'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { cn } from '@/shared/lib/cn';

interface DocumentsSearchInputProps {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Input controlado de búsqueda. Mantiene un buffer local para escritura
 * fluida y propaga al caller con debounce 300ms. El caller (URL state)
 * recibe el valor "estabilizado", no cada keystroke.
 */
export function DocumentsSearchInput({
  value,
  onChange,
  placeholder = 'Buscar por nombre o contenido…',
  className,
}: DocumentsSearchInputProps) {
  const [local, setLocal] = useState(value);
  const debounced = useDebouncedValue(local, 300);

  // Sync hacia arriba cuando el valor debounceado cambia.
  useEffect(() => {
    if (debounced !== value) onChange(debounced);
  }, [debounced, onChange, value]);

  // Sync hacia abajo cuando el caller resetea (ej: clear de filtros).
  useEffect(() => {
    if (value !== local && value !== debounced) setLocal(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={cn('relative w-full md:w-80', className)}>
      <Search
        width={16}
        height={16}
        aria-hidden="true"
        className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none"
      />
      <input
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        placeholder={placeholder}
        aria-label="Buscar documentos"
        className={cn(
          'h-9 w-full rounded-md border border-border bg-surface-card pl-9 pr-9',
          'text-body-sm text-fg-primary placeholder:text-fg-tertiary',
          'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]',
        )}
      />
      {local.length > 0 && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => setLocal('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-6 w-6 rounded-sm text-fg-tertiary hover:text-fg-primary"
        >
          <X width={14} height={14} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
