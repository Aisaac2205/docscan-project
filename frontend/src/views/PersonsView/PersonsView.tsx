'use client';

import { useState } from 'react';
import { usePersons } from '@/features/persons/hooks/usePersons';
import { PersonCard } from '@/features/persons/components/PersonCard';
import { PersonForm } from '@/features/persons/components/PersonForm';
import type { PersonStatus } from '@/features/persons/types';

const STATUS_FILTERS: { value: PersonStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'hired', label: 'Contratados' },
  { value: 'archived', label: 'Archivados' },
  { value: 'rejected', label: 'Descartados' },
];

export function PersonsView() {
  const [statusFilter, setStatusFilter] = useState<PersonStatus | 'all'>('active');
  const [showForm, setShowForm] = useState(false);

  const { persons, loading, error, query, setQuery, create } = usePersons({
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const inputClass =
    'w-full md:w-80 h-10 px-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]';

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 md:mb-7">
        <div>
          <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">RRHH</p>
          <h1 className="text-h1">Personas</h1>
          <p className="text-body-sm text-fg-secondary mt-1">
            Gestioná candidatos y empleados con sus datos extraídos.
          </p>
        </div>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="self-start md:self-auto px-4 py-2 rounded-md text-button bg-fg-primary text-fg-inverse hover:opacity-90 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
        >
          {showForm ? 'Ocultar formulario' : 'Nueva persona'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <section
          aria-label="Nueva persona"
          className="bg-surface-card border border-border rounded-md p-4 md:p-5 mb-5"
        >
          <PersonForm
            submitLabel="Crear persona"
            onSubmit={async (input) => {
              await create(input);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </section>
      )}

      {/* Filters + search */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-5">
        <input
          type="search"
          aria-label="Buscar persona"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nombre, CUI o correo..."
          className={inputClass}
        />
        <div role="group" aria-label="Filtrar por estado" className="flex flex-wrap gap-2">
          {STATUS_FILTERS.map(({ value, label }) => {
            const active = value === statusFilter;
            return (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                aria-pressed={active}
                className={`px-3 py-1.5 rounded-full text-button-sm border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] ${
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

      {/* Error */}
      {error && (
        <div role="alert" className="mb-4 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
          {error}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div aria-busy="true" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-28 rounded-md bg-surface-sunken animate-pulse" />
          ))}
        </div>
      ) : persons.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-body-sm text-fg-secondary font-medium mb-1">Aún no hay personas registradas.</p>
          <p className="text-caption text-fg-tertiary">
            Creá la primera para empezar a asociar documentos extraídos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {persons.map((p) => <PersonCard key={p.id} person={p} />)}
        </div>
      )}
    </div>
  );
}
