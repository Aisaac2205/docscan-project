import React from 'react';
import { Heading } from '@/shared/components/Layout';

interface SourceCardAction {
  label: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface SourceCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: React.ReactNode;
  description: string;
  action: SourceCardAction;
  variant?: 'featured' | 'compact';
}

export function SourceCard({ icon, title, subtitle, description, action, variant = 'compact' }: SourceCardProps) {
  const isFeatured = variant === 'featured';
  return (
    <div className="bg-surface-card border border-border rounded-lg p-4 md:p-5 h-full flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-md bg-surface-sunken flex items-center justify-center flex-shrink-0 text-fg-tertiary">
          {icon}
        </div>
        <div className="min-w-0">
          <Heading level={4} as="h3" className="text-fg-primary">{title}</Heading>
          <p className="text-caption text-fg-tertiary mt-0.5">{subtitle}</p>
        </div>
      </div>
      <p className="text-body-sm text-fg-tertiary leading-relaxed flex-1">
        {description}
      </p>
      <button
        onClick={action.onClick}
        disabled={action.disabled}
        className={`w-full flex items-center justify-center gap-2 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] ${
          isFeatured
            ? 'h-11 bg-fg-primary text-fg-inverse text-button hover:opacity-90'
            : 'h-10 border border-border text-fg-secondary bg-surface-card text-button-sm hover:bg-surface-sunken hover:border-border-strong'
        }`}
      >
        {action.label}
      </button>
    </div>
  );
}
