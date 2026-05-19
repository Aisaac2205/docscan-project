'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import {
  Calendar,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';
import { formatShortDate, toIsoDate } from '../utils/formatters';

export type DateRangePreset = 'all' | 'today' | 'last7' | 'thisMonth' | 'custom';

interface DateRangeFilterProps {
  dateFrom: string | null;
  dateTo: string | null;
  onChange: (next: { dateFrom: string | null; dateTo: string | null }) => void;
  className?: string;
}

const PRESETS: { value: Exclude<DateRangePreset, 'custom'>; label: string }[] = [
  { value: 'all', label: 'Todo el período' },
  { value: 'today', label: 'Hoy' },
  { value: 'last7', label: 'Últimos 7 días' },
  { value: 'thisMonth', label: 'Este mes' },
];

const TRIGGER_CLASS = cn(
  'inline-flex items-center gap-2 h-9 px-3 rounded-md',
  'border border-border bg-surface-card text-body-sm text-fg-primary',
  'hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]',
);

export function DateRangeFilter({
  dateFrom,
  dateTo,
  onChange,
  className,
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const activePreset = resolvePreset(dateFrom, dateTo);

  const handlePreset = (preset: Exclude<DateRangePreset, 'custom'>) => {
    onChange(presetToRange(preset));
    setOpen(false);
  };

  const handleCustomChange = (range: DateRange | undefined) => {
    onChange({
      dateFrom: range?.from ? toIsoDate(range.from) : null,
      dateTo: range?.to ? toIsoDate(range.to) : null,
    });
  };

  const label = formatTriggerLabel(activePreset, dateFrom, dateTo);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn(TRIGGER_CLASS, className)} aria-label="Filtrar por fecha">
          <CalendarIcon width={16} height={16} aria-hidden="true" className="text-fg-tertiary" />
          <span>{label}</span>
        </button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-auto p-0">
        <div className="flex flex-col md:flex-row">
          <ul className="flex flex-col gap-0.5 p-2 md:border-r border-border-subtle md:min-w-[10rem]">
            {PRESETS.map((preset) => {
              const selected = activePreset === preset.value;
              return (
                <li key={preset.value}>
                  <button
                    type="button"
                    onClick={() => handlePreset(preset.value)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 rounded-sm text-body-sm',
                      selected
                        ? 'bg-surface-sunken text-fg-primary'
                        : 'text-fg-secondary hover:bg-surface-sunken hover:text-fg-primary',
                    )}
                  >
                    {preset.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="p-2">
            <Calendar
              mode="range"
              selected={{
                from: dateFrom ? new Date(dateFrom) : undefined,
                to: dateTo ? new Date(dateTo) : undefined,
              }}
              onSelect={handleCustomChange}
              numberOfMonths={1}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function presetToRange(preset: Exclude<DateRangePreset, 'custom'>) {
  if (preset === 'all') return { dateFrom: null, dateTo: null };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === 'today') {
    return { dateFrom: toIsoDate(today), dateTo: toIsoDate(today) };
  }
  if (preset === 'last7') {
    const from = new Date(today);
    from.setDate(today.getDate() - 6);
    return { dateFrom: toIsoDate(from), dateTo: toIsoDate(today) };
  }
  // thisMonth
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  return { dateFrom: toIsoDate(monthStart), dateTo: toIsoDate(today) };
}

function resolvePreset(dateFrom: string | null, dateTo: string | null): DateRangePreset {
  if (!dateFrom && !dateTo) return 'all';
  for (const preset of PRESETS) {
    if (preset.value === 'all') continue;
    const expected = presetToRange(preset.value);
    if (expected.dateFrom === dateFrom && expected.dateTo === dateTo) return preset.value;
  }
  return 'custom';
}

function formatTriggerLabel(
  preset: DateRangePreset,
  dateFrom: string | null,
  dateTo: string | null,
): string {
  switch (preset) {
    case 'all':
      return 'Todo el período';
    case 'today':
      return 'Hoy';
    case 'last7':
      return 'Últimos 7 días';
    case 'thisMonth':
      return 'Este mes';
    case 'custom': {
      if (dateFrom && dateTo) return `${formatShortDate(dateFrom)} – ${formatShortDate(dateTo)}`;
      if (dateFrom) return `Desde ${formatShortDate(dateFrom)}`;
      if (dateTo) return `Hasta ${formatShortDate(dateTo)}`;
      return 'Personalizado';
    }
  }
}
