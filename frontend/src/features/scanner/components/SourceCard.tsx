import React from 'react';

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
    <div className={`bg-surface-card border border-border rounded-md h-full flex flex-col ${isFeatured ? 'p-5 lg:p-6' : 'p-4 lg:p-5'}`}>
      <div className={`flex items-start gap-3 ${isFeatured ? 'mb-4' : 'mb-3'}`}>
        <div className={`w-9 h-9 rounded-md bg-surface-sunken flex items-center justify-center flex-shrink-0 text-fg-tertiary ${isFeatured ? 'mt-0.5' : ''}`}>
          {icon}
        </div>
        <div>
          <p className="text-h4 text-fg-primary">{title}</p>
          <p className="text-caption text-fg-tertiary mt-0.5">{subtitle}</p>
        </div>
      </div>
      <p className={`text-body-sm text-fg-tertiary leading-relaxed flex-1 ${isFeatured ? 'mb-3' : 'mb-4'}`}>
        {description}
      </p>
      <button
        onClick={action.onClick}
        disabled={action.disabled}
        className={`w-full flex items-center justify-center gap-2 font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto ${
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
