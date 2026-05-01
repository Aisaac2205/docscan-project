'use client';

import { useMemo } from 'react';
import { SpinnerIcon } from '@/shared/ui/icons';
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
    <div className="rounded-lg border border-[var(--border)] bg-stone-50/60 p-3 lg:p-4 space-y-3 lg:space-y-4">
      <div className="space-y-1">
        <h3 className="text-xs lg:text-sm font-semibold text-stone-800">Agregar desde CV/documentos escaneados</h3>
        <p className="text-[11px] lg:text-xs text-stone-500">
          Podés traer candidatos desde documentos ya cargados. Priorizamos los que están completos.
        </p>
      </div>

      {loading ? (
        <div className="rounded-md border border-[var(--border)] bg-white px-3 lg:px-4 py-2 text-xs lg:text-sm text-stone-500 inline-flex items-center gap-2">
          <SpinnerIcon className="text-stone-400" /> Cargando documentos…
        </div>
      ) : sorted.length === 0 ? (
        <div className="rounded-md border border-dashed border-[var(--border)] bg-white px-3 lg:px-4 py-3 text-xs lg:text-sm text-stone-500">
          Todavía no tenés documentos escaneados para usar en esta evaluación.
        </div>
      ) : (
        <>
          <div className="max-h-56 overflow-auto rounded-md border border-[var(--border)] bg-white divide-y divide-[var(--border)]">
            {sorted.map((document) => {
              const checked = selectedIds.includes(document.id);
              const hasContent = Boolean((document.rawText && document.rawText.trim()) || document.extractedData);
              return (
                <label key={document.id} className="flex items-start gap-2.5 p-2.5 lg:p-3 cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggle(document.id)}
                    className="mt-0.5 h-4 w-4 rounded border-[var(--border)] text-stone-900"
                  />
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs lg:text-sm font-medium text-stone-700 truncate">{document.originalName}</p>
                    <p className="text-[11px] lg:text-xs text-stone-500">
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
              className="h-8 lg:h-9 px-3 rounded-lg border border-[var(--border)] bg-white text-xs lg:text-sm font-semibold text-stone-700 hover:bg-stone-100"
            >
              Agregar seleccionados
            </button>
            <p className="text-[11px] lg:text-xs text-stone-500">
              Seleccionados: {selectedIds.length}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
