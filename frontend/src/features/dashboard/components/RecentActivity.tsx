'use client';

import React from 'react';
import Link from 'next/link';
import type { ActivityItem, ActivityType } from '../api/dashboardApi';

interface RecentActivityProps {
  items: ActivityItem[];
  loading?: boolean;
}

const dotByType: Record<ActivityType, string> = {
  document_processed: 'bg-stone-500',
  document_pending: 'bg-stone-300',
  person_created: 'bg-stone-700',
  evaluation_generated: 'bg-stone-900',
};

function formatRelative(isoDate: string): string {
  const then = new Date(isoDate).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'hace instantes';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Date(isoDate).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
  });
}

export function RecentActivity({ items, loading = false }: RecentActivityProps) {
  return (
    <section
      aria-labelledby="recent-activity-heading"
      className="bg-white border border-stone-200 rounded-xl p-4 md:p-5"
    >
      <h2
        id="recent-activity-heading"
        className="text-sm md:text-base font-semibold text-stone-800 mb-3"
      >
        Actividad reciente
      </h2>

      {loading ? (
        <ul className="space-y-3" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-stone-200" aria-hidden="true" />
              <span className="h-3 flex-1 rounded bg-stone-100 animate-pulse" aria-hidden="true" />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className="text-sm text-stone-400">
          Todavía no hay actividad. Subí un documento para empezar.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${dotByType[item.type]}`}
              />
              <div className="min-w-0 flex-1">
                <Link
                  href={item.link ?? `/documents/${item.id}`}
                  className="text-sm text-stone-800 font-medium hover:text-stone-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
                >
                  {item.title}
                </Link>
                <p className="text-xs text-stone-500 mt-0.5">
                  {item.detail}
                  <span className="mx-2 text-stone-300" aria-hidden="true">·</span>
                  <time dateTime={item.occurredAt}>{formatRelative(item.occurredAt)}</time>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
