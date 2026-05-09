'use client';

import Link from 'next/link';
import type { Person } from '../types';
import { PersonStatusBadge, PersonRoleBadge } from './PersonStatusBadge';

interface PersonCardProps {
  person: Person;
}

export function PersonCard({ person }: PersonCardProps) {
  return (
    <Link
      href={`/persons/${person.id}`}
      className="block bg-white border border-stone-200 rounded-xl p-4 md:p-5 hover:border-stone-400 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-stone-900 leading-tight truncate">
            {person.fullName}
          </h3>
          {person.cui && (
            <p className="text-xs text-stone-500 mt-0.5">
              CUI: <span className="font-mono">{person.cui}</span>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1 flex-shrink-0 items-end">
          <PersonRoleBadge role={person.role} />
          <PersonStatusBadge status={person.status} />
        </div>
      </div>
      {(person.email || person.phone) && (
        <div className="text-xs text-stone-500 space-y-0.5 mt-3 pt-3 border-t border-stone-100">
          {person.email && <p className="truncate">{person.email}</p>}
          {person.phone && <p>{person.phone}</p>}
        </div>
      )}
    </Link>
  );
}
