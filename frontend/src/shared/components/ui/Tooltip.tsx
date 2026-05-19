'use client';

import * as RadixTooltip from '@radix-ui/react-tooltip';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

interface TooltipProviderProps {
  children: ReactNode;
  /** ms hasta abrir el tooltip al hover. Default 300. */
  delayDuration?: number;
}

export function TooltipProvider({ children, delayDuration = 300 }: TooltipProviderProps) {
  return (
    <RadixTooltip.Provider delayDuration={delayDuration}>
      {children}
    </RadixTooltip.Provider>
  );
}

export const Tooltip = RadixTooltip.Root;
export const TooltipTrigger = RadixTooltip.Trigger;

export const TooltipContent = forwardRef<HTMLDivElement, RadixTooltip.TooltipContentProps>(
  ({ className, sideOffset = 6, ...props }, ref) => (
    <RadixTooltip.Portal>
      <RadixTooltip.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-[var(--z-modal)] rounded-md px-2 py-1 text-caption',
          'bg-[var(--color-fg-primary)] text-[var(--color-surface-card)]',
          'shadow-md animate-fade-in',
          'max-w-xs',
          className,
        )}
        {...props}
      />
    </RadixTooltip.Portal>
  ),
);
TooltipContent.displayName = 'TooltipContent';
