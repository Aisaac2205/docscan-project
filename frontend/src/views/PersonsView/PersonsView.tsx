'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { Heading } from '@/shared/components/Layout';
import { Dialog, DialogContent } from '@/shared/components/ui';
import { PersonForm } from '@/features/persons/components/PersonForm';
import { PersonsListPanel } from '@/features/persons/components/PersonsListPanel';
import { PersonDetailPanel } from '@/features/persons/components/PersonDetailPanel';
import { PersonMetricsRow } from '@/features/persons/components/PersonMetricsRow';
import { EmptyDetailState } from '@/features/persons/components/EmptyDetailState';
import { usePersonsMasterDetail } from '@/features/persons/hooks/usePersonsMasterDetail';
import { personsApi } from '@/features/persons/api/personsApi';
import { PersonsMasterDetailShell } from './PersonsMasterDetailShell';

export function PersonsView() {
  const router = useRouter();
  const { selectedId, select } = usePersonsMasterDetail();
  const [newOpen, setNewOpen] = useState(false);

  const isDesktop = useIsDesktop();

  const handleSelect = useCallback(
    (id: string) => {
      if (isDesktop) {
        select(id);
      } else {
        router.push(`/persons/${id}`);
      }
    },
    [isDesktop, select, router],
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5 md:mb-6">
        <div>
          <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">RRHH</p>
          <Heading level={1}>Personas</Heading>
          <p className="text-body-sm text-fg-secondary mt-1">
            Gestioná candidatos y empleados con sus datos extraídos.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setNewOpen(true)}
          className="self-start md:self-auto inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-button bg-fg-primary text-fg-inverse hover:opacity-90 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
        >
          <UserPlus width={16} height={16} aria-hidden="true" />
          Nueva persona
        </button>
      </div>

      {/* Metrics */}
      <div className="mb-5 md:mb-6">
        <PersonMetricsRow />
      </div>

      {/* Master-detail */}
      <PersonsMasterDetailShell
        list={<PersonsListPanel selectedId={selectedId} onSelect={handleSelect} />}
        detail={
          selectedId ? (
            <PersonDetailPanel personId={selectedId} />
          ) : (
            <EmptyDetailState />
          )
        }
      />

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent
          title="Nueva persona"
          description="Cargá los datos básicos. Vas a poder asignar documentos después."
          size="md"
        >
          <PersonForm
            submitLabel="Crear persona"
            onSubmit={async (input) => {
              const created = await personsApi.create(input);
              setNewOpen(false);
              handleSelect(created.id);
            }}
            onCancel={() => setNewOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return isDesktop;
}
