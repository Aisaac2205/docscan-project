'use client';

import * as RadixDialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';
import { Heading } from '@/shared/components/Layout';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

type SheetSize = 'sm' | 'md' | 'lg';

interface SheetContentProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  size?: SheetSize;
  footer?: ReactNode;
}

const SIZE_CLASS: Record<SheetSize, string> = {
  sm: 'md:w-[420px]',
  md: 'md:w-[560px]',
  lg: 'md:w-[720px]',
};

export const SheetContent = forwardRef<HTMLDivElement, SheetContentProps>(
  ({ title, description, children, className, size = 'md', footer }, ref) => (
    <RadixDialog.Portal>
      <RadixDialog.Overlay
        className="fixed inset-0 z-[var(--z-overlay)] bg-[var(--color-surface-overlay)] animate-fade-in"
      />
      <RadixDialog.Content
        ref={ref}
        className={cn(
          'fixed z-[var(--z-modal)] bg-surface-card shadow-md',
          'flex flex-col focus:outline-none',
          'inset-x-0 bottom-0 h-[80vh] rounded-t-xl border-t border-border',
          'md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:h-full md:rounded-none md:border-t-0 md:border-l md:border-border',
          'animate-slide-up md:animate-fade-in',
          SIZE_CLASS[size],
          'md:max-w-[90vw]',
          className,
        )}
      >
        <header className="flex items-start justify-between gap-4 px-5 md:px-6 pt-5 pb-4 border-b border-border-subtle">
          <div className="min-w-0">
            <RadixDialog.Title asChild>
              <Heading level={3} as="h2" className="text-fg-primary">{title}</Heading>
            </RadixDialog.Title>
            {description && (
              <RadixDialog.Description className="text-body-sm text-fg-secondary mt-1">
                {description}
              </RadixDialog.Description>
            )}
          </div>
          <RadixDialog.Close
            aria-label="Cerrar"
            className="text-fg-tertiary hover:text-fg-primary rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] flex-shrink-0"
          >
            <X width={18} height={18} aria-hidden="true" />
          </RadixDialog.Close>
        </header>

        <div className="flex-1 overflow-y-auto px-5 md:px-6 py-5">
          {children}
        </div>

        {footer && (
          <footer className="flex-shrink-0 px-5 md:px-6 py-4 border-t border-border-subtle bg-surface-card">
            {footer}
          </footer>
        )}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  ),
);

SheetContent.displayName = 'SheetContent';

export const SheetTrigger = RadixDialog.Trigger;
export const SheetClose = RadixDialog.Close;
