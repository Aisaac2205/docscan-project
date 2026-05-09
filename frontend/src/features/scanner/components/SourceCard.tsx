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
    <div className={`bg-white border border-[var(--border)] rounded-lg h-full flex flex-col ${isFeatured ? 'p-5 lg:p-6' : 'p-4 lg:p-5'}`}>
      <div className={`flex items-start gap-3 ${isFeatured ? 'mb-4' : 'mb-3'}`}>
        <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0 ${isFeatured ? 'mt-0.5' : ''}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm lg:text-base font-semibold text-stone-800">{title}</p>
          <p className="text-xs lg:text-sm text-stone-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <p className={`text-xs lg:text-sm text-stone-400 leading-relaxed flex-1 ${isFeatured ? 'mb-3' : 'mb-4'}`}>
        {description}
      </p>
      <button
        onClick={action.onClick}
        disabled={action.disabled}
        className={`w-full flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-auto ${
          isFeatured
            ? 'h-10 lg:h-11 bg-stone-900 text-white text-sm lg:text-base hover:bg-stone-800'
            : 'h-9 lg:h-10 border border-[var(--border)] text-stone-700 bg-white text-xs lg:text-sm hover:bg-stone-50 hover:border-stone-400'
        }`}
      >
        {action.label}
      </button>
    </div>
  );
}
