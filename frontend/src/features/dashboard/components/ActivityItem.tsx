'use client';

import { Badge } from '@/shared/components/ui';
import Link from 'next/link';
import type { ActivityEvent, ActivityType } from '../api/dashboardApi';

interface ActivityItemProps {
  readonly item: ActivityEvent;
}

// ---------------------------------------------------------------------------
// Avatar with initials
// ---------------------------------------------------------------------------

interface UserAvatarProps {
  /** Explicit initials from backend (e.g. "IS"). Takes priority over title fallback. */
  readonly userInitials?: string;
  /** Event title used as fallback source for initials when userInitials is absent. */
  readonly title: string;
}

function UserAvatar({ userInitials, title }: UserAvatarProps) {
  // Prefer backend-provided initials; derive from title as guaranteed fallback.
  // title is always a non-empty string (document filename or event name),
  // so this can never produce an empty string or "?".
  const raw = userInitials ?? title;
  const display = raw.trim().slice(0, 2).toUpperCase();
  return (
    <div
      aria-hidden="true"
      className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
      style={{
        backgroundColor: 'var(--color-info-bg)',
        color: 'var(--color-info-fg)',
      }}
    >
      <span className="text-overline font-medium">
        {display}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Relative timestamp
// ---------------------------------------------------------------------------

function formatRelative(isoDate: string): string {
  const diffMs = Math.max(0, Date.now() - new Date(isoDate).getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return 'hace instantes';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} d`;
  return new Intl.DateTimeFormat('es-GT', { day: '2-digit', month: 'short' }).format(
    new Date(isoDate)
  );
}

// ---------------------------------------------------------------------------
// Status badge per activity type
// ---------------------------------------------------------------------------

const statusByType: Record<
  ActivityType,
  { variant: 'success' | 'warning' | 'danger' | 'default'; label: string }
> = {
  document_processed:    { variant: 'success', label: 'Procesado' },
  document_pending:      { variant: 'warning', label: 'Pendiente' },
  person_created:        { variant: 'default', label: 'Registrado' },
  evaluation_generated:  { variant: 'default', label: 'Evaluado' },
};

// ---------------------------------------------------------------------------
// ActivityItem
// ---------------------------------------------------------------------------

/**
 * ActivityItem — one row of the activity feed.
 * Layout: [avatar] [filename · type  (timestamp)]  [status badge]
 */
export function ActivityItem({ item }: ActivityItemProps) {
  const status = statusByType[item.type];

  return (
    <li className="flex items-center gap-3 py-2.5 border-b border-border-subtle last:border-0">
      {/* Avatar */}
      <UserAvatar userInitials={item.userInitials} title={item.title} />

      {/* Main content */}
      <div className="min-w-0 flex-1">
        <Link
          href={item.link ?? `/documents/${item.id}`}
          className="text-body-sm text-fg-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm truncate block"
        >
          {item.title}
        </Link>
        <p className="text-caption text-fg-secondary mt-0.5 truncate">
          {item.detail}
          <span className="mx-1.5" aria-hidden="true">·</span>
          <time dateTime={item.occurredAt}>
            {formatRelative(item.occurredAt)}
          </time>
        </p>
      </div>

      {/* Status badge */}
      <Badge variant={status.variant} size="sm" className="flex-shrink-0">
        {status.label}
      </Badge>
    </li>
  );
}
