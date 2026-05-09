import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

const clusterVariants = cva('flex flex-row', {
  variants: {
    gap: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
    },
    align: {
      start:    'items-start',
      center:   'items-center',
      end:      'items-end',
      baseline: 'items-baseline',
      stretch:  'items-stretch',
    },
    justify: {
      start:   'justify-start',
      center:  'justify-center',
      end:     'justify-end',
      between: 'justify-between',
      around:  'justify-around',
    },
    wrap: {
      true:  'flex-wrap',
      false: 'flex-nowrap',
    },
  },
  defaultVariants: { gap: 'md', align: 'center', justify: 'start', wrap: false },
});

export type ClusterGap = NonNullable<VariantProps<typeof clusterVariants>['gap']>;
export type ClusterAlign = NonNullable<VariantProps<typeof clusterVariants>['align']>;
export type ClusterJustify = NonNullable<VariantProps<typeof clusterVariants>['justify']>;

export interface ClusterProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof clusterVariants> {}

export const Cluster = forwardRef<HTMLDivElement, ClusterProps>(
  ({ gap, align, justify, wrap, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(clusterVariants({ gap, align, justify, wrap }), className)}
      {...props}
    />
  )
);

Cluster.displayName = 'Cluster';

export { clusterVariants };
