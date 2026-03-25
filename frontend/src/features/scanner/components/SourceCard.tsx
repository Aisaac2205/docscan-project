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
    <div className={`bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-card)] ${isFeatured ? 'p-5' : 'p-4 flex flex-col'}`}>
      <div className={`flex items-start gap-3 ${isFeatured ? 'mb-4' : 'mb-3'}`}>
        <div className={`w-9 h-9 rounded-lg bg-stone-100 border border-[var(--border)] flex items-center justify-center flex-shrink-0 ${isFeatured ? 'mt-0.5' : ''}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-stone-800">{title}</p>
          <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <p className={`text-xs text-stone-400 leading-relaxed ${isFeatured ? 'mb-3' : 'mb-4 flex-1'}`}>
        {description}
      </p>
      <button
        onClick={action.onClick}
        disabled={action.disabled}
        className={`w-full flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
          isFeatured
            ? 'h-10 bg-stone-900 text-white text-sm hover:bg-stone-800'
            : 'h-9 border border-[var(--border)] text-stone-700 bg-white text-xs hover:bg-stone-50 hover:border-stone-400'
        }`}
      >
        {action.label}
      </button>
    </div>
  );
}
