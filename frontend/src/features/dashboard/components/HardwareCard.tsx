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
    status === 'available'  ? 'bg-stone-100 text-stone-600' :
    status === 'configured' ? 'bg-stone-900 text-white'     :
                              'bg-stone-100 text-stone-400';

  return (
    <div className="bg-white border border-[var(--border)] rounded-lg p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0 text-stone-500">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-stone-800">{title}</p>
          <p className="text-xs text-stone-400 mt-0.5">{subtitle}</p>
        </div>
      </div>
      <p className="text-xs text-stone-500 leading-relaxed mb-3">{description}</p>
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${statusClass}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
        {statusLabel}
      </span>
    </div>
  );
}
