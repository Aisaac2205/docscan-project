'use client';

import Link from 'next/link';
import { Skeleton } from '@/shared/components/ui';
import { Heading } from '@/shared/components/Layout';
import { ActivityItem } from './ActivityItem';
import type { ActivityEvent } from '../api/dashboardApi';

interface ActivityFeedProps {
  readonly items: readonly ActivityEvent[];
  readonly loading?: boolean;
}

// ---------------------------------------------------------------------------
// Skeleton loading state
// ---------------------------------------------------------------------------

function ActivityFeedSkeleton() {
  return (
    <ul className="divide-y divide-border-subtle" aria-busy="true">
      {Array.from({ length: 5 }).map((_, i) => (
        <li key={i} className="flex items-center gap-3 py-2.5">
          {/* Avatar skeleton */}
          <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
          {/* Text skeleton */}
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          {/* Badge skeleton */}
          <Skeleton className="h-5 w-16 rounded-full flex-shrink-0" />
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// ActivityFeed
// ---------------------------------------------------------------------------

/**
 * ActivityFeed — last 5-8 processing events.
 * Shows avatar, filename, timestamp, and status badge per item.
 *
 * TODO: Add "Ver toda la actividad" link when the route /documents?filter=activity
 * is implemented. Expected route: /documents?view=activity
 */
export function ActivityFeed({ items, loading = false }: ActivityFeedProps) {
  return (
    <section
      aria-labelledby="activity-feed-heading"
      className="bg-surface-card border border-border rounded-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 md:px-5 border-b border-border-subtle">
        <Heading
          level={4}
          as="h2"
          id="activity-feed-heading"
          className="text-fg-primary"
        >
          Actividad reciente
        </Heading>

        {/*
         * TODO: uncomment when /documents?view=activity route is implemented.
         * Expected to show a full paginated activity log.
         *
         * <Link
         *   href="/documents?view=activity"
         *   className="text-button-sm text-fg-secondary hover:text-fg-primary font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
         * >
         *   Ver todo
         * </Link>
         */}
      </div>

      {/* Body */}
      <div className="px-4 py-1 md:px-5">
        {loading ? (
          <ActivityFeedSkeleton />
        ) : items.length === 0 ? (
          <p className="text-body-sm text-fg-tertiary py-6 text-center">
            No hay actividad reciente. Subí un documento para empezar.
          </p>
        ) : (
          <ul>
            {items.slice(0, 8).map((item) => (
              <ActivityItem key={item.id} item={item} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
