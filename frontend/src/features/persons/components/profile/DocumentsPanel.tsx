'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Heading } from '@/shared/components/Layout';
import { personsApi } from '../../api/personsApi';
import { useDocumentStore } from '@/features/documents/store';
import type { Document } from '@/features/documents/types/document.types';

interface DocumentsPanelProps {
  personId: string;
}

const DOC_TYPE_LABEL: Record<string, string> = {
  id_card: 'DPI / Pasaporte',
  fiscal_social: 'RTU',
  background_check: 'Antecedentes',
  medical_cert: 'Constancia médica',
  cv: 'Currículum',
  general: 'Documento general',
  custom: 'Personalizado',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendiente',
  processing: 'Procesando',
  completed: 'Procesado',
  failed: 'Falló',
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function DocumentsPanel({ personId }: DocumentsPanelProps) {
  const { assignToPerson } = useDocumentStore();
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await personsApi.listDocuments(personId);
      setDocs(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar documentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [personId]);

  const handleUnassign = async (id: string) => {
    await assignToPerson(id, null);
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <section
      aria-label="Documentos asociados"
      className="bg-surface-card border border-border rounded-md p-4 md:p-5"
    >
      <header className="flex items-center justify-between mb-4">
        <div>
          <Heading level={4} as="h3" className="text-fg-primary">Documentos asociados</Heading>
          <p className="text-caption text-fg-secondary mt-0.5">
            Documentos cuyos datos alimentan el perfil de esta persona.
          </p>
        </div>
        <Link
          href={`/scan?personId=${personId}`}
          className="text-caption text-fg-link hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
        >
          Procesar nuevo
        </Link>
      </header>

      {error && (
        <div role="alert" className="mb-3 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
          {error}
        </div>
      )}

      {loading ? (
        <div aria-busy="true" className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 rounded-md bg-surface-sunken animate-pulse" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <p className="text-body-sm text-fg-tertiary italic">
          Aún no hay documentos asociados. Procesá uno nuevo o asigná uno desde la bandeja de entrada.
        </p>
      ) : (
        <ul className="divide-y divide-border-subtle">
          {docs.map((d) => (
            <li key={d.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/documents/${d.id}`}
                  className="text-body-sm font-medium text-fg-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm truncate block"
                >
                  {d.originalName}
                </Link>
                <p className="text-caption text-fg-secondary mt-0.5">
                  {DOC_TYPE_LABEL[d.documentType ?? 'general'] ?? d.documentType}
                  <span className="mx-1.5 text-fg-tertiary">·</span>
                  {formatDate(d.createdAt)}
                  <span className="mx-1.5 text-fg-tertiary">·</span>
                  {STATUS_LABEL[d.status] ?? d.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleUnassign(d.id)}
                className="flex-shrink-0 text-caption text-fg-tertiary hover:text-fg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)] rounded-sm"
                aria-label={`Desasociar ${d.originalName}`}
              >
                Desasociar
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
