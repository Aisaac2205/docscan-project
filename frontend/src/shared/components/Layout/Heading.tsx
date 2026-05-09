import { forwardRef, createElement, type HTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'div' | 'p' | 'span';

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  level: HeadingLevel;
  as?: HeadingTag;
}

const TEXT_BY_LEVEL: Record<HeadingLevel, string> = {
  1: 'text-h1',
  2: 'text-h2',
  3: 'text-h3',
  4: 'text-h4',
};

const DEFAULT_TAG_BY_LEVEL: Record<HeadingLevel, HeadingTag> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
};

export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ level, as, className, children, ...props }, ref) => {
    const Tag = as ?? DEFAULT_TAG_BY_LEVEL[level];
    return createElement(
      Tag,
      { ref, className: cn(TEXT_BY_LEVEL[level], className), ...props },
      children
    );
  }
);

Heading.displayName = 'Heading';
