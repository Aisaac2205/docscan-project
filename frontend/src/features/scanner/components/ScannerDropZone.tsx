'use client';

import React, { useRef } from 'react';
import { useDocumentUpload, formatSize } from '@/features/documents/hooks/useDocumentUpload';
import { useDocumentStore } from '@/features/documents/store';
import { UploadIcon, FileIcon, PdfIcon, CheckIcon, CloseIcon } from '@/shared/ui/icons';
import { toast } from '@/shared/ui/toast/store';
import type { CaptureResult } from '../types/scanner.types';

/* ─────────────────── Props ─────────────────── */

interface ScannerDropZoneProps {
  applyResult: (res: CaptureResult | null) => boolean;
}

/* ─────────────────── Main Component ─────────────────── */

export function ScannerDropZone({ applyResult }: ScannerDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onUploadComplete = (documentId: string) => {
    // Retrieve the full doc from the store (already added by the store's upload action)
    const doc = useDocumentStore.getState().documents.find((d) => d.id === documentId);
    if (doc) {
      const result: CaptureResult = {
        documentId: doc.id,
        url: doc.filePath,
        originalName: doc.originalName,
      };
      if (applyResult(result)) {
        toast.success('Documento procesado correctamente');
      }
    } else {
      toast.error('No se pudo recuperar el documento subido');
    }
  };

  const {
    dragActive,
    selectedFile,
    uploadedDoc,
    sizeError,
    loading,
    ACCEPT_TYPES,
    MAX_SIZE_MB,
    handleDrag,
    handleDrop,
    handleFileChange,
    handleUpload,
    resetUpload,
    clearSelectedFile,
  } = useDocumentUpload({ onUploadComplete });

  const isProcessing = loading;

  /* ─── Border style ─── */
  let borderClass = 'border-2 border-dashed border-border';
  if (dragActive) {
    borderClass = 'border-2 border-dashed border-border-strong bg-surface-sunken';
  } else if (uploadedDoc) {
    borderClass = 'border-2 border-dashed border-success-border bg-success-bg/30';
  }

  /* ─── Handle file input click ─── */
  const handleClick = () => {
    if (!isProcessing && !uploadedDoc) {
      inputRef.current?.click();
    }
  };

  /* ─── Prevent default on keyboard ─── */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div>
      {/* ── Uploaded success state ── */}
      {uploadedDoc && !selectedFile ? (
        <div className={`rounded-xl ${borderClass} px-5 py-6 text-center`}>
          <CheckIcon size={28} className="mx-auto mb-2 text-success-fg" />
          <p className="text-body-sm font-medium text-fg-primary">¡Documento subido!</p>
          <p className="text-caption text-fg-tertiary mt-0.5 mb-4">
            Se está procesando y aparecerá en los resultados.
          </p>
          <button
            type="button"
            onClick={resetUpload}
            className="h-9 px-4 border border-border text-fg-secondary bg-surface-card text-button-sm rounded-md hover:bg-surface-sunken hover:border-border-strong transition-colors"
          >
            Subir otro archivo
          </button>
        </div>
      ) : selectedFile ? (
        /* ── File preview state ── */
        <div className="bg-surface-card border border-border rounded-lg p-4 md:p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-surface-sunken flex items-center justify-center flex-shrink-0 text-fg-tertiary">
              {selectedFile.type === 'application/pdf' ? <PdfIcon size={36} /> : <FileIcon size={16} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium text-fg-primary truncate">
                {selectedFile.name}
              </p>
              <p className="text-caption text-fg-tertiary mt-0.5">
                {formatSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={isProcessing}
              className="h-7 w-7 flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors disabled:opacity-40"
              title="Cancelar"
            >
              <CloseIcon size={13} />
            </button>
          </div>

          {sizeError && (
            <div className="mt-3 px-3 py-2 bg-danger-bg border border-danger-border rounded-md text-danger-fg text-caption">
              El archivo supera el tamaño máximo de {MAX_SIZE_MB} MB.
            </div>
          )}

          <div className="flex items-center gap-2 mt-3">
            <button
              type="button"
              onClick={handleUpload}
              disabled={isProcessing || sizeError}
              className="flex-1 h-9 bg-fg-primary text-fg-inverse text-button rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeOpacity="0.25" strokeWidth="2" />
                    <path d="M8 2a6 6 0 0 1 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Subiendo…
                </span>
              ) : (
                'Procesar documento'
              )}
            </button>
            <button
              type="button"
              onClick={clearSelectedFile}
              disabled={isProcessing}
              className="h-9 px-3 border border-border text-fg-secondary text-button-sm rounded-md hover:bg-surface-sunken hover:border-border-strong transition-colors disabled:opacity-40"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        /* ── Default drop zone ── */
        <div
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`rounded-xl ${borderClass} px-5 py-10 text-center cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-border-focus)]`}
        >
          <UploadIcon
            active={dragActive}
            size={28}
            className="mx-auto mb-3"
          />

          <p className="text-body-sm font-medium text-fg-primary">
            Arrastrá tu archivo aquí
          </p>
          <p className="text-caption text-fg-tertiary mt-1">
            o hacé clic para seleccionar
          </p>
          <p className="text-overline text-fg-disabled mt-2">
            JPEG, PNG o PDF · Máx. {MAX_SIZE_MB} MB
          </p>

          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT_TYPES}
            onChange={(e) => {
              handleFileChange(e);
              // Reset value so the same file can be re-selected
              if (inputRef.current) inputRef.current.value = '';
            }}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
