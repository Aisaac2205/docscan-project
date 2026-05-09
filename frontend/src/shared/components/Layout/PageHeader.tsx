import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Heading } from './Heading';

export interface PageHeaderProps extends HTMLAttributes<HTMLElement> {
  title: string;
  description?: string;
  actions?: ReactNode;
  breadcrumb?: ReactNode;
}

export const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(
  ({ title, description, actions, breadcrumb, className, ...props }, ref) => (
    <header
      ref={ref}
      className={cn('flex flex-col gap-3 pb-6 border-b border-border-subtle', className)}
      {...props}
    >
      {breadcrumb && <div>{breadcrumb}</div>}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <Heading level={1}>{title}</Heading>
          {description && (
            <p className="text-body-lg text-fg-secondary">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  )
);

PageHeader.displayName = 'PageHeader';
