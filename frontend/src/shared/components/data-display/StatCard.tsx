import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Sparkline, type SparklineVariant } from './Sparkline';

const statCardVariants = cva(
  'flex flex-col gap-2 rounded-lg bg-surface-card p-5 border',
  {
    variants: {
      variant: {
        default: 'border-border',
        accent: 'border-border border-l-2 border-l-accent-500',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);

export type StatCardVariant = NonNullable<VariantProps<typeof statCardVariants>['variant']>;

export interface StatCardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statCardVariants> {
  label: string;
  value: ReactNode;
  delta?: number | null;
  deltaLabel?: string;
  icon?: ReactNode;
  /** Serie temporal corta. Si trae <2 puntos, no se renderiza nada. */
  sparkline?: number[];
  /** Variante visual del sparkline. Default: 'line'. */
  sparklineVariant?: SparklineVariant;
  /** Color CSS del sparkline. Default: var(--color-chart-1). */
  sparklineColor?: string;
}

const ArrowUp = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M6 9.5V2.5m0 0L3 5.5m3-3l3 3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowDown = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
    <path
      d="M6 2.5v7m0 0L3 6.5m3 3l3-3"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

function formatDelta(delta: number): string {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}%`;
}

export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(
  (
    {
      className,
      variant,
      label,
      value,
      delta,
      deltaLabel,
      icon,
      sparkline,
      sparklineVariant = 'line',
      sparklineColor,
      ...props
    },
    ref,
  ) => {
    const showDelta = typeof delta === 'number' && delta !== 0;
    const isPositive = (delta ?? 0) > 0;
    const showSparkline = Array.isArray(sparkline) && sparkline.length >= 2;

    return (
      <div
        ref={ref}
        className={cn(statCardVariants({ variant }), className)}
        {...props}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-caption text-fg-secondary">{label}</span>
          {icon && (
            <span className="text-fg-tertiary shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
        </div>

        <span className="text-display-lg text-fg-primary">{value}</span>

        {(showDelta || showSparkline) && (
          <div className="flex items-center justify-between gap-3">
            {showDelta ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    'inline-flex items-center gap-1 text-caption font-medium',
                    isPositive ? 'text-success-fg' : 'text-danger-fg'
                  )}
                >
                  {isPositive ? <ArrowUp /> : <ArrowDown />}
                  {formatDelta(delta as number)}
                </span>
                {deltaLabel && (
                  <span className="text-caption text-fg-tertiary">{deltaLabel}</span>
                )}
              </div>
            ) : (
              <span aria-hidden="true" />
            )}
            {showSparkline && (
              <Sparkline
                data={sparkline}
                variant={sparklineVariant}
                color={sparklineColor}
                ariaLabel={`tendencia de ${label}`}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export { statCardVariants };
