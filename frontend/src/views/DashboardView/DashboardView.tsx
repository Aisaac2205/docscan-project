'use client';

import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { DashboardGreeting } from '@/features/dashboard/components/DashboardGreeting';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { ActionCard } from '@/features/dashboard/components/ActionCard';

import { DashboardFooter } from '@/features/dashboard/components/DashboardFooter';

// ---------------------------------------------------------------------------
// Icons — fg-tertiary, uniform color across all cards
// ---------------------------------------------------------------------------

function DocsTodayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 3v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AccuracyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TimerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 8v3l2 1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 2h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PendingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 11v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 11l2.5-7h9L17 11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 11h2.5l1 2h1l1-2H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadCardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 15V4M10 4L5 9M10 4l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v10M10 14l-3-3M10 14l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 17v1a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 6v4l2.5 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.93 4.93l1.41 1.41M13.66 13.66l1.41 1.41M4.93 15.07l1.41-1.41M13.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DashboardView
// ---------------------------------------------------------------------------

export function DashboardView() {
  const { firstName, stats, statsLoading, statsError, refreshStats } =
    useDashboardStats();

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">

      {/* ── Greeting header ─────────────────────────────────────────────── */}
      <DashboardGreeting
        firstName={firstName}
        ocrEngineOnline={stats?.ocrEngineOnline}
        activeWorkers={stats?.activeWorkers}
      />

      {/* ── Error banner ────────────────────────────────────────────────── */}
      {statsError && (
        <div
          role="alert"
          className="px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg"
        >
          No pudimos cargar las métricas: {statsError}
          <button
            onClick={refreshStats}
            className="ml-3 underline font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* ── Metric grid (2 cols mobile, 4 cols desktop) ─────────────────── */}
      <section aria-labelledby="metrics-heading">
        <h2 id="metrics-heading" className="sr-only">Métricas del día</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">

          <MetricCard
            isLoading={statsLoading}
            icon={<DocsTodayIcon />}
            label="Procesados hoy"
            value={
              stats?.documentsProcessedToday !== undefined
                ? String(stats.documentsProcessedToday)
                : undefined
            }
            delta={stats?.documentsProcessedDelta}
            sparkline={stats?.documentsProcessedSparkline}
          />

          <MetricCard
            isLoading={statsLoading}
            icon={<AccuracyIcon />}
            label="Precisión OCR"
            value={
              stats?.ocrAccuracyAvgPercent !== undefined
                ? `${stats.ocrAccuracyAvgPercent.toFixed(1)}%`
                : undefined
            }
            delta={stats?.ocrAccuracyDelta}
            sparkline={stats?.ocrAccuracySparkline}
          />

          <MetricCard
            isLoading={statsLoading}
            icon={<TimerIcon />}
            label="Tiempo promedio"
            value={
              stats?.avgProcessingTimeSeconds !== undefined
                ? `${stats.avgProcessingTimeSeconds.toFixed(1)}s`
                : undefined
            }
            delta={stats?.processingTimeDelta}
            sparkline={stats?.processingTimeSparkline}
            invertPolarity
          />

          <MetricCard
            isLoading={statsLoading}
            icon={<PendingIcon />}
            label="Pendientes de revisión"
            value={
              stats?.pendingReviewCount !== undefined
                ? String(stats.pendingReviewCount)
                : undefined
            }
            delta={stats?.pendingReviewDelta}
            sparkline={stats?.pendingReviewSparkline}
            invertPolarity
          />

        </div>
      </section>

      {/* ── Quick actions ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">
        <ActionCard
          icon={<UploadCardIcon />}
          title="Subir documentos"
          description="Formatos PDF, JPG, PNG"
          href="/scan"
        />
        <ActionCard
          icon={<ExportIcon />}
          title="Exportar resultados"
          description="Formatos TXT, DOCX, CSV"
        />
        <ActionCard
          icon={<HistoryIcon />}
          title="Archivos recientes"
          description="Ver historial de procesamiento"
          href="/documents"
        />
        <ActionCard
          icon={<SettingsIcon />}
          title="Configuración"
          description="Personalizá tu experiencia"
        />
      </div>

      {/* ── Activity feed ───────────────────────────────────────────────── */}
      <ActivityFeed
        items={stats?.recentActivity ?? []}
        loading={statsLoading}
      />

      <DashboardFooter />
    </div>
  );
}
