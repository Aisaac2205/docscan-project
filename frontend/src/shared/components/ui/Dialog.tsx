'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Heading } from '@/shared/components/Layout';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

interface DialogContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_CLASS: Record<NonNullable<DialogContentProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
};

export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ title, description, children, className, size = 'md' }, ref) => (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-surface-overlay)] animate-fade-in"
      />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          'fixed left-1/2 top-1/2 z-[var(--z-modal)] -translate-x-1/2 -translate-y-1/2',
          'w-[calc(100vw-2rem)] max-h-[calc(100vh-3rem)] overflow-y-auto',
          'bg-surface-card border border-border rounded-md shadow-md',
          'p-5 md:p-6 animate-fade-in',
          'focus:outline-none',
          SIZE_CLASS[size],
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <RadixDialog.Title asChild>
              <Heading level={3} as="h2">{title}</Heading>
            </RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-body-sm text-fg-secondary mt-1">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close
            aria-label="Cerrar"
            className="text-fg-tertiary hover:text-fg-primary rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
          >
            <X width={18} height={18} aria-hidden="true" />
          </RadixDialog.Close>
        </header>

        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),
);

DialogContent.displayName = 'DialogContent';

export const DialogTrigger = RadixDialog.Trigger;
export const DialogClose = RadixDialog.Close;
