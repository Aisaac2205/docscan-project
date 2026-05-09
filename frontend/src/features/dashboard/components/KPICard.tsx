'use client';

import React from 'react';

type KPITone = 'neutral' | 'positive' | 'warning' | 'critical';

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: KPITone;
  loading?: boolean;
  ariaLabel?: string;
}

const toneClasses: Record<KPITone, { iconBg: string; iconText: string; valueText: string }> = {
  neutral: {
    iconBg: 'bg-stone-100',
    iconText: 'text-stone-700',
    valueText: 'text-stone-900',
  },
  positive: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-700',
    valueText: 'text-stone-900',
  },
  warning: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-700',
    valueText: 'text-stone-900',
  },
  critical: {
    iconBg: 'bg-rose-50',
    iconText: 'text-rose-700',
    valueText: 'text-stone-900',
  },
};

export function KPICard({
  icon,
  label,
  value,
  hint,
  tone = 'neutral',
  loading = false,
  ariaLabel,
}: KPICardProps) {
  const t = toneClasses[tone];

  return (
    <div
      role="group"
      aria-label={ariaLabel ?? label}
      aria-busy={loading || undefined}
      className="flex items-start gap-4 p-4 md:p-5 bg-white border border-stone-200 rounded-xl"
    >
      <div
        aria-hidden="true"
        className={`w-10 h-10 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${t.iconBg} ${t.iconText}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs uppercase tracking-wider font-semibold text-stone-500 mb-1">
          {label}
        </p>
        {loading ? (
          <span
            aria-hidden="true"
            className="block h-7 w-16 rounded bg-stone-100 animate-pulse"
          />
        ) : (
          <p className={`text-2xl md:text-3xl font-semibold leading-tight ${t.valueText}`}>
            {value}
          </p>
        )}
        {hint && !loading && (
          <p className="text-xs md:text-sm text-stone-400 mt-1">{hint}</p>
        )}
      </div>
    </div>
  );
}
