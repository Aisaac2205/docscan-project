'use client';

import { useEffect } from 'react';
import { useDocumentStore } from '@/features/documents/store';
import { DocumentCard } from '@/features/documents/components/DocumentCard';
import { printDocument } from '@/features/documents/utils/print';

export function DocumentsView() {
  const { documents, loading, fetchDocuments, deleteDocument } = useDocumentStore();

  useEffect(() => { fetchDocuments(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = (id: string) => {
    deleteDocument(id);
  };

  if (loading && documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
        Cargando documentos...
      </div>
    );
  }

  if (!loading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 gap-2">
        <p className="text-stone-500 text-sm">No hay documentos aún.</p>
        <p className="text-stone-400 text-xs">Sube o escanea uno para comenzar.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-[length:var(--text-heading-xl)] font-semibold text-stone-900">Documentos</h1>
          <p className="text-sm lg:text-base text-stone-400 mt-0.5">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} en tu biblioteca
          </p>
        </div>
      </div>

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
    </div>
  );
}
