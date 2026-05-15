'use client';

import { useMemo } from 'react';
import { SpinnerIcon } from '@/shared/ui/icons';
import { Heading } from '@/shared/components/Layout';
import type { Document } from '@/features/documents/types/document.types';

type DocumentPickerProps = {
  documents: Document[];
  loading: boolean;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onAddSelected: () => void;
};

export function DocumentPicker({ documents, loading, selectedIds, onToggle, onAddSelected }: DocumentPickerProps) {
  const sorted = useMemo(
    () => [...documents].sort((a, b) => {
      const aCompleted = a.status === 'completed' ? 1 : 0;
      const bCompleted = b.status === 'completed' ? 1 : 0;
      if (aCompleted !== bCompleted) return bCompleted - aCompleted;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    }),
    [documents],
  );

  return (
    <div className="rounded-md border border-border bg-surface-sunken/60 p-3 lg:p-4 space-y-3">
      <div className="space-y-1">
        <Heading level={4} as="h3" className="text-fg-primary">Agregar desde CV/documentos escaneados</Heading>
        <p className="text-caption text-fg-secondary">
          Podés traer candidatos desde documentos ya cargados. Priorizamos los que están completos.
        </p>
      </div>

      {loading ? (
        <div className="rounded-md border border-border bg-surface-card px-3 py-2 text-body-sm text-fg-secondary inline-flex items-center gap-2">
          <SpinnerIcon className="text-fg-tertiary" /> Cargando documentos…
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-border bg-surface-card px-3 py-3 text-body-sm text-fg-secondary">
          Todavía no tenés documentos escaneados para usar en esta evaluación.
        </div>
      ) : (
        <>
          <div className="max-h-56 overflow-auto rounded-md border border-border bg-surface-card divide-y divide-border-subtle">
            {sorted.map((document) => {
              const checked = selectedIds.includes(document.id);
              const hasContent = Boolean((document.rawText && document.rawText.trim()) || document.extractedData);
              return (
                <label key={document.id} className="flex items-start gap-2.5 p-3 cursor-pointer hover:bg-surface-sunken">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(document.id)}
                    className="mt-0.5 h-4 w-4 rounded border-border text-fg-primary"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-body-sm font-medium text-fg-primary truncate">{document.originalName}</p>
                    <p className="text-caption text-fg-secondary">
                      {document.status === 'completed' ? 'Completo' : 'Pendiente de completar'}
                      {!hasContent ? ' · Sin texto utilizable' : ''}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddSelected}
              className="h-9 px-3 rounded-md border border-border bg-surface-card text-button-sm text-fg-secondary hover:bg-surface-sunken"
            >
              Agregar seleccionados
            </button>
            <p className="text-caption text-fg-secondary">
              Seleccionados: {selectedIds.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
