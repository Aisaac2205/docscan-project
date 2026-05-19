'use client';

import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui';
import { Heading } from '@/shared/components/Layout';
import { cn } from '@/shared/lib/cn';
import type { Document } from '../types/document.types';
import { useExtractedFields } from '../hooks/useExtractedFields';
import { formatLongDate } from '../utils/formatters';
import { getDocumentTypeLabel } from '../utils/documentTypes';
import { ConfidenceText } from './ConfidenceText';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { DocumentTypeTag } from './DocumentTypeTag';
import { ExtractedFieldsPanel } from './ExtractedFieldsPanel';
import { PdfIcon } from './PdfIcon';

interface DocumentsDetailPanelProps {
  doc: Document;
  onClose: () => void;
  onDownload: (doc: Document) => void;
  onReassign: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  className?: string;
}

function isImageDocument(doc: Document): boolean {
  if (!doc.filePath) return false;
  if (doc.mimeType?.startsWith('image/')) return true;
  return /\.(webp|jpe?g|png|gif|avif)$/i.test(doc.filePath);
}

export function DocumentsDetailPanel({
  doc,
  onClose,
  onDownload,
  onReassign,
  onDelete,
  className,
}: DocumentsDetailPanelProps) {
  const fields = useExtractedFields(doc.extractedData);
  const showImage = isImageDocument(doc);

  return (
    <aside
      className={cn('flex flex-col h-full', className)}
      aria-label={`Detalle de ${doc.originalName}`}
    >
      <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-border-subtle">
        <div className="min-w-0 space-y-1.5">
          <div className="flex items-center gap-2">
            <DocumentTypeTag type={doc.documentType} />
            <DocumentStatusBadge doc={doc} />
          </div>
          <Heading level={4} as="h2" className="text-fg-primary truncate" title={doc.originalName}>
            {doc.originalName}
          </Heading>
          <p className="text-caption text-fg-tertiary">
            {formatLongDate(doc.createdAt)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Cerrar panel"
          onClick={onClose}
          className="flex-shrink-0 inline-flex items-center justify-center h-8 w-8 rounded-md text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
        >
          <X width={16} height={16} aria-hidden="true" />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <section className="px-5 py-4 border-b border-border-subtle">
          {showImage ? (
            <div className="rounded-md overflow-hidden border border-border-subtle bg-surface-sunken">
              {/* Imagen CDN directa, sin Image de next porque el host está fuera del config. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doc.filePath}
                alt={doc.originalName}
                className="block w-full h-auto object-contain max-h-[28rem]"
              />
            </div>
          ) : (
            <PdfPlaceholder doc={doc} />
          )}
        </section>

        <section className="px-5 py-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <Heading level={5} as="h3" className="text-fg-primary">Datos extraídos</Heading>
            <div className="flex items-center gap-2 text-caption text-fg-tertiary">
              <span>Confianza:</span>
              <ConfidenceText confidence={doc.confidence} />
            </div>
          </div>

          {fields.length === 0 ? (
            <p className="text-body-sm text-fg-tertiary">
              Aún no hay datos extraídos para este documento.
            </p>
          ) : (
            <ExtractedFieldsPanel fields={fields} />
          )}
        </section>
      </div>

      <footer className="flex-shrink-0 px-5 py-3 border-t border-border-subtle bg-surface-card">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={() => onReassign(doc)}>
            Reasignar persona
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onDownload(doc)}>
            Descargar
          </Button>
          <Button variant="danger" size="sm" onClick={() => onDelete(doc)}>
            Eliminar
          </Button>
        </div>
      </footer>
    </aside>
  );
}

function PdfPlaceholder({ doc }: { doc: Document }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-border-subtle bg-surface-sunken px-6 py-12 text-center">
      <span
        className="inline-flex items-center justify-center h-16 w-16 rounded-md bg-surface-card-hover"
        aria-hidden="true"
      >
        <PdfIcon size={48} />
      </span>
      <div className="space-y-0.5">
        <p className="text-body text-fg-primary truncate max-w-xs" title={doc.originalName}>
          {doc.originalName}
        </p>
        <p className="text-caption text-fg-tertiary">
          {getDocumentTypeLabel(doc.documentType)}
        </p>
      </div>
      <a
        href={doc.filePath}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          'inline-flex items-center justify-center h-9 px-4 rounded-md',
          'bg-fg-primary text-[var(--color-fg-inverse)] text-button-sm hover:opacity-90',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]',
        )}
      >
        Abrir original
      </a>
    </div>
  );
}
