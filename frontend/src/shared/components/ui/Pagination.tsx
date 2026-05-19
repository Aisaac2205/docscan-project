'use client';

import { type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface PaginationProps {
  page: number;
  pages: number;
  onPageChange: (next: number) => void;
  /** ARIA label del nav. Default "Paginación". */
  ariaLabel?: string;
  /**
   * Cuántos vecinos del page actual mostrar a cada lado.
   * Default 1 → 1 .. P-1 P P+1 .. N
   */
  siblings?: number;
  className?: string;
}

const PAGE_BUTTON_BASE =
  'inline-flex items-center justify-center min-w-9 h-9 px-2 rounded-md text-body-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]';

/**
 * Paginación numérica. Calcula la ventana de páginas mostrando: primera,
 * última, el page actual y `siblings` vecinos a cada lado, con ellipses
 * entre saltos. Mantenido simple — sin keyboard navigation custom porque
 * los botones son focusables nativos.
 */
export function Pagination({
  page,
  pages,
  onPageChange,
  ariaLabel = 'Paginación',
  siblings = 1,
  className,
}: PaginationProps) {
  if (pages <= 1) return null;

  const window = buildPaginationWindow(page, pages, siblings);

  const handle = (next: number) => {
    if (next < 1 || next > pages || next === page) return;
    onPageChange(next);
  };

  return (
    <nav aria-label={ariaLabel} className={cn('flex items-center gap-1', className)}>
      <PageNavButton
        disabled={page === 1}
        onClick={() => handle(page - 1)}
        ariaLabel="Página anterior"
      >
        ‹
      </PageNavButton>

      {window.map((item, idx) =>
        item === 'ellipsis' ? (
          <span
            key={`gap-${idx}`}
            className="px-1 text-fg-tertiary text-body-sm"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            onClick={() => handle(item)}
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              PAGE_BUTTON_BASE,
              item === page
                ? 'bg-fg-primary text-[var(--color-fg-inverse)] border border-fg-primary'
                : 'text-fg-secondary border border-border hover:bg-surface-sunken',
            )}
          >
            {item}
          </button>
        ),
      )}

      <PageNavButton
        disabled={page === pages}
        onClick={() => handle(page + 1)}
        ariaLabel="Página siguiente"
      >
        ›
      </PageNavButton>
    </nav>
  );
}

function PageNavButton({
  children,
  disabled,
  onClick,
  ariaLabel,
}: {
  children: ReactNode;
  disabled: boolean;
  onClick: () => void;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      className={cn(
        PAGE_BUTTON_BASE,
        'text-fg-secondary border border-border',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'hover:bg-surface-sunken',
      )}
    >
      {children}
    </button>
  );
}

type PaginationItem = number | 'ellipsis';

function buildPaginationWindow(
  page: number,
  pages: number,
  siblings: number,
): PaginationItem[] {
  if (pages <= 7 + siblings * 2) {
    return Array.from({ length: pages }, (_, i) => i + 1);
  }

  const items: PaginationItem[] = [];
  const start = Math.max(2, page - siblings);
  const end = Math.min(pages - 1, page + siblings);

  items.push(1);
  if (start > 2) items.push('ellipsis');
  for (let i = start; i <= end; i += 1) items.push(i);
  if (end < pages - 1) items.push('ellipsis');
  items.push(pages);

  return items;
}
