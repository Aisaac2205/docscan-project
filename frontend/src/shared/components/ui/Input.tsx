import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

const inputVariants = cva(
  [
    'w-full rounded-md border bg-surface-card text-fg-primary placeholder:text-fg-tertiary',
    'transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]',
    'disabled:bg-surface-sunken disabled:text-fg-disabled disabled:cursor-not-allowed',
  ],
  {
    variants: {
      inputSize: {
        sm: 'h-8 px-2.5 text-body-sm',
        md: 'h-9 px-3 text-body',
        lg: 'h-10 px-3.5 text-body',
      },
      state: {
        default: 'border-border',
        error: 'border-danger-fg focus-visible:outline-[var(--color-danger-fg)]',
      },
    },
    defaultVariants: { inputSize: 'md', state: 'default' },
  }
);

export type InputSize = NonNullable<VariantProps<typeof inputVariants>['inputSize']>;

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  hasError?: boolean;
}

const ICON_PADDING = {
  sm: { left: 'pl-8', right: 'pr-8' },
  md: { left: 'pl-9', right: 'pr-9' },
  lg: { left: 'pl-10', right: 'pr-10' },
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputSize = 'md', state, hasError, leftIcon, rightIcon, ...props }, ref) => {
    const resolvedState = hasError ? 'error' : state;
    const sizeKey: InputSize = inputSize ?? 'md';
    const padding = cn(
      leftIcon && ICON_PADDING[sizeKey].left,
      rightIcon && ICON_PADDING[sizeKey].right
    );

    const inputEl = (
      <input
        ref={ref}
        className={cn(inputVariants({ inputSize, state: resolvedState }), padding, className)}
        {...props}
      />
    );

    if (!leftIcon && !rightIcon) return inputEl;

    return (
      <div className="relative w-full">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none flex items-center">
            {leftIcon}
          </span>
        )}
        {inputEl}
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-tertiary pointer-events-none flex items-center">
            {rightIcon}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { inputVariants };
