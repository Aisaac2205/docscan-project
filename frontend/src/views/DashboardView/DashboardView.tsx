'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { WelcomeBanner } from '@/features/dashboard/components/WelcomeBanner';
import { ActionCard } from '@/features/dashboard/components/ActionCard';
import { UploadZone } from '@/features/dashboard/components/UploadZone';
import { RecentDocumentCard } from '@/features/dashboard/components/RecentDocumentCard';
import { DashboardFooter } from '@/features/dashboard/components/DashboardFooter';
import { StatCard } from '@/shared/components/data-display';
import { Skeleton } from '@/shared/components/ui';
import { RecentActivity } from '@/features/dashboard/components/RecentActivity';

export function DashboardView() {
  const { firstName, recentDocuments, stats, statsLoading, statsError } = useDashboardStats();
  const router = useRouter();

  return (
    <div className="animate-fade-in">
      {/* Top bar interno */}
      <div className="flex items-center justify-between mb-5 md:mb-7">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-0.5">Panel</p>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900">Centro de procesamiento de documentos</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm">
            <SearchIcon />
            <input
              type="text"
              placeholder="Buscar documentos..."
              aria-label="Buscar documentos"
              className="bg-transparent outline-none text-stone-800 placeholder-stone-400 w-44 md:w-64 lg:w-80 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Welcome Banner */}
      <WelcomeBanner firstName={firstName} />

      {/* KPIs */}
      <section aria-labelledby="kpis-heading" className="mb-6 md:mb-8">
        <h2 id="kpis-heading" className="sr-only">Indicadores del día</h2>
        {statsError && (
          <div
            role="alert"
            className="mb-3 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"
          >
            No pudimos cargar las métricas: {statsError}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 stagger-children">
          {statsLoading ? (
            <>
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </>
          ) : (
            <>
              <StatCard
                icon={<PersonsIcon />}
                label="Personas activas"
                value={String(stats?.activePersons ?? 0)}
              />
              <StatCard
                icon={<InboxIcon />}
                label="Sin asignar"
                value={String(stats?.unassignedDocuments ?? 0)}
              />
              <StatCard
                icon={<HealthIcon />}
                label="Constancias pendientes"
                value={String(stats?.pendingHealthRecords ?? 0)}
              />
              <StatCard
                icon={<DocumentIcon />}
                label="Total registrados"
                value={String(stats?.totalPersons ?? 0)}
              />
            </>
          )}
        </div>
      </section>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 stagger-children">
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

      {/* Upload Zone */}
      <UploadZone />

      {/* Recent Activity */}
      <div className="mb-6 md:mb-8">
        <RecentActivity items={stats?.recentActivity ?? []} loading={statsLoading} />
      </div>

      {/* Recent Documents */}
      {recentDocuments.length > 0 && (
        <div className="mb-6 md:mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-stone-800">Documentos recientes</h2>
            <button
              onClick={() => router.push('/documents')}
              className="text-sm text-stone-600 hover:text-stone-900 font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
            >
              Ver todos
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 stagger-children">
            {recentDocuments.map((doc) => (
              <RecentDocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
}

/* ---- Iconos inline ---- */

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
      <circle cx="6.5" cy="6.5" r="4" stroke="#A8A29E" strokeWidth="1.3" />
      <path d="M9.5 9.5L13 13" stroke="#A8A29E" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 3h7l3 3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 3v3h3" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PersonsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 17c0-3 2.91-5.25 6.5-5.25S16.5 14 16.5 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 11v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M3 11l2.5-7h9L17 11" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6 11h2.5l1 2h1l1-2H14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HealthIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
