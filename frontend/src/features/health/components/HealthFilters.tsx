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
            className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 ${
              isActive
                ? 'bg-stone-900 text-white border-stone-900'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400 hover:text-stone-900'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
