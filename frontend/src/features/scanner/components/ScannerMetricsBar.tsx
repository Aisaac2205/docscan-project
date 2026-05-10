'use client';

import React from 'react';
import { useScannerMetrics } from '../hooks/useScannerMetrics';

/* ──────────────── Inline Icons ──────────────── */

function DocsTodayIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="2" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="7" y="4" width="10" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 9h5M9 12h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function SuccessIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6.5 10l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function QueueIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.5v4l2.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TargetIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className}>
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function TrendUpIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M1 8.5l3-3 2 2 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 4h2.5V6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrendDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className={className}>
      <path d="M1 3.5l3 3 2-2 3.5 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 8h2.5V5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ──────────────── Mini progress bar ──────────────── */

function MiniBar({ value, colorClass }: { value: number; colorClass: string }) {
  return (
    <div className="w-full h-1.5 bg-surface-sunken rounded-full overflow-hidden mt-2">
      <div
        className={`h-full rounded-full ${colorClass} transition-all duration-500`}
        style={{ width: `${Math.round(value * 100)}%` }}
      />
    </div>
  );
}

/* ──────────────── Main Component ──────────────── */

export function ScannerMetricsBar() {
  const {
    docsToday,
    trend,
    successRate,
    processingCount,
    avgConfidence,
  } = useScannerMetrics();

  const cards = [
    {
      key: 'docs-today',
      label: 'Documentos hoy',
      value: String(docsToday),
      subtext:
        trend === 0
          ? 'Igual que ayer'
          : trend > 0
            ? `${trend > 0 ? '+' : ''}${trend}% vs ayer`
            : `${trend}% vs ayer`,
      subtextColor: trend > 0 ? 'text-success-fg' : trend < 0 ? 'text-danger-fg' : 'text-fg-tertiary',
      icon: <DocsTodayIcon />,
      iconBg: 'bg-surface-sunken text-fg-secondary',
      bar: null as { value: number; color: string } | null,
    },
    {
      key: 'success-rate',
      label: 'Tasa de éxito',
      value: successRate !== null ? `${Math.round(successRate * 100)}%` : '\u2014',
      subtext: successRate !== null ? 'Completados hoy' : 'Sin datos',
      subtextColor: 'text-fg-tertiary',
      icon: <SuccessIcon />,
      iconBg: 'bg-success-bg text-success-fg',
      bar: successRate !== null ? { value: successRate, color: 'bg-success-fg' } : null,
    },
    {
      key: 'processing',
      label: 'En cola',
      value: String(processingCount),
      subtext: processingCount > 0 ? 'Pendientes de OCR' : 'Todo listo',
      subtextColor: processingCount > 0 ? 'text-warning-fg' : 'text-fg-tertiary',
      icon: <QueueIcon />,
      iconBg: 'bg-warning-bg text-warning-fg',
      bar: null as { value: number; color: string } | null,
      pulse: processingCount > 0,
    },
    {
      key: 'confidence',
      label: 'Confianza promedio',
      value: avgConfidence !== null ? `${Math.round(avgConfidence * 100)}%` : '\u2014',
      subtext: avgConfidence !== null ? 'Calidad del OCR' : 'Sin datos',
      subtextColor: 'text-fg-tertiary',
      icon: <TargetIcon />,
      iconBg: 'bg-info-bg text-info-fg',
      bar: avgConfidence !== null ? { value: avgConfidence, color: 'bg-info-fg' } : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5 md:mb-7 stagger-children">
      {cards.map((card) => (
        <div
          key={card.key}
          className="bg-surface-card border border-border rounded-md px-4 py-4 card-interactive"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-display-lg text-fg-primary leading-none tracking-tight">
                {card.value}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                {'pulse' in card && card.pulse && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning-fg opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-warning-fg" />
                  </span>
                )}
                {'pulse' in card && !card.pulse && trend !== 0 && card.key === 'docs-today' && (
                  trend > 0
                    ? <TrendUpIcon className="text-success-fg" />
                    : <TrendDownIcon className="text-danger-fg" />
                )}
                <p className={`text-overline font-medium ${card.subtextColor}`}>
                  {card.subtext}
                </p>
              </div>
            </div>
            <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
              {card.icon}
            </div>
          </div>

          {/* Mini progress bar */}
          {card.bar && <MiniBar value={card.bar.value} colorClass={card.bar.color} />}
        </div>
      ))}
    </div>
  );
}
