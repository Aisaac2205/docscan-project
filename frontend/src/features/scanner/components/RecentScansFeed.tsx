'use client';

import React, { useState } from 'react';
import { useDocumentStore } from '@/features/documents/store';
import { ExtractedDataModal } from '@/features/documents/components/ExtractedDataModal';
import { EyeIcon, TrashIcon, FileIcon } from '@/shared/ui/icons';
import type { Document } from '@/features/documents/types/document.types';

/* ─────────────────── Helpers ─────────────────── */

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
  const map: Record<Document['status'], string> = {
    completed: 'bg-green-50 text-green-700 border-green-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    processing: 'bg-amber-50 text-amber-700 border-amber-200',
    failed: 'bg-red-50 text-red-700 border-red-200',
  };

  const labels: Record<Document['status'], string> = {
    completed: 'Completado',
    pending: 'Pendiente',
    processing: 'Procesando',
    failed: 'Falló',
  };

  return (
    <span
      className={`text-[10px] lg:text-xs px-1.5 py-0.5 rounded border font-medium ${map[status]}`}
    >
      {labels[status]}
    </span>
  );
}

/* ─── Data JSON icon (inline SVG) ─── */

function DataIcon({ className = '', size = 13 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 13 13"
      fill="none"
      className={className}
    >
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

/* ─────────────────── Main Component ─────────────────── */

export function RecentScansFeed() {
  const { documents, deleteDocument } = useDocumentStore();
  const [modalDoc, setModalDoc] = useState<Document | null>(null);

  const recent = [...documents]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  /* ─── Empty state ─── */

  if (recent.length === 0) {
    return (
      <div className="mb-5">
        <h3 className="text-xs lg:text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Escaneos recientes
        </h3>
        <div className="bg-white border border-[var(--border)] rounded-xl px-5 py-8 text-center">
          <FileIcon size={28} className="mx-auto text-stone-200 mb-3" />
          <p className="text-sm text-stone-400">
            Aún no hay documentos. Subí tu primer archivo arriba.
          </p>
        </div>
      </div>
    );
  }

  /* ─── Feed ─── */

  return (
    <div className="mb-5">
      <h3 className="text-xs lg:text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">
        Escaneos recientes
      </h3>

      <div className="bg-white border border-[var(--border)] rounded-xl stagger-children overflow-hidden">
        {recent.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] last:border-b-0"
          >
            {/* ── Thumbnail ── */}
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {doc.mimeType.startsWith('image/') ? (
                <img
                  src={doc.filePath}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <FileIcon size={14} />
              )}
            </div>

            {/* ── Metadata ── */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-stone-800 truncate">
                  {doc.originalName}
                </p>
                {statusBadge(doc.status)}
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {relativeDate(doc.createdAt)}
              </p>
            </div>

            {/* ── Quick actions ── */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <a
                href={doc.filePath}
                target="_blank"
                rel="noopener noreferrer"
                className="h-7 w-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                title="Ver documento"
              >
                <EyeIcon size={14} />
              </a>

              <button
                type="button"
                onClick={() => setModalDoc(doc)}
                className="h-7 w-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
                title="Ver datos extraídos"
              >
                <DataIcon size={13} />
              </button>

              <button
                type="button"
                onClick={() => deleteDocument(doc.id)}
                className="h-7 w-7 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Eliminar"
              >
                <TrashIcon size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Extracted data modal ── */}
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
