'use client';

import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { es } from 'react-day-picker/locale';
import { cn } from '@/shared/lib/cn';
import 'react-day-picker/style.css';

/**
 * Wrapper de DayPicker (react-day-picker v10) con tokens del proyecto.
 * Soporta selección "single" y "range". El estilo overridea las clases
 * por defecto de DayPicker para alinearse con --color-surface-card,
 * --color-brand-500, etc.
 */
export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      locale={es}
      showOutsideDays
      className={cn('docscan-calendar text-body-sm text-fg-primary', className)}
      classNames={{
        months: 'flex flex-col gap-3',
        month_caption: 'flex items-center justify-center h-9 text-body font-medium',
        caption_label: 'text-body text-fg-primary',
        nav: 'absolute top-1 right-1 left-1 flex items-center justify-between',
        button_previous:
          'h-7 w-7 rounded-sm text-fg-secondary hover:bg-surface-sunken inline-flex items-center justify-center',
        button_next:
          'h-7 w-7 rounded-sm text-fg-secondary hover:bg-surface-sunken inline-flex items-center justify-center',
        month_grid: 'border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-caption text-fg-tertiary text-center',
        week: 'flex w-full',
        day: 'h-9 w-9 p-0 text-center',
        day_button:
          'h-9 w-9 rounded-md text-body-sm text-fg-primary hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)] disabled:opacity-30 disabled:cursor-not-allowed',
        today:
          '[&_button]:font-semibold [&_button]:text-[var(--color-brand-500)]',
        selected:
          '[&_button]:bg-[var(--color-brand-500)] [&_button]:text-[var(--color-fg-inverse)] [&_button]:hover:bg-[var(--color-brand-500)]',
        range_start:
          '[&_button]:bg-[var(--color-brand-500)] [&_button]:text-[var(--color-fg-inverse)] [&_button]:rounded-r-none',
        range_end:
          '[&_button]:bg-[var(--color-brand-500)] [&_button]:text-[var(--color-fg-inverse)] [&_button]:rounded-l-none',
        range_middle:
          '[&_button]:bg-[var(--color-surface-sunken)] [&_button]:text-fg-primary [&_button]:rounded-none',
        outside: '[&_button]:text-fg-tertiary [&_button]:opacity-50',
        disabled: '[&_button]:opacity-30 [&_button]:cursor-not-allowed',
        ...classNames,
      }}
      {...props}
    />
  );
}
