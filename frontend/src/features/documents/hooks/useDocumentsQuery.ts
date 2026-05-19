'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CONFIDENCE_REVIEW_THRESHOLD } from '../utils/constants';
import type {
  DocumentFilters,
  ListSortField,
  ListSortOrder,
} from '../types/document.types';
import type { DisplayStatus } from '../utils/getDisplayStatus';

const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 25;
export const LIMIT_OPTIONS = [10, 25, 50, 100] as const;
export type LimitOption = (typeof LIMIT_OPTIONS)[number];

const VALID_SORT: ListSortField[] = ['createdAt', 'confidence', 'originalName'];
const VALID_ORDER: ListSortOrder[] = ['asc', 'desc'];

export interface DocumentsQueryState {
  type: string | null;
  /** Estado visible (incluye "review" como bucket derivado). */
  status: DisplayStatus | null;
  personId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
  search: string;
  page: number;
  limit: LimitOption;
  sort: ListSortField;
  order: ListSortOrder;
}

export interface DocumentsQueryUpdates {
  type?: string | null;
  status?: DisplayStatus | null;
  personId?: string | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  search?: string;
  page?: number;
  limit?: LimitOption;
  sort?: ListSortField;
  order?: ListSortOrder;
}

/**
 * Hook de URL state para el listado. Lee y escribe ?type=&status=&...&page=
 * usando useSearchParams + router.replace. Acepta `DisplayStatus` (incluye
 * "review") y traduce a los params reales del backend en `toApiFilters`.
 *
 * Reglas:
 * - Cualquier cambio que no sea page/limit/sort/order resetea page a 1.
 * - El listado nunca pasa por `unassigned`; usamos personId opcional.
 */
export function useDocumentsQuery() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state: DocumentsQueryState = useMemo(() => {
    const sortRaw = searchParams.get('sort');
    const orderRaw = searchParams.get('order');
    const statusRaw = searchParams.get('status');
    const limitRaw = parseInt(searchParams.get('limit') ?? '', 10);
    const pageRaw = parseInt(searchParams.get('page') ?? '', 10);

    return {
      type: searchParams.get('type'),
      status: isDisplayStatus(statusRaw) ? statusRaw : null,
      personId: searchParams.get('personId'),
      dateFrom: searchParams.get('dateFrom'),
      dateTo: searchParams.get('dateTo'),
      search: searchParams.get('search') ?? '',
      page: Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : DEFAULT_PAGE,
      limit: (LIMIT_OPTIONS as readonly number[]).includes(limitRaw)
        ? (limitRaw as LimitOption)
        : DEFAULT_LIMIT,
      sort: (VALID_SORT as string[]).includes(sortRaw ?? '')
        ? (sortRaw as ListSortField)
        : 'createdAt',
      order: (VALID_ORDER as string[]).includes(orderRaw ?? '')
        ? (orderRaw as ListSortOrder)
        : 'desc',
    };
  }, [searchParams]);

  const update = useCallback(
    (updates: DocumentsQueryUpdates) => {
      const params = new URLSearchParams(searchParams.toString());

      const resetsPage = (
        ['type', 'status', 'personId', 'dateFrom', 'dateTo', 'search', 'limit'] as const
      ).some((key) => key in updates);

      const setParam = (key: string, value: string | number | null | undefined) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      };

      if ('type' in updates) setParam('type', updates.type ?? null);
      if ('status' in updates) setParam('status', updates.status ?? null);
      if ('personId' in updates) setParam('personId', updates.personId ?? null);
      if ('dateFrom' in updates) setParam('dateFrom', updates.dateFrom ?? null);
      if ('dateTo' in updates) setParam('dateTo', updates.dateTo ?? null);
      if ('search' in updates) setParam('search', updates.search ?? '');
      if ('sort' in updates) setParam('sort', updates.sort ?? null);
      if ('order' in updates) setParam('order', updates.order ?? null);
      if ('limit' in updates) setParam('limit', updates.limit ?? null);

      if ('page' in updates && !resetsPage) {
        setParam('page', updates.page ?? null);
      } else if (resetsPage) {
        params.delete('page');
      }

      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return { state, update };
}

/**
 * Traduce el state de UI (con "review" como bucket derivado) a los
 * filtros que el backend entiende: status=completed&confidenceMax=0.85
 * cuando el usuario pide "Revisión".
 */
export function toApiFilters(state: DocumentsQueryState): DocumentFilters {
  const filters: DocumentFilters = {
    type: state.type ?? undefined,
    personId: state.personId ?? undefined,
    dateFrom: state.dateFrom ?? undefined,
    dateTo: state.dateTo ?? undefined,
    search: state.search.trim() || undefined,
    page: state.page,
    limit: state.limit,
    sort: state.sort,
    order: state.order,
  };

  if (state.status === 'review') {
    filters.status = 'completed';
    filters.confidenceMax = CONFIDENCE_REVIEW_THRESHOLD;
  } else if (state.status === 'completed') {
    filters.status = 'completed';
    filters.confidenceMin = CONFIDENCE_REVIEW_THRESHOLD;
  } else if (state.status === 'pending') {
    filters.status = 'pending';
  } else if (state.status === 'error') {
    filters.status = 'failed';
  }

  return filters;
}

function isDisplayStatus(value: string | null): value is DisplayStatus {
  return value === 'completed' || value === 'pending' || value === 'review' || value === 'error';
}
