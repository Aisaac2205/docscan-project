import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Heading } from '@/shared/components/Layout';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3 px-6 py-12',
        className
      )}
      {...props}
    >
      {icon && (
        <span
          className="flex items-center justify-center w-12 h-12 rounded-full bg-surface-sunken text-fg-tertiary"
          aria-hidden="true"
        >
          {icon}
        </span>
      )}
      <div className="flex flex-col gap-1 max-w-md">
        <Heading level={3}>{title}</Heading>
        {description && (
          <p className="text-body text-fg-secondary">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
);

EmptyState.displayName = 'EmptyState';
