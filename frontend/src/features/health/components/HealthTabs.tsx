'use client';

import type { HealthStatus } from '../types';

export type HealthFilterValue = HealthStatus | 'all';

export interface HealthTabCounts {
  all: number;
  pending: number;
  validated: number;
  registered: number;
  rejected: number;
}

interface HealthTabsProps {
  active: HealthFilterValue;
  onChange: (value: HealthFilterValue) => void;
  counts: HealthTabCounts;
}

const TABS: { value: HealthFilterValue; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'validated', label: 'Validadas' },
  { value: 'registered', label: 'Registradas en nómina' },
  { value: 'rejected', label: 'Rechazadas' },
];

export function HealthTabs({ active, onChange, counts }: HealthTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar constancias por estado"
      className="flex gap-1 mb-4 border-b border-border overflow-x-auto"
    >
      {TABS.map(({ value, label }) => {
        const isActive = active === value;
        const count = counts[value];
        return (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(value)}
            className={`shrink-0 px-3 py-2 text-button-sm rounded-t-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] ${
              isActive
                ? 'text-fg-primary border-b-2 border-fg-primary -mb-px'
                : 'text-fg-secondary hover:text-fg-primary'
            }`}
          >
            {label}
            <span className="ml-1.5 text-caption text-fg-tertiary">({count})</span>
          </button>
        );
      })}
    </div>
  );
}
