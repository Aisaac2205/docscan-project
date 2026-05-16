'use client';

import { useMemo } from 'react';
import { Heading } from '@/shared/components/Layout';
import { SystemStatusBadge } from './SystemStatusBadge';

interface DashboardGreetingProps {
  readonly firstName: string | null;
  readonly userLoading?: boolean;
  readonly ocrEngineOnline?: boolean;
  readonly activeWorkers?: number;
}

/**
 * Formats today's date in sentence-case Spanish: "Martes, 13 de mayo".
 * Intl.DateTimeFormat with 'es-GT' already produces lowercase weekday and month;
 * we capitalize only the very first character here in JS rather than via CSS
 * (which would capitalize every word).
 */
function useFormattedDate(): string {
  return useMemo(() => {
    const raw = new Intl.DateTimeFormat('es-GT', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());
    // sentence-case: capitalize first char only
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);
}

/**
 * DashboardGreeting — greeting header with user name, formatted date in Spanish,
 * and inline system status badges.
 *
 * Intentionally has no "Nuevo escaneo" button — that belongs to /scan.
 */
export function DashboardGreeting({
  firstName,
  userLoading = false,
  ocrEngineOnline,
  activeWorkers,
}: DashboardGreetingProps) {
  const formattedDate = useFormattedDate();

  const hasSystemStatus =
    ocrEngineOnline !== undefined && activeWorkers !== undefined;

  const showSkeleton = userLoading || !firstName;

  return (
    <div className="flex items-start justify-between gap-4 mb-6 md:mb-8">
      {/* Left: greeting + date */}
      <div className="min-w-0">
        <Heading level={1} className="text-fg-primary truncate">
          {showSkeleton ? (
            <span
              aria-label="Cargando saludo"
              className="inline-block h-[1em] w-48 align-middle rounded-md bg-surface-sunken animate-pulse"
            />
          ) : (
            <>Hola, {firstName} 👋</>
          )}
        </Heading>
        <p className="text-body-sm text-fg-secondary mt-0.5">
          {formattedDate}
        </p>
      </div>

      {/* Right: system status — only rendered when data is available */}
      {hasSystemStatus && (
        <SystemStatusBadge
          ocrEngineOnline={ocrEngineOnline!}
          activeWorkers={activeWorkers!}
        />
      )}
    </div>
  );
}
