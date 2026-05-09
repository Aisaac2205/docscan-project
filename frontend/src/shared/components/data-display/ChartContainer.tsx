import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/* ──────────────────────────────────────────────────────────────────────────
   Chart palette — referencias a CSS vars definidas en globals.css
   Recharts las resuelve nativamente vía SVG (stroke / fill aceptan strings).
   ────────────────────────────────────────────────────────────────────────── */

export const CHART_COLORS = [
  'var(--color-chart-1)',
  'var(--color-chart-2)',
  'var(--color-chart-3)',
  'var(--color-chart-4)',
  'var(--color-chart-5)',
  'var(--color-chart-6)',
] as const;

export const CHART_COLORS_MUTED = [
  'var(--color-chart-1-muted)',
  'var(--color-chart-2-muted)',
  'var(--color-chart-3-muted)',
  'var(--color-chart-4-muted)',
  'var(--color-chart-5-muted)',
  'var(--color-chart-6-muted)',
] as const;

export const CHART_ACCENT = 'var(--color-chart-accent)';
export const CHART_ACCENT_MUTED = 'var(--color-chart-accent-muted)';

/* ──────────────────────────────────────────────────────────────────────────
   ChartContainer — shell visual. NO sabe nada del chart.
   ────────────────────────────────────────────────────────────────────────── */

export interface ChartContainerProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export const ChartContainer = forwardRef<HTMLElement, ChartContainerProps>(
  ({ title, description, actions, footer, className, children, ...props }, ref) => (
    <section
      ref={ref}
      className={cn(
        'flex flex-col rounded-lg border border-border bg-surface-card',
        className
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-4 p-5 border-b border-border-subtle">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h3 className="text-h3">{title}</h3>
          {description && (
            <p className="text-body-sm text-fg-secondary">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </header>
      <div className="p-5">{children}</div>
      {footer && (
        <footer className="px-5 py-3 border-t border-border-subtle">{footer}</footer>
      )}
    </section>
  )
);

ChartContainer.displayName = 'ChartContainer';

/* ──────────────────────────────────────────────────────────────────────────
   ChartTooltip — Recharts inyecta active/payload/label vía content={...}.
   Tipamos estructuralmente para no atar a una versión específica de Recharts.
   ────────────────────────────────────────────────────────────────────────── */

export interface ChartTooltipPayloadEntry {
  name?: string | number;
  value?: string | number;
  color?: string;
  dataKey?: string | number;
}

export interface ChartTooltipProps {
  active?: boolean;
  payload?: ChartTooltipPayloadEntry[];
  label?: string | number;
  valueFormatter?: (value: string | number | undefined) => string;
}

export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: ChartTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      role="tooltip"
      className="rounded-md border border-border bg-surface-card shadow-sm px-3 py-2 min-w-[140px]"
    >
      {label !== undefined && label !== '' && (
        <p className="text-body-sm text-fg-secondary mb-1.5">{label}</p>
      )}
      <ul className="flex flex-col gap-1">
        {payload.map((entry, idx) => (
          <li
            key={`${entry.dataKey ?? entry.name ?? idx}`}
            className="flex items-center justify-between gap-3 text-body-sm"
          >
            <span className="flex items-center gap-2 text-fg-secondary min-w-0">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ background: entry.color }}
                aria-hidden="true"
              />
              <span className="truncate">{entry.name}</span>
            </span>
            <span className="text-fg-primary font-medium tabular-nums">
              {valueFormatter ? valueFormatter(entry.value) : entry.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

ChartTooltip.displayName = 'ChartTooltip';

/* ──────────────────────────────────────────────────────────────────────────
   ChartLegend — Recharts inyecta payload vía content={...}.
   ────────────────────────────────────────────────────────────────────────── */

export interface ChartLegendPayloadEntry {
  value?: string;
  color?: string;
  type?: string;
  id?: string;
  dataKey?: string | number;
}

export interface ChartLegendProps {
  payload?: ChartLegendPayloadEntry[];
  align?: 'start' | 'center' | 'end';
}

export function ChartLegend({ payload, align = 'center' }: ChartLegendProps) {
  if (!payload?.length) return null;

  const justify =
    align === 'start' ? 'justify-start' :
    align === 'end' ? 'justify-end' :
    'justify-center';

  return (
    <ul className={cn('flex flex-wrap gap-x-4 gap-y-2 mt-3', justify)}>
      {payload.map((entry, idx) => (
        <li
          key={`${entry.id ?? entry.dataKey ?? idx}`}
          className="flex items-center gap-2 text-body-sm text-fg-secondary"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: entry.color }}
            aria-hidden="true"
          />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
}

ChartLegend.displayName = 'ChartLegend';
