'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

/**
 * Master-detail con sync URL. Desktop usa ?selected=docId en la misma
 * ruta (panel persistente). Mobile navega a /documents/[id] (ruta dedicada).
 *
 * El cambio de breakpoint en runtime se detecta via matchMedia. La selección
 * NO persiste cross-page: el caller debe limpiarla cuando cambian filtros o
 * página de la tabla.
 */
export function useDocumentsMasterDetail() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isDesktop = useIsDesktop();

  const selectedId = searchParams.get('selected');

  const select = useCallback(
    (docId: string) => {
      if (!isDesktop) {
        router.push(`/documents/${docId}`);
        return;
      }
      const params = new URLSearchParams(searchParams.toString());
      params.set('selected', docId);
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [isDesktop, pathname, router, searchParams],
  );

  const deselect = useCallback(() => {
    if (!selectedId) return;
    const params = new URLSearchParams(searchParams.toString());
    params.delete('selected');
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [pathname, router, searchParams, selectedId]);

  return { selectedId, isDesktop, select, deselect };
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
