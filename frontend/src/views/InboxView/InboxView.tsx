'use client';

import { useInboxDocuments } from '@/features/documents/hooks/useInboxDocuments';
import { InboxItem } from '@/features/documents/components/InboxItem';

export function InboxView() {
  const { documents, loading, error, refresh } = useInboxDocuments();

  const handleAssigned = async () => {
    // refresh after a short delay to let the backend settle
    await refresh();
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 md:mb-7">
        <div>
          <p className="text-xs text-stone-400 uppercase tracking-wider font-semibold mb-0.5">RRHH</p>
          <h1 className="text-xl md:text-2xl font-semibold text-stone-900">Bandeja de entrada</h1>
          <p className="text-sm text-stone-500 mt-1">
            Documentos procesados que aún no están asociados a una persona.
          </p>
        </div>
        <button
          onClick={refresh}
          className="text-sm text-stone-600 hover:text-stone-900 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700 rounded-sm"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-4 px-3 py-2 bg-stone-100 border border-stone-300 rounded-lg text-sm text-stone-800">
          {error}
        </div>
      )}

      {loading ? (
        <div aria-busy="true" className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 rounded-xl bg-stone-100 animate-pulse" />
          ))}
        </div>
      ) : documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-sm text-stone-500 font-medium mb-1">No hay documentos pendientes de asignar.</p>
          <p className="text-xs text-stone-400">
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
