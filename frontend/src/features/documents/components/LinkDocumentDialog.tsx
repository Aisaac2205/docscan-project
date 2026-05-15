'use client';

import { useState } from 'react';
import { FileText, Search } from 'lucide-react';
import { Dialog, DialogContent } from '@/shared/components/ui';
import { useInboxDocuments } from '../hooks/useInboxDocuments';
import { documentsAssignApi } from '@/features/persons/api/personsApi';

interface LinkDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personId: string;
  personName: string;
  onLinked?: () => void | Promise<void>;
}

const DOC_TYPE_LABEL: Record<string, string> = {
  id_card: 'DPI / Pasaporte',
  fiscal_social: 'RTU / NIT',
  background_check: 'Antecedentes',
  medical_cert: 'Constancia médica',
  cv: 'Currículum',
  general: 'Documento general',
  custom: 'Personalizado',
  document: 'Documento',
};

export function LinkDocumentDialog({
  open,
  onOpenChange,
  personId,
  personName,
  onLinked,
}: LinkDocumentDialogProps) {
  const { documents, loading, error, refresh } = useInboxDocuments();
  const [query, setQuery] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const filtered = documents.filter((d) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      d.originalName.toLowerCase().includes(q) ||
      (DOC_TYPE_LABEL[d.documentType ?? ''] ?? '').toLowerCase().includes(q)
    );
  });

  const handleLink = async (documentId: string) => {
    setSubmitting(documentId);
    setLinkError(null);
    try {
      await documentsAssignApi.assign(documentId, personId);
      await refresh();
      await onLinked?.();
      onOpenChange(false);
    } catch (err) {
      setLinkError(err instanceof Error ? err.message : 'No se pudo vincular el documento.');
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Vincular documento"
        description={`Elegí un documento de la bandeja para asignar a ${personName}.`}
        size="md"
      >
        <div className="relative mb-3">
          <Search
            width={14}
            height={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-tertiary"
            aria-hidden="true"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o tipo..."
            aria-label="Buscar documento"
            className="w-full h-10 pl-9 pr-3 rounded-md border border-border bg-surface-card text-body-sm text-fg-primary placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
          />
        </div>

        {error && (
          <div role="alert" className="mb-3 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
            {error}
          </div>
        )}
        {linkError && (
          <div role="alert" className="mb-3 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-body-sm text-danger-fg">
            {linkError}
          </div>
        )}

        <div className="max-h-[50vh] overflow-y-auto -mx-2 px-2">
          {loading ? (
            <div aria-busy="true" className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 rounded-md bg-surface-sunken animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-body-sm text-fg-secondary font-medium">
                No hay documentos pendientes que coincidan.
              </p>
              <p className="text-caption text-fg-tertiary mt-1">
                Procesá un documento sin asignar y va a aparecer acá.
              </p>
            </div>
          ) : (
            <ul role="listbox" aria-label="Documentos disponibles" className="space-y-1.5">
              {filtered.map((doc) => {
                const isSubmitting = submitting === doc.id;
                const docType = DOC_TYPE_LABEL[doc.documentType ?? ''] ?? doc.documentType ?? 'Documento';
                return (
                  <li key={doc.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={false}
                      disabled={submitting !== null}
                      onClick={() => handleLink(doc.id)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-surface-card text-left hover:border-border-strong disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]"
                    >
                      <FileText
                        width={18}
                        height={18}
                        strokeWidth={1.5}
                        className="text-fg-tertiary flex-shrink-0"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-body-sm text-fg-primary truncate">{doc.originalName}</p>
                        <p className="text-caption text-fg-tertiary">{docType}</p>
                      </div>
                      <span className="text-caption text-fg-link flex-shrink-0">
                        {isSubmitting ? 'Vinculando...' : 'Vincular'}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
