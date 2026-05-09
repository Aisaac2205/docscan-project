import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, createElement, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

const stackVariants = cva('flex flex-col', {
  variants: {
    gap: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-10',
    },
  },
  defaultVariants: { gap: 'md' },
});

export type StackGap = NonNullable<VariantProps<typeof stackVariants>['gap']>;
export type StackTag = 'div' | 'section' | 'article' | 'main' | 'aside';

export interface StackProps
  extends HTMLAttributes<HTMLElement>,
    VariantProps<typeof stackVariants> {
  as?: StackTag;
}

export const Stack = forwardRef<HTMLElement, StackProps>(
  ({ as = 'div', gap, className, children, ...props }, ref) => {
    return createElement(
      as,
      { ref, className: cn(stackVariants({ gap }), className), ...props },
      children
    );
  }
);

Stack.displayName = 'Stack';

export { stackVariants };
