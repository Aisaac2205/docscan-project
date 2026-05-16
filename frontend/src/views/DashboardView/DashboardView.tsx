'use client';

import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { DashboardGreeting } from '@/features/dashboard/components/DashboardGreeting';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { ActivityFeed } from '@/features/dashboard/components/ActivityFeed';
import { WeeklyProcessingChart } from '@/features/dashboard/components/WeeklyProcessingChart';
import { DocumentTypesChart } from '@/features/dashboard/components/DocumentTypesChart';
import { ProcessingStatusChart } from '@/features/dashboard/components/ProcessingStatusChart';
import { DashboardFooter } from '@/features/dashboard/components/DashboardFooter';
import { toMetricDelta } from '@/features/dashboard/api/dashboardApi';

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

// ---------------------------------------------------------------------------
// DashboardView
// ---------------------------------------------------------------------------

export function DashboardView() {
  const { firstName, userLoading, stats, statsLoading, statsError, refreshStats } =
    useDashboardStats();

  return (
    <div className="animate-fade-in space-y-6 md:space-y-8">

      {/* ── Greeting header ─────────────────────────────────────────────── */}
      <DashboardGreeting
        firstName={firstName}
        userLoading={userLoading}
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
            value={stats ? String(stats.documentsProcessedToday) : undefined}
            delta={stats ? toMetricDelta(stats.documentsProcessedTodayDelta) : undefined}
            sparkline={stats?.documentsProcessedWeekly}
          />

          <MetricCard
            isLoading={statsLoading}
            icon={<AccuracyIcon />}
            label="Precisión OCR"
            value={stats ? `${stats.ocrPrecision.toFixed(1)}%` : undefined}
            delta={stats ? toMetricDelta(stats.ocrPrecisionDelta) : undefined}
            sparkline={stats?.ocrPrecisionWeekly}
          />

          <MetricCard
            isLoading={statsLoading}
            icon={<TimerIcon />}
            label="Tiempo promedio"
            value={stats ? `${stats.avgProcessingTime.toFixed(1)}s` : undefined}
            delta={stats ? toMetricDelta(stats.avgProcessingTimeDelta) : undefined}
            sparkline={stats?.avgProcessingTimeWeekly}
            invertPolarity
          />

          <MetricCard
            isLoading={statsLoading}
            icon={<PendingIcon />}
            label="Pendientes de revisión"
            value={stats ? String(stats.pendingReview) : undefined}
            delta={stats ? toMetricDelta(stats.pendingReviewDelta) : undefined}
            sparkline={stats?.pendingReviewWeekly}
            invertPolarity
          />

        </div>
      </section>

      {/* ── Charts row: weekly (2/3) + types (1/3) ──────────────────────── */}
      <section
        aria-labelledby="charts-heading"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6"
      >
        <h2 id="charts-heading" className="sr-only">Análisis</h2>
        <div className="lg:col-span-2 min-w-0">
          <WeeklyProcessingChart
            data={stats?.weeklyProcessing}
            loading={statsLoading}
          />
        </div>
        <div className="min-w-0">
          <DocumentTypesChart
            data={stats?.documentTypes}
            loading={statsLoading}
          />
        </div>
      </section>

      {/* ── Status chart (full width) ───────────────────────────────────── */}
      <ProcessingStatusChart
        data={stats?.processingStatus}
        loading={statsLoading}
      />

      {/* ── Activity feed ───────────────────────────────────────────────── */}
      <ActivityFeed
        items={stats?.recentActivity ?? []}
        loading={statsLoading}
      />

      <DashboardFooter />
    </div>
  );
}
