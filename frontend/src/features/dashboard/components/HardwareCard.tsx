import React from 'react';

interface HardwareCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  status: 'available' | 'unavailable' | 'configured';
  statusLabel: string;
}

export function HardwareCard({ icon, title, subtitle, description, status, statusLabel }: HardwareCardProps) {
  const statusClass =
    status === 'available'  ? 'bg-surface-sunken text-fg-secondary' :
    status === 'configured' ? 'bg-fg-primary text-fg-inverse'       :
                              'bg-surface-sunken text-fg-tertiary';

  return (
    <div className="bg-surface-card border border-border rounded-lg p-4 lg:p-5 card-interactive">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-md bg-surface-sunken flex items-center justify-center flex-shrink-0 text-fg-tertiary">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-h4 text-fg-primary">{title}</p>
          <p className="text-caption text-fg-tertiary mt-0.5">{subtitle}</p>
        </div>
      </div>
      <p className="text-body-sm text-fg-secondary leading-relaxed mb-3">{description}</p>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-overline ${statusClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {statusLabel}
      </span>
    </div>
  );
}
