'use client';

import { Heading } from '@/shared/components/Layout';
import { useInboxDocuments } from '@/features/documents/hooks/useInboxDocuments';
import { InboxItem } from '@/features/documents/components/InboxItem';

export function InboxView() {
  const { documents, loading, error, refresh } = useInboxDocuments();

  const handleAssigned = async () => {
    await refresh();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 md:mb-7">
        <div>
          <p className="text-overline text-overline-uppercase text-fg-tertiary mb-0.5">RRHH</p>
          <Heading level={1}>Bandeja de entrada</Heading>
          <p className="text-body-sm text-fg-secondary mt-1">
            Documentos procesados que aún no están asociados a una persona.
          </p>
        </div>
        <button
          onClick={refresh}
          className="text-body-sm text-fg-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
          {error}
        </div>
      )}

      {loading ? (
        <div aria-busy="true" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-md bg-surface-sunken animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-body-sm text-fg-secondary font-medium mb-1">No hay documentos pendientes de asignar.</p>
          <p className="text-caption text-fg-tertiary">
            Cuando proceses un documento sin elegir persona, va a aparecer acá.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((d) => (
            <InboxItem key={d.id} doc={d} onAssigned={handleAssigned} />
          ))}
        </div>
      )}
    </div>
  );
}
