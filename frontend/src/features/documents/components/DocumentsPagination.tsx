'use client';

import { Pagination, Select } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';
import type { PaginationMeta } from '../types/document.types';
import { LIMIT_OPTIONS, type LimitOption } from '../hooks/useDocumentsQuery';

interface DocumentsPaginationProps {
  pagination: PaginationMeta | null;
  limit: LimitOption;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: LimitOption) => void;
  className?: string;
}

const integerFormatter = new Intl.NumberFormat('es-GT');

export function DocumentsPagination({
  pagination,
  limit,
  onPageChange,
  onLimitChange,
  className,
}: DocumentsPaginationProps) {
  if (!pagination) return null;

  const { page, pages, total } = pagination;
  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);

  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-center md:justify-between',
        className,
      )}
    >
      <div className="flex items-center gap-3 text-body-sm text-fg-secondary">
        <span aria-live="polite">
          {total === 0
            ? 'Sin resultados'
            : `${integerFormatter.format(rangeStart)}–${integerFormatter.format(rangeEnd)} de ${integerFormatter.format(total)}`}
        </span>
        <label className="inline-flex items-center gap-2 text-fg-secondary">
          <span className="sr-only md:not-sr-only">Por página</span>
          <Select
            selectSize="sm"
            aria-label="Documentos por página"
            value={String(limit)}
            onChange={(e) => onLimitChange(Number(e.target.value) as LimitOption)}
          >
            {LIMIT_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </Select>
        </label>
      </div>

      <Pagination
        page={page}
        pages={pages}
        onPageChange={onPageChange}
        siblings={1}
      />
    </div>
  );
}
