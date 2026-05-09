'use client';

import type { ReactElement } from 'react';
import { useToastStore, type ToastType } from './store';

const toastConfig: Record<ToastType, { border: string; icon: ReactElement }> = {
  success: {
    border: 'border-success-border',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="var(--color-success-bg)" stroke="var(--color-success-border)" strokeWidth="1"/>
        <path d="M5 8l2.5 2.5L11 5.5" stroke="var(--color-success-fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  error: {
    border: 'border-danger-border',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="var(--color-danger-bg)" stroke="var(--color-danger-border)" strokeWidth="1"/>
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="var(--color-danger-fg)" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  info: {
    border: 'border-info-border',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="var(--color-info-bg)" stroke="var(--color-info-border)" strokeWidth="1"/>
        <path d="M8 7v4" stroke="var(--color-info-fg)" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="5" r="0.75" fill="var(--color-info-fg)"/>
      </svg>
    ),
  },
};

function ToastItem({
  message, type, onClose,
}: {
  id: string; message: string; type: ToastType; onClose: () => void;
}) {
  const config = toastConfig[type];

  return (
    <div
      className={`bg-surface-card ${config.border} border rounded-lg shadow-md flex items-start gap-3 px-4 py-3 min-w-[280px] max-w-[360px] animate-toast-in`}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <p className="flex-1 text-body-sm font-medium text-fg-primary leading-snug">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-fg-tertiary hover:text-fg-secondary transition-colors mt-0.5"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-5 z-50 flex flex-col gap-2 pb-safe">
      {toasts.map((t) => (
        <ToastItem key={t.id} {...t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
