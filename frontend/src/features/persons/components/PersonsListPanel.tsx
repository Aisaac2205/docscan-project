'use client';

import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePersons } from '../hooks/usePersons';
import type { PersonStatus } from '../types';
import { PersonListItem } from './PersonListItem';

interface PersonsListPanelProps {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const STATUS_FILTERS: { value: PersonStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'hired', label: 'Contratados' },
  { value: 'archived', label: 'Archivados' },
  { value: 'rejected', label: 'Descartados' },
];

export function PersonsListPanel({ selectedId, onSelect }: PersonsListPanelProps) {
  const [statusFilter, setStatusFilter] = useState<PersonStatus | 'all'>('active');

  const { persons, total, page, pageSize, hasMore, loading, error, query, setQuery, setPage } =
    usePersons({
      status: statusFilter === 'all' ? undefined : statusFilter,
      includeCompleteness: true,
    });

  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  return (
    <aside
      aria-label="Lista de personas"
      className="flex flex-col h-full bg-surface-card border border-border rounded-md overflow-hidden"
    >
      {/* Search */}
      <div className="p-3 border-b border-border-subtle">
        <div className="relative">
          <Search
            width={14}
            height={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, CUI o correo..."
            aria-label="Buscar persona"
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
          />
        </div>
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-1.5 mt-2.5">
          {STATUS_FILTERS.map(({ value, label }) => {
            const active = value === statusFilter;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setStatusFilter(value)}
                aria-pressed={active}
                className={`px-2.5 py-1 rounded-full text-caption border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] ${
                  active
                    ? 'bg-fg-primary text-fg-inverse border-fg-primary'
                    : 'bg-surface-card text-fg-secondary border-border hover:border-border-strong'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {error && (
          <div role="alert" className="mb-2 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-caption text-danger-fg">
            {error}
          </div>
        )}

        {loading && persons.length === 0 ? (
          <div aria-busy="true" className="space-y-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-md bg-surface-sunken animate-pulse" />
            ))}
          </div>
        ) : persons.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-body-sm text-fg-secondary font-medium">Sin resultados.</p>
            <p className="text-caption text-fg-tertiary mt-1">
              Ajustá el filtro o creá una nueva persona.
            </p>
          </div>
        ) : (
          <ul role="listbox" aria-label="Personas" className="space-y-1.5">
            {persons.map((p) => (
              <li key={p.id}>
                <PersonListItem
                  person={p}
                  selected={p.id === selectedId}
                  onSelect={onSelect}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="border-t border-border-subtle p-2 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
            aria-label="Página anterior"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-caption text-fg-secondary hover:bg-surface-sunken disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            <ChevronLeft width={14} height={14} aria-hidden="true" />
            Anterior
          </button>
          <span className="text-caption text-fg-tertiary tabular-nums">
            Página {page} de {pageCount}
          </span>
          <button
            type="button"
            onClick={() => setPage(page + 1)}
            disabled={!hasMore || loading}
            aria-label="Página siguiente"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-caption text-fg-secondary hover:bg-surface-sunken disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            Siguiente
            <ChevronRight width={14} height={14} aria-hidden="true" />
          </button>
        </div>
      )}
    </aside>
  );
}

