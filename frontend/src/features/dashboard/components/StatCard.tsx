import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

export function StatCard({ label, value, icon, highlight = false }: StatCardProps) {
  return (
    <div className="bg-white border border-[var(--border)] rounded-xl p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-start justify-between gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          highlight ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-500'
        }`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-semibold mt-3 text-stone-900">{value}</p>
      <p className="text-xs text-stone-400 mt-0.5">{label}</p>
    </div>
  );
}
