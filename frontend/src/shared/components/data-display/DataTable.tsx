import { type ReactNode, type Key } from 'react';
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
}: DataTableProps<T>) {
  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

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
              className="border-b border-border-subtle last:border-b-0 transition-colors hover:bg-surface-sunken"
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
