'use client';

import * as RadixPopover from '@radix-ui/react-popover';
import { forwardRef } from 'react';
import { cn } from '@/shared/lib/cn';

export const Popover = RadixPopover.Root;
export const PopoverTrigger = RadixPopover.Trigger;
export const PopoverAnchor = RadixPopover.Anchor;
export const PopoverClose = RadixPopover.Close;

export const PopoverContent = forwardRef<HTMLDivElement, RadixPopover.PopoverContentProps>(
  ({ className, sideOffset = 8, align = 'start', ...props }, ref) => (
    <RadixPopover.Portal>
      <RadixPopover.Content
        ref={ref}
        sideOffset={sideOffset}
        align={align}
        className={cn(
          'z-[var(--z-modal)] rounded-md',
          'bg-surface-card border border-border shadow-md',
          'p-3 animate-fade-in',
          'focus:outline-none',
          className,
        )}
        {...props}
      />
    </RadixPopover.Portal>
  ),
);
PopoverContent.displayName = 'PopoverContent';
