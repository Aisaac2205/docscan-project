'use client';

import { User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import type { PersonWithCompleteness } from '../types';
import { PersonStatusBadge } from './PersonStatusBadge';
import { PersonCompletenessRing } from './PersonCompletenessRing';

interface PersonListItemProps {
  person: PersonWithCompleteness;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function PersonListItem({ person, selected, onSelect }: PersonListItemProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={() => onSelect(person.id)}
      className={cn(
        'group w-full text-left rounded-md border transition-all',
        'px-3 py-2.5 flex items-center gap-3',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
        selected
          ? 'bg-surface-sunken border-l-4 border-l-fg-primary border-y-border border-r-border'
          : 'bg-surface-card border-border hover:border-border-strong',
      )}
    >
      <span
        aria-hidden="true"
        className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-surface-sunken text-fg-tertiary"
      >
        <User width={18} height={18} strokeWidth={1.5} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-body-sm text-fg-primary font-medium truncate">{person.fullName}</p>
        {person.cui ? (
          <p className="text-caption text-fg-tertiary font-mono truncate">{person.cui}</p>
        ) : person.email ? (
          <p className="text-caption text-fg-tertiary truncate">{person.email}</p>
        ) : null}
      </div>

      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
        <PersonStatusBadge status={person.status} />
        {person.completeness && (
          <PersonCompletenessRing
            done={person.completeness.done}
            total={person.completeness.total}
            size={28}
            strokeWidth={3}
            showLabel={false}
          />
        )}
      </div>
    </button>
  );
}
