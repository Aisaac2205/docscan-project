'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Heading } from '@/shared/components/Layout';
import { useDocumentStore } from '@/features/documents/store';
import { DocumentCard } from '@/features/documents/components/DocumentCard';
import { printDocument } from '@/features/documents/utils/print';

type FilterKey = 'all' | 'unassigned';

export function DocumentsView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filter: FilterKey = searchParams.get('filter') === 'unassigned' ? 'unassigned' : 'all';

  const { documents, loading, fetchDocuments, deleteDocument } = useDocumentStore();

  useEffect(() => {
    fetchDocuments(filter === 'unassigned' ? { unassigned: true } : undefined);
  }, [filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (id: string) => {
    deleteDocument(id);
  };

  const setFilter = (next: FilterKey) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next === 'all') params.delete('filter');
    else params.set('filter', next);
    const qs = params.toString();
    router.replace(qs ? `/documents?${qs}` : '/documents');
  };

  const tabs: { key: FilterKey; label: string }[] = [
    { key: 'all', label: 'Todos' },
    { key: 'unassigned', label: 'Sin asignar' },
  ];

  const emptyCopy =
    filter === 'unassigned'
      ? {
          title: 'No hay documentos pendientes de asignar.',
          hint: 'Cuando proceses un documento sin elegir persona, va a aparecer acá.',
        }
      : {
          title: 'No hay documentos aún.',
          hint: 'Sube o escanea uno para comenzar.',
        };

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <Heading level={1}>Documentos</Heading>
          <p className="text-body-sm text-fg-tertiary mt-0.5">
            {filter === 'unassigned'
              ? 'Documentos procesados que aún no están asociados a una persona.'
              : `${documents.length} documento${documents.length !== 1 ? 's' : ''} en tu biblioteca`}
          </p>
        </div>
      </div>

      <div role="tablist" aria-label="Filtros de documentos" className="flex gap-1 mb-4 border-b border-border">
        {tabs.map((tab) => {
          const active = filter === tab.key;
          return (
            <button
              key={tab.key}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.key)}
              className={`px-3 py-2 text-button-sm rounded-t-md transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] ${
                active
                  ? 'text-fg-primary border-b-2 border-fg-primary -mb-px'
                  : 'text-fg-secondary hover:text-fg-primary'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading && documents.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-fg-tertiary text-body-sm">
          Cargando documentos...
        </div>
      ) : !loading && documents.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 gap-2">
          <p className="text-fg-secondary text-body-sm">{emptyCopy.title}</p>
          <p className="text-fg-tertiary text-caption">{emptyCopy.hint}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              onDelete={handleDelete}
              onPrint={printDocument}
            />
          ))}
        </div>
      )}
    </div>
  );
}
