import { forwardRef, type LabelHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, required, children, ...props }, ref) => (
    <label
      ref={ref}
      className={cn('inline-flex items-center gap-1 text-caption text-fg-primary', className)}
      {...props}
    >
      {children}
      {required && <span className="text-fg-accent" aria-hidden="true">*</span>}
    </label>
  )
);

Label.displayName = 'Label';
