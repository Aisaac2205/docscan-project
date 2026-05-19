'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/features/documents/store';
import { ExtractedDataModal } from '@/features/documents/components/ExtractedDataModal';
import { EyeIcon, TrashIcon, FileIcon, PdfIcon } from '@/shared/ui/icons';
import { Badge, type BadgeVariant } from '@/shared/components/ui';
import type { Document } from '@/features/documents/types/document.types';

function relativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();

  if (diffMs < 0) {
    return date.toLocaleDateString('es-GT', { day: '2-digit', month: 'short' });
  }

  const diffMins = Math.floor(diffMs / 60_000);
  if (diffMins < 1) return 'Ahora';
  if (diffMins < 60) return `Hace ${diffMins} min`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;

  return date.toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: new Date().getFullYear() !== date.getFullYear() ? 'numeric' : undefined,
  });
}

function statusBadge(status: Document['status']) {
  const map: Record<Document['status'], { label: string; variant: BadgeVariant }> = {
    completed: { label: 'Completado', variant: 'success' },
    pending: { label: 'Pendiente', variant: 'warning' },
    processing: { label: 'Procesando', variant: 'warning' },
    failed: { label: 'Falló', variant: 'danger' },
  };

  const { label, variant } = map[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function DataIcon({ className = '', size = 13 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 13 13" fill="none" className={className}>
      <path
        d="M4 3L1.5 6.5 4 10M9 3l2.5 3.5L9 10M7.5 1l-2 12"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RecentScansFeed() {
  const { documents, deleteDocument } = useDocumentStore();
  const [modalDoc, setModalDoc] = useState<Document | null>(null);

  const recent = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  if (recent.length === 0) {
    return (
      <div className="mb-5">
        <h3 className="text-overline text-overline-uppercase text-fg-tertiary mb-3">
          Escaneos recientes
        </h3>
        <div className="bg-surface-card border border-border rounded-md px-5 py-8 text-center">
          <FileIcon size={28} className="mx-auto text-border-strong mb-3" />
          <p className="text-body-sm text-fg-tertiary">
            Aún no hay documentos. Subí tu primer archivo arriba.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-5">
      <h3 className="text-overline text-overline-uppercase text-fg-tertiary mb-3">
        Escaneos recientes
      </h3>

      <div className="bg-surface-card border border-border rounded-md stagger-children overflow-hidden">
        {recent.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-b-0"
          >
            <div className="w-10 h-10 rounded-md bg-surface-sunken flex items-center justify-center flex-shrink-0 overflow-hidden text-fg-tertiary">
              {doc.mimeType.startsWith('image/') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.filePath}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : doc.mimeType === 'application/pdf' ? (
                <PdfIcon size={36} />
              ) : (
                <FileIcon size={14} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-body-sm font-medium text-fg-primary truncate">
                  {doc.originalName}
                </p>
                {statusBadge(doc.status)}
              </div>
              <p className="text-caption text-fg-tertiary mt-0.5">
                {relativeDate(doc.createdAt)}
              </p>
            </div>

            <div className="flex items-center gap-0.5 flex-shrink-0">
              <a
                href={doc.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 w-7 flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors"
                title="Ver documento"
              >
                <EyeIcon size={14} />
              </a>

              <button
                type="button"
                onClick={() => setModalDoc(doc)}
                className="h-7 w-7 flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors"
                title="Ver datos extraídos"
              >
                <DataIcon size={13} />
              </button>

              <button
                type="button"
                onClick={() => deleteDocument(doc.id)}
                className="h-7 w-7 flex items-center justify-center text-fg-tertiary hover:text-danger-fg hover:bg-danger-bg rounded-md transition-colors"
                title="Eliminar"
              >
                <TrashIcon size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalDoc && (
        <ExtractedDataModal
          isOpen
          onClose={() => setModalDoc(null)}
          data={modalDoc.extractedData}
          documentName={modalDoc.originalName}
        />
      )}
    </div>
  );
}
