import { type ReactNode, type Key, type KeyboardEvent } from 'react';
import { cn } from '@/shared/lib/cn';

export type ColumnAlign = 'left' | 'center' | 'right';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  align?: ColumnAlign;
  width?: string | number;
  render?: (row: T, index: number) => ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey?: (row: T, index: number) => Key;
  emptyState?: ReactNode;
  className?: string;
  ariaLabel?: string;
  /** Si se pasa, la fila completa es interactiva (click + Enter/Espacio). */
  onRowClick?: (row: T, index: number) => void;
  /** Clases extra por fila (decoración: barra lateral de estado, énfasis, etc.). */
  rowClassName?: (row: T, index: number) => string | undefined;
}

const ALIGN_CLASSES: Record<ColumnAlign, string> = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

function defaultGetCell<T>(row: T, key: string): ReactNode {
  const value = (row as Record<string, unknown>)[key];
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return null;
}

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyState,
  className,
  ariaLabel,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  const clickable = typeof onRowClick === 'function';

  return (
    <div className={cn('w-full overflow-x-auto rounded-lg border border-border-subtle', className)}>
      <table className="w-full border-collapse" aria-label={ariaLabel}>
        <thead>
          <tr className="border-b border-border bg-surface-sunken">
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  'px-4 py-2.5 text-caption text-fg-secondary font-medium whitespace-nowrap',
                  ALIGN_CLASSES[col.align ?? 'left']
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={getRowKey ? getRowKey(row, rowIndex) : rowIndex}
              {...(clickable
                ? {
                    role: 'button',
                    tabIndex: 0,
                    onClick: () => onRowClick(row, rowIndex),
                    onKeyDown: (e: KeyboardEvent<HTMLTableRowElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onRowClick(row, rowIndex);
                      }
                    },
                  }
                : {})}
              className={cn(
                'border-b border-border-subtle last:border-b-0 transition-colors hover:bg-surface-card-hover',
                clickable &&
                  'cursor-pointer focus-visible:bg-surface-card-hover focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--color-border-focus)]',
                rowClassName?.(row, rowIndex),
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={cn(
                    'px-4 py-3 text-body align-middle',
                    ALIGN_CLASSES[col.align ?? 'left']
                  )}
                >
                  {col.render ? col.render(row, rowIndex) : defaultGetCell(row, col.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

DataTable.displayName = 'DataTable';
