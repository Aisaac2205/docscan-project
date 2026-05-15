'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/shared/components/Layout';
import { usePerson } from '@/features/persons/hooks/usePerson';
import { PersonForm } from '@/features/persons/components/PersonForm';
import { PersonStatusBadge, PersonRoleBadge } from '@/features/persons/components/PersonStatusBadge';
import { IdentityPanel } from '@/features/persons/components/profile/IdentityPanel';
import { FiscalPanel } from '@/features/persons/components/profile/FiscalPanel';
import { BackgroundPanel } from '@/features/persons/components/profile/BackgroundPanel';
import { MedicalHistoryPanel } from '@/features/persons/components/profile/MedicalHistoryPanel';
import { ConflictsPanel } from '@/features/persons/components/profile/ConflictsPanel';
import { DocumentsPanel } from '@/features/persons/components/profile/DocumentsPanel';
import { CompliancePanel } from '@/features/persons/components/profile/CompliancePanel';
import { EvaluationsPanel } from '@/features/persons/components/profile/EvaluationsPanel';

interface PersonDetailViewProps {
  personId: string;
}

type Tab = 'profile' | 'documents' | 'compliance' | 'health' | 'evaluations' | 'edit';

const TABS: { value: Tab; label: string }[] = [
  { value: 'profile', label: 'Perfil' },
  { value: 'documents', label: 'Documentos' },
  { value: 'compliance', label: 'Verificación' },
  { value: 'health', label: 'Salud' },
  { value: 'evaluations', label: 'Análisis con IA' },
  { value: 'edit', label: 'Editar datos' },
];

export function PersonDetailView({ personId }: PersonDetailViewProps) {
  const router = useRouter();
  const { data, loading, error, refresh, update } = usePerson(personId);
  const [tab, setTab] = useState<Tab>('profile');

  if (loading && !data) {
    return (
      <div className="animate-fade-in" aria-busy="true">
        <div className="h-6 w-48 rounded bg-surface-sunken animate-pulse mb-2" />
        <div className="h-8 w-72 rounded bg-surface-sunken animate-pulse mb-6" />
        <div className="h-40 rounded-md bg-surface-sunken animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => router.back()}
          className="text-caption text-fg-tertiary hover:text-fg-primary mb-4"
        >
          ← Volver
        </button>
        <div role="alert" className="p-4 bg-danger-bg border border-danger-border rounded-md">
          <p className="text-body-sm text-danger-fg">
            {error ?? 'No se pudo cargar la persona.'}
          </p>
        </div>
      </div>
    );
  }

  const { person, profile } = data;

  return (
    <div className="animate-fade-in">
      {/* Top bar */}
      <button
        onClick={() => router.push('/persons')}
        className="flex items-center gap-1.5 text-caption text-fg-tertiary hover:text-fg-primary mb-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
          <path d="M7.5 2L3.5 6L7.5 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver a Personas
      </button>

      {/* Header */}
      <header className="mb-5 md:mb-6">
        <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">
          Persona
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <Heading level={1}>{person.fullName}</Heading>
          <PersonRoleBadge role={person.role} />
          <PersonStatusBadge status={person.status} />
        </div>
        <div className="mt-2 text-body-sm text-fg-secondary space-x-4">
          {person.cui && <span>CUI: <span className="font-mono">{person.cui}</span></span>}
          {person.email && <span>{person.email}</span>}
          {person.phone && <span>{person.phone}</span>}
        </div>
      </header>

      {/* Tabs */}
      <nav role="tablist" aria-label="Secciones" className="flex flex-wrap gap-1 border-b border-border mb-6">
        {TABS.map(({ value, label }) => {
          const active = tab === value;
          return (
            <button
              key={value}
              role="tab"
              aria-selected={active}
              onClick={() => setTab(value)}
              className={`px-3 py-2 text-button-sm border-b-2 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-t-sm ${
                active
                  ? 'border-fg-primary text-fg-primary'
                  : 'border-transparent text-fg-tertiary hover:text-fg-primary'
              }`}
            >
              {label}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      {tab === 'profile' && (
        <div className="space-y-5">
          <ConflictsPanel conflicts={profile.conflicts} />
          <IdentityPanel data={profile.identity} />
          <FiscalPanel data={profile.fiscal} />
          <BackgroundPanel data={profile.background} />
        </div>
      )}

      {tab === 'documents' && <DocumentsPanel personId={person.id} />}

      {tab === 'compliance' && <CompliancePanel personId={person.id} />}

      {tab === 'health' && (
        <MedicalHistoryPanel entries={profile.medicalHistory} />
      )}

      {tab === 'evaluations' && <EvaluationsPanel personId={person.id} />}

      {tab === 'edit' && (
        <section aria-label="Editar datos de la persona" className="bg-surface-card border border-border rounded-md p-4 md:p-5 max-w-2xl">
          <PersonForm
            initial={person}
            submitLabel="Guardar cambios"
            onSubmit={async (input) => {
              await update(input);
              await refresh();
              setTab('profile');
            }}
          />
        </section>
      )}
    </div>
  );
}
