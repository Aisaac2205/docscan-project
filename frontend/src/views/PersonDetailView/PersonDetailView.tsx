'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { PersonDetailPanel } from '@/features/persons/components/PersonDetailPanel';

interface PersonDetailViewProps {
  personId: string;
}

/**
 * Standalone /persons/[id] page — wraps PersonDetailPanel with a back button
 * to the list. Used for deep links and mobile navigation (where master-detail
 * doesn't apply).
 */
export function PersonDetailView({ personId }: PersonDetailViewProps) {
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => router.push('/persons')}
        className="inline-flex items-center gap-1 text-caption text-fg-tertiary hover:text-fg-primary mb-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
      >
        <ChevronLeft width={14} height={14} aria-hidden="true" />
        Volver a Personas
      </button>

      <PersonDetailPanel personId={personId} />
    </div>
  );
}
