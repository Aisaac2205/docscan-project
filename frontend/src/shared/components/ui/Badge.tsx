import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-surface-sunken text-fg-secondary border-border',
        info:    'bg-info-bg text-info-fg border-info-border',
        success: 'bg-success-bg text-success-fg border-success-border',
        warning: 'bg-warning-bg text-warning-fg border-warning-border',
        danger:  'bg-danger-bg text-danger-fg border-danger-border',
        accent:  'bg-accent-50 text-accent-700 border-accent-200',
      },
      size: {
        sm: 'h-5 px-2 text-overline',
        md: 'h-6 px-2.5 text-caption',
      },
    },
    defaultVariants: { variant: 'default', size: 'sm' },
  }
);

export type BadgeVariant = NonNullable<VariantProps<typeof badgeVariants>['variant']>;
export type BadgeSize = NonNullable<VariantProps<typeof badgeVariants>['size']>;

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);

Badge.displayName = 'Badge';

export { badgeVariants };
