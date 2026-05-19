'use client';

import * as RadixDropdown from '@radix-ui/react-dropdown-menu';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

export const DropdownMenu = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;
export const DropdownMenuGroup = RadixDropdown.Group;
export const DropdownMenuPortal = RadixDropdown.Portal;
export const DropdownMenuSeparator = forwardRef<
  HTMLDivElement,
  RadixDropdown.DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => (
  <RadixDropdown.Separator
    ref={ref}
    className={cn('my-1 h-px bg-border-subtle', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

interface DropdownMenuContentProps extends RadixDropdown.DropdownMenuContentProps {
  children: ReactNode;
}

export const DropdownMenuContent = forwardRef<HTMLDivElement, DropdownMenuContentProps>(
  ({ className, sideOffset = 6, align = 'end', children, ...props }, ref) => (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-[var(--z-modal)] min-w-[10rem] rounded-md',
          'bg-surface-card border border-border shadow-md',
          'p-1 animate-fade-in',
          'focus:outline-none',
          className,
        )}
        {...props}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  ),
);
DropdownMenuContent.displayName = 'DropdownMenuContent';

interface DropdownMenuItemProps extends RadixDropdown.DropdownMenuItemProps {
  /** Marca el item como destructivo (rojo). */
  destructive?: boolean;
}

export const DropdownMenuItem = forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, destructive, ...props }, ref) => (
    <RadixDropdown.Item
      ref={ref}
      className={cn(
        'flex items-center gap-2 rounded-sm px-2.5 py-1.5 text-body-sm cursor-pointer select-none',
        'outline-none transition-colors',
        destructive
          ? 'text-danger-fg data-[highlighted]:bg-danger-bg'
          : 'text-fg-primary data-[highlighted]:bg-surface-sunken',
        'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  ),
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

export const DropdownMenuLabel = forwardRef<
  HTMLDivElement,
  RadixDropdown.DropdownMenuLabelProps
>(({ className, ...props }, ref) => (
  <RadixDropdown.Label
    ref={ref}
    className={cn('px-2.5 py-1 text-caption uppercase tracking-wide text-fg-tertiary', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = 'DropdownMenuLabel';
