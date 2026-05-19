'use client';

import * as RadixAvatar from '@radix-ui/react-avatar';
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

type AvatarSize = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<AvatarSize, string> = {
  sm: 'h-6 w-6 text-[10px]',
  md: 'h-8 w-8 text-[12px]',
  lg: 'h-10 w-10 text-body-sm',
};

interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  src?: string | null;
  alt?: string;
  fallback: string;
}

export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(
  ({ className, size = 'md', src, alt, fallback, ...props }, ref) => (
    <RadixAvatar.Root
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center overflow-hidden rounded-full',
        'bg-surface-sunken text-fg-secondary select-none flex-shrink-0',
        'font-medium',
        SIZE_CLASS[size],
        className,
      )}
      {...props}
    >
      {src && (
        <RadixAvatar.Image
          src={src}
          alt={alt ?? fallback}
          className="h-full w-full object-cover"
        />
      )}
      <RadixAvatar.Fallback
        delayMs={src ? 200 : 0}
        className="flex items-center justify-center h-full w-full"
      >
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  ),
);
Avatar.displayName = 'Avatar';
