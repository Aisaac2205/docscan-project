import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type SelectHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

const selectVariants = cva(
  [
    'w-full rounded-md border bg-surface-card text-fg-primary',
    'transition-colors appearance-none cursor-pointer',
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]',
    'disabled:bg-surface-sunken disabled:text-fg-disabled disabled:cursor-not-allowed',
  ],
  {
    variants: {
      selectSize: {
        sm: 'h-8 pl-2.5 pr-8 text-body-sm',
        md: 'h-9 pl-3 pr-9 text-body',
        lg: 'h-10 pl-3.5 pr-10 text-body',
      },
      state: {
        default: 'border-border',
        error: 'border-danger-fg focus-visible:outline-[var(--color-danger-fg)]',
      },
    },
    defaultVariants: { selectSize: 'md', state: 'default' },
  }
);

export type SelectSize = NonNullable<VariantProps<typeof selectVariants>['selectSize']>;

export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'>,
    VariantProps<typeof selectVariants> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hasError?: boolean;
}

const ICON_PADDING_LEFT = {
  sm: 'pl-8',
  md: 'pl-9',
  lg: 'pl-10',
} as const;

const Chevron = () => (
  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, selectSize = 'md', state, hasError, leftIcon, rightIcon, children, ...props }, ref) => {
    const resolvedState = hasError ? 'error' : state;
    const sizeKey: SelectSize = selectSize ?? 'md';

    return (
      <div className="relative w-full">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        <select
          ref={ref}
          className={cn(
            selectVariants({ selectSize, state: resolvedState }),
            leftIcon && ICON_PADDING_LEFT[sizeKey],
            className
          )}
          {...props}
        >
          {children}
        </select>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none flex items-center">
          {rightIcon ?? <Chevron />}
        </span>
      </div>
    );
  }
);

Select.displayName = 'Select';

export { selectVariants };
