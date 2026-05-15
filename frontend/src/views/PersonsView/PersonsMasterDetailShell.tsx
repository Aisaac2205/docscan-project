'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

interface PersonsMasterDetailShellProps {
  list: ReactNode;
  detail: ReactNode;
  /** When true, the right pane is hidden on mobile (used when nothing is selected). */
  detailHiddenOnMobile?: boolean;
}

/**
 * Two-column layout on md+ (list ~360px, detail flex). One column on mobile.
 *
 * The shell does NOT decide which pane to show on mobile — the parent controls
 * that via `detailHiddenOnMobile`. Mobile selection navigates to the dedicated
 * /persons/[id] page (handled by the parent).
 */
export function PersonsMasterDetailShell({
  list,
  detail,
  detailHiddenOnMobile = true,
}: PersonsMasterDetailShellProps) {
  const isDesktop = useIsDesktop();

  return (
    <div className="grid grid-cols-1 md:grid-cols-[360px_1fr] gap-4 h-[calc(100vh-var(--header-height)-9rem)] min-h-[32rem]">
      <div className="min-h-0 h-full">{list}</div>
      {(isDesktop || !detailHiddenOnMobile) && (
        <div className="min-h-0 h-full overflow-y-auto bg-surface-card border border-border rounded-md p-4 md:p-5">
          {detail}
        </div>
      )}
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
