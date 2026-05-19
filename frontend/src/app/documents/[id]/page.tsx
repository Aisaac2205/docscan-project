'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { documentsClient } from '@/features/documents/client';
import type { Document } from '@/features/documents/types/document.types';
import { DocumentDetailView } from '@/views/DocumentDetailView/DocumentDetailView';

export default function Page() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    documentsClient
      .get(id)
      .then((fetched) => {
        if (active) setDoc(fetched);
      })
      .catch(() => {
        if (active) router.push('/documents');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, router]);

  if (loading && !doc) {
    return (
      <div className="flex items-center justify-center h-96 text-fg-tertiary text-body-sm">
        Cargando documento…
      </div>
    );
  }

  if (!doc) return null;

  return <DocumentDetailView doc={doc} />;
}
