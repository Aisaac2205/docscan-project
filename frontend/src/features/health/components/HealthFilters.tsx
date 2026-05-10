'use client';

import type { HealthStatus } from '../types';

type FilterValue = HealthStatus | 'all';

interface HealthFiltersProps {
  active: FilterValue;
  onChange: (filter: FilterValue) => void;
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'validated', label: 'Validadas' },
  { value: 'registered', label: 'Registradas en nómina' },
  { value: 'rejected', label: 'Rechazadas' },
];

export function HealthFilters({ active, onChange }: HealthFiltersProps) {
  return (
    <div role="group" aria-label="Filtrar registros" className="flex flex-wrap gap-2 mb-5">
      {FILTERS.map(({ value, label }) => {
        const isActive = active === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            aria-pressed={isActive}
            className={`px-3 py-1.5 rounded-full text-button-sm border transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] ${
              isActive
                ? 'bg-fg-primary text-fg-inverse border-fg-primary'
                : 'bg-surface-card text-fg-secondary border-border hover:border-border-strong hover:text-fg-primary'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
