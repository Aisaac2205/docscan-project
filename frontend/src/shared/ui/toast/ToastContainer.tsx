'use client';

import type { ReactElement } from 'react';
import { useToastStore, type ToastType } from './store';

const toastConfig: Record<ToastType, { bg: string; border: string; text: string; icon: ReactElement }> = {
  success: {
    bg: 'bg-white',
    border: 'border-[var(--success-border)]',
    text: 'text-stone-800',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#DCFCE7" stroke="#BBF7D0" strokeWidth="1"/>
        <path d="M5 8l2.5 2.5L11 5.5" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  error: {
    bg: 'bg-white',
    border: 'border-[var(--error-border)]',
    text: 'text-stone-800',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#FEE2E2" stroke="#FECACA" strokeWidth="1"/>
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  info: {
    bg: 'bg-white',
    border: 'border-[var(--info-border)]',
    text: 'text-stone-800',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#DBEAFE" stroke="#BFDBFE" strokeWidth="1"/>
        <path d="M8 7v4" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="8" cy="5" r="0.75" fill="#2563EB"/>
      </svg>
    ),
  },
};

function ToastItem({
  id, message, type, onClose,
}: {
  id: string; message: string; type: ToastType; onClose: () => void;
}) {
  const config = toastConfig[type];

  return (
    <div
      className={`${config.bg} ${config.border} border rounded-lg shadow-[var(--shadow-elevated)] flex items-start gap-3 px-4 py-3 min-w-[280px] max-w-[360px] animate-toast-in`}
    >
      <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
      <p className={`flex-1 text-sm font-medium ${config.text} leading-snug`}>{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-stone-300 hover:text-stone-500 transition-colors mt-0.5"
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
