'use client';

import type { ReactNode } from 'react';
import { useDocumentsMasterDetail } from '@/features/documents/hooks/useDocumentsMasterDetail';

interface DocumentsMasterDetailShellProps {
  list: ReactNode;
  detail: ReactNode | null;
}

/**
 * Layout master-detail. Desktop (md+): grid [1fr_560px], panel derecho
 * persistente con scroll independiente. Mobile (<768px): solo lista,
 * la selección navega a /documents/[id].
 *
 * El panel derecho se renderiza solo cuando hay selección Y hay detail
 * que mostrar. Sin selección, el espacio queda colapsado a 1-col.
 */
export function DocumentsMasterDetailShell({
  list,
  detail,
}: DocumentsMasterDetailShellProps) {
  const { selectedId, isDesktop } = useDocumentsMasterDetail();
  const showDetail = isDesktop && selectedId !== null && detail !== null;

  return (
    <div
      className={
        showDetail
          ? 'grid grid-cols-1 md:grid-cols-[1fr_560px] gap-4'
          : 'grid grid-cols-1 gap-4'
      }
    >
      <div className="min-w-0">{list}</div>
      {showDetail && (
        <div className="min-w-0 bg-surface-card border border-border rounded-md overflow-hidden">
          {detail}
        </div>
      )}
    </div>
  );
}
