'use client';

import React, { useEffect } from 'react';
import { CloseIcon } from '@/shared/ui/icons';

/* ─────────────────── Props ─────────────────── */

export interface ExtractedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: Record<string, unknown> | null;
  documentName: string;
}

/* ─────────────────── Helpers ─────────────────── */

function renderValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-fg-tertiary italic">{'—'}</span>;
  }

  if (typeof value === 'object') {
    return (
      <pre className="text-caption text-fg-secondary bg-surface-sunken rounded-md p-2.5 mt-1 overflow-auto max-h-48 whitespace-pre-wrap break-all border border-border-subtle">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  if (typeof value === 'boolean') {
    return <span className="text-fg-primary text-body-sm">{value ? 'Sí' : 'No'}</span>;
  }

  return <span className="text-fg-primary text-body-sm break-all">{String(value)}</span>;
}

/* ─────────────────── Main Component ─────────────────── */

export function ExtractedDataModal({
  isOpen,
  onClose,
  data,
  documentName,
}: ExtractedDataModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const entries = data ? Object.entries(data) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-surface-overlay" onClick={onClose} />

      <div className="relative bg-surface-card rounded-xl shadow-md max-w-2xl w-full max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-h4 text-fg-primary">
              Datos extraídos
            </h3>
            <p className="text-body-sm text-fg-tertiary mt-0.5 truncate max-w-sm lg:max-w-md">
              {documentName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors flex-shrink-0 ml-2"
            title="Cerrar"
          >
            <CloseIcon size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!data ? (
            <div className="text-center py-10">
              <p className="text-body-sm text-fg-tertiary">No hay datos extraídos aún.</p>
              <p className="text-caption text-fg-disabled mt-1">
                Procesá el documento con OCR para extraer su contenido.
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-body-sm text-fg-tertiary">
                No se encontraron campos extraídos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(([key, value]) => (
                <div key={key}>
                  <p className="text-overline text-overline-uppercase text-fg-secondary mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  {renderValue(value)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 bg-fg-primary text-fg-inverse text-button rounded-md hover:opacity-90 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
