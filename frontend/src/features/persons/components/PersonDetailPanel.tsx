'use client';

import { useState } from 'react';
import { Pencil, Link2 } from 'lucide-react';
import { Heading } from '@/shared/components/Layout';
import { usePerson } from '../hooks/usePerson';
import { usePersonCompleteness } from '../hooks/usePersonCompleteness';
import { PersonStatusBadge, PersonRoleBadge } from './PersonStatusBadge';
import { HiredRoleSuggestionBanner } from './HiredRoleSuggestionBanner';
import { PersonRequiredDocsChecklist } from './PersonRequiredDocsChecklist';
import { ConflictsPanel } from './profile/ConflictsPanel';
import { IdentityPanel } from './profile/IdentityPanel';
import { FiscalPanel } from './profile/FiscalPanel';
import { BackgroundPanel } from './profile/BackgroundPanel';
import { DocumentsPanel } from './profile/DocumentsPanel';
import { CompliancePanel } from './profile/CompliancePanel';
import { MedicalHistoryPanel } from './profile/MedicalHistoryPanel';
import { EvaluationsPanel } from './profile/EvaluationsPanel';
import { EditPersonDialog } from './EditPersonDialog';
import { LinkDocumentDialog } from '@/features/documents/components/LinkDocumentDialog';

type Tab = 'profile' | 'documents' | 'compliance' | 'health' | 'evaluations';

const TABS: { value: Tab; label: string }[] = [
  { value: 'profile', label: 'Perfil' },
  { value: 'documents', label: 'Documentos' },
  { value: 'compliance', label: 'Verificación' },
  { value: 'health', label: 'Salud' },
  { value: 'evaluations', label: 'Análisis con IA' },
];

interface PersonDetailPanelProps {
  personId: string;
}

export function PersonDetailPanel({ personId }: PersonDetailPanelProps) {
  const { data, loading, error, refresh, update } = usePerson(personId);
  const { data: completeness, refresh: refreshCompleteness } = usePersonCompleteness(personId);
  const [tab, setTab] = useState<Tab>('profile');
  const [editOpen, setEditOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);

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
      <div role="alert" className="p-4 bg-danger-bg border border-danger-border rounded-md">
        <p className="text-body-sm text-danger-fg">{error ?? 'No se pudo cargar la persona.'}</p>
      </div>
    );
  }

  const { person, profile } = data;

  const reloadAll = async () => {
    await Promise.all([refresh(), refreshCompleteness()]);
  };

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Header */}
      <header className="mb-4 md:mb-5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">Persona</p>
            <div className="flex items-center gap-2.5 flex-wrap">
              <Heading level={2} as="h1" className="text-fg-primary">{person.fullName}</Heading>
              <PersonRoleBadge role={person.role} />
              <PersonStatusBadge status={person.status} />
            </div>
            <div className="mt-1.5 text-caption text-fg-secondary space-x-3">
              {person.cui && <span>CUI: <span className="font-mono">{person.cui}</span></span>}
              {person.email && <span>{person.email}</span>}
              {person.phone && <span>{person.phone}</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setLinkOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-button-sm border border-border bg-surface-card text-fg-primary hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
            >
              <Link2 width={14} height={14} aria-hidden="true" />
              Vincular documento
            </button>
            <button
              type="button"
              onClick={() => setEditOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-button-sm border border-border bg-surface-card text-fg-primary hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
            >
              <Pencil width={14} height={14} aria-hidden="true" />
              Editar
            </button>
          </div>
        </div>
      </header>

      <HiredRoleSuggestionBanner person={person} onChanged={reloadAll} />

      {/* Tabs */}
      <nav role="tablist" aria-label="Secciones" className="flex flex-wrap gap-1 border-b border-border mt-4 mb-5">
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
      <div className="flex-1 min-h-0">
        {tab === 'profile' && (
          <div className="space-y-5">
            {completeness && (
              <PersonRequiredDocsChecklist
                done={completeness.done}
                total={completeness.total}
                slots={completeness.slots}
                onLinkDocument={() => setLinkOpen(true)}
              />
            )}
            <ConflictsPanel conflicts={profile.conflicts} />
            <IdentityPanel data={profile.identity} />
            <FiscalPanel data={profile.fiscal} />
            <BackgroundPanel data={profile.background} onClassified={reloadAll} />
          </div>
        )}

        {tab === 'documents' && <DocumentsPanel personId={person.id} />}
        {tab === 'compliance' && <CompliancePanel personId={person.id} />}
        {tab === 'health' && <MedicalHistoryPanel entries={profile.medicalHistory} />}
        {tab === 'evaluations' && <EvaluationsPanel personId={person.id} />}
      </div>

      <EditPersonDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        person={person}
        onSubmit={async (input) => {
          await update(input);
          await reloadAll();
          setEditOpen(false);
        }}
      />

      <LinkDocumentDialog
        open={linkOpen}
        onOpenChange={setLinkOpen}
        personId={person.id}
        personName={person.fullName}
        onLinked={reloadAll}
      />
    </div>
  );
}
