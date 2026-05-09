import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

const textareaVariants = cva(
  [
    'w-full rounded-md border bg-surface-card text-fg-primary placeholder:text-fg-tertiary',
    'transition-colors resize-y',
    'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]',
    'disabled:bg-surface-sunken disabled:text-fg-disabled disabled:cursor-not-allowed',
  ],
  {
    variants: {
      textareaSize: {
        sm: 'px-2.5 py-1.5 text-body-sm min-h-[64px]',
        md: 'px-3   py-2   text-body    min-h-[80px]',
        lg: 'px-3.5 py-2.5 text-body    min-h-[96px]',
      },
      state: {
        default: 'border-border',
        error: 'border-danger-fg focus-visible:outline-[var(--color-danger-fg)]',
      },
    },
    defaultVariants: { textareaSize: 'md', state: 'default' },
  }
);

export type TextareaSize = NonNullable<VariantProps<typeof textareaVariants>['textareaSize']>;

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  hasError?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, textareaSize, state, hasError, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        textareaVariants({ textareaSize, state: hasError ? 'error' : state }),
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';

export { textareaVariants };
