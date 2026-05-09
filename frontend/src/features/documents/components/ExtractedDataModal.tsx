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
    return <span className="text-stone-300 italic">{'\u2014'}</span>;
  }

  if (typeof value === 'object') {
    return (
      <pre className="text-xs text-stone-600 bg-stone-50 rounded-md p-2.5 mt-1 overflow-auto max-h-48 whitespace-pre-wrap break-all border border-stone-100">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  if (typeof value === 'boolean') {
    return <span className="text-stone-800 text-sm">{value ? 'Sí' : 'No'}</span>;
  }

  return <span className="text-stone-800 text-sm break-all">{String(value)}</span>;
}

/* ─────────────────── Main Component ─────────────────── */

export function ExtractedDataModal({
  isOpen,
  onClose,
  data,
  documentName,
}: ExtractedDataModalProps) {
  /* ── Escape key listener ── */
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
      {/* ── Overlay ── */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* ── Modal panel ── */}
      <div className="relative bg-white rounded-xl shadow-[var(--shadow-modal)] max-w-2xl w-full max-h-[80vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] flex-shrink-0">
          <div className="min-w-0">
            <h3 className="text-base lg:text-lg font-semibold text-stone-900">
              Datos extraídos
            </h3>
            <p className="text-sm text-stone-400 mt-0.5 truncate max-w-sm lg:max-w-md">
              {documentName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors flex-shrink-0 ml-2"
            title="Cerrar"
          >
            <CloseIcon size={15} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {!data ? (
            <div className="text-center py-10">
              <p className="text-sm text-stone-400">No hay datos extraídos aún.</p>
              <p className="text-xs text-stone-300 mt-1">
                Procesá el documento con OCR para extraer su contenido.
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-stone-400">
                No se encontraron campos extraídos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map(([key, value]) => (
                <div key={key}>
                  <p className="text-stone-500 text-[11px] lg:text-xs uppercase tracking-wider font-semibold mb-1">
                    {key.replace(/_/g, ' ')}
                  </p>
                  {renderValue(value)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
