'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface UsePersonsMasterDetailResult {
  selectedId: string | null;
  select: (id: string | null) => void;
}

/**
 * Keeps the selected person id in sync with the `?selected=...` URL param.
 * Used by the desktop master-detail layout on /persons.
 *
 * Mobile flow does NOT use this — it navigates to /persons/[id] dedicated page.
 */
export function usePersonsMasterDetail(): UsePersonsMasterDetailResult {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedId = searchParams.get('selected');

  const select = useCallback(
    (id: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (id) {
        params.set('selected', id);
      } else {
        params.delete('selected');
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { selectedId, select };
}
