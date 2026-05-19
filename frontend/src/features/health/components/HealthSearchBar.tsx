'use client';

import { Search } from 'lucide-react';

interface HealthSearchBarProps {
  value: string;
  onChange: (next: string) => void;
  total: number;
  page: number;
  pageCount: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}

export function HealthSearchBar({
  value,
  onChange,
  total,
  page,
  pageCount,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: HealthSearchBarProps) {
  const navBtn =
    'inline-flex items-center justify-center h-8 px-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-secondary ' +
    'hover:bg-surface-sunken hover:border-border-strong hover:text-fg-primary ' +
    'disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]';

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-3">
      <div className="relative w-full md:w-80">
        <Search
          width={14}
          height={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary"
          aria-hidden="true"
        />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Buscar por paciente, médico, diagnóstico…"
          aria-label="Buscar constancias"
          className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
        />
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <span className="text-caption text-fg-tertiary" aria-live="polite">
          {total === 0
            ? 'Sin resultados'
            : `${total} ${total === 1 ? 'constancia' : 'constancias'}`}
        </span>
        <div className="flex items-center gap-1.5">
          <button type="button" className={navBtn} onClick={onPrev} disabled={!canPrev}>
            Anterior
          </button>
          <span className="text-caption text-fg-tertiary px-2 whitespace-nowrap">
            Página {page} de {pageCount}
          </span>
          <button type="button" className={navBtn} onClick={onNext} disabled={!canNext}>
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
