'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useDocumentStore } from '@/features/documents/store';
import { DocumentDetailView } from '@/views/DocumentDetailView/DocumentDetailView';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const { documents, loading, fetchDocuments } = useDocumentStore();
  const id = typeof params.id === 'string' ? params.id : '';
  const doc = documents.find((d) => d.id === id);

  useEffect(() => {
    if (documents.length === 0 && !loading) {
      fetchDocuments();
    }
  }, [documents.length, loading, fetchDocuments]);

  useEffect(() => {
    if (!loading && documents.length > 0 && !doc) {
      router.push('/documents');
    }
  }, [loading, documents.length, doc, router]);

  if (loading && !doc) {
    return (
      <div className="flex items-center justify-center h-96 text-stone-400 text-sm">
        Cargando documento…
      </div>
    );
  }

  if (!doc) return null;

  return <DocumentDetailView doc={doc} />;
}
