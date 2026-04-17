'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useDocumentStore } from '@/features/documents/store';
import { DocumentCard } from '@/features/documents/components/DocumentCard';
import { DocumentViewerModal } from '@/features/documents/components/DocumentViewerModal';
import type { Document } from '@/features/documents/types/document.types';
import { printDocument } from '@/features/documents/utils/print';

export function DocumentsView() {
  const { documents, loading, fetchDocuments, deleteDocument } = useDocumentStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const activeDoc = activeDocId ? documents.find((doc) => doc.id === activeDocId) ?? null : null;
  const openDocId = searchParams.get('open');

  useEffect(() => { fetchDocuments(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!openDocId) return;
    const exists = documents.some((doc) => doc.id === openDocId);
    if (!exists) return;

    setActiveDocId(openDocId);
    router.replace(pathname);
  }, [openDocId, documents, router, pathname]);

  const handleDelete = (id: string) => {
    deleteDocument(id);
    if (activeDocId === id) setActiveDocId(null);
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
          <h1 className="text-lg md:text-xl font-semibold text-stone-900">Documentos</h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {documents.length} documento{documents.length !== 1 ? 's' : ''} en tu biblioteca
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {documents.map((doc) => (
          <DocumentCard
            key={doc.id}
            doc={doc}
            onOpen={(selectedDoc: Document) => setActiveDocId(selectedDoc.id)}
            onDelete={handleDelete}
            onPrint={printDocument}
          />
        ))}
      </div>

      {/* Modal visor */}
      {activeDoc && (
        <DocumentViewerModal
          key={activeDoc.id}
          doc={activeDoc}
          onClose={() => setActiveDocId(null)}
          onDeleted={handleDelete}
        />
      )}
    </div>
  );
}
