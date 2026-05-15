'use client';

import { Badge } from '@/shared/components/ui';

interface SystemStatusBadgeProps {
  readonly ocrEngineOnline: boolean;
  readonly activeWorkers: number;
}

/**
 * SystemStatusBadge — inline status indicators for the greeting header.
 * Renders two compact badges: OCR engine online/offline + active workers.
 * No card, no separate section — meant to sit inline at the right of the header row.
 */
export function SystemStatusBadge({
  ocrEngineOnline,
  activeWorkers,
}: SystemStatusBadgeProps) {
  return (
    <div className="flex items-center gap-2 flex-shrink-0" role="status" aria-label="Estado del sistema">
      <Badge variant={ocrEngineOnline ? 'success' : 'danger'} size="sm">
        <span
          aria-hidden="true"
          className={[
            'inline-block w-1.5 h-1.5 rounded-full',
            ocrEngineOnline ? 'bg-success-fg' : 'bg-danger-fg',
          ].join(' ')}
        />
        OCR {ocrEngineOnline ? 'online' : 'offline'}
      </Badge>

      <Badge variant="default" size="sm">
        {activeWorkers} worker{activeWorkers !== 1 ? 's' : ''}
      </Badge>
    </div>
  );
}
