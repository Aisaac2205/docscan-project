'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Document } from '@/features/documents/types/document.types';
import { useDocumentChat } from '@/features/documents/hooks/useDocumentChat';
import { useExtractedFields } from '@/features/documents/hooks/useExtractedFields';
import { useDocumentAction } from '@/features/documents/hooks/useDocumentAction';
import { ExtractedFieldsPanel } from '@/features/documents/components/ExtractedFieldsPanel';
import { DocumentChatPanel } from '@/features/documents/components/DocumentChatPanel';
import { StatusBadge } from '@/features/documents/components/StatusBadge';
import { printDocument } from '@/features/documents/utils/print';
import { documentsClient } from '@/features/documents/client';
import { FileIcon, PrintIcon, TrashIcon, SparkleIcon, OcrIcon } from '@/shared/ui/icons';
import { useDocumentStore } from '@/features/documents/store';

interface DocumentDetailViewProps {
  doc: Document;
}

export function DocumentDetailView({ doc: initialDoc }: DocumentDetailViewProps) {
  const router = useRouter();
  const { deleteDocument, updateDocument } = useDocumentStore();
  const [doc, setDoc] = useState<Document>(initialDoc);
  const documentChat = useDocumentChat(doc.id);
  const documentAction = useDocumentAction(doc);
  const extracted = doc.extractedData as Record<string, unknown> | null;
  const renderedFields = useExtractedFields(extracted);
  const isCompleted = doc.status === 'completed';
  const isImage = doc.filePath && !doc.filePath.toLowerCase().endsWith('.pdf');
  const isPdf = doc.filePath?.toLowerCase().endsWith('.pdf');
  const [previewOpen, setPreviewOpen] = useState(true);

  useEffect(() => {
    documentsClient.get(initialDoc.id)
      .then((fresh) => {
        setDoc(fresh);
        updateDocument(initialDoc.id, fresh);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = () => {
    if (window.confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) {
      deleteDocument(doc.id);
      router.push('/documents');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3 lg:py-4 border-b border-border bg-surface-card flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.push('/documents')}
            className="h-8 w-8 lg:h-9 lg:w-9 flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors flex-shrink-0"
            title="Volver"
          >
            <ArrowLeftIcon size={16} />
          </button>
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-md bg-surface-sunken border border-border flex items-center justify-center flex-shrink-0 overflow-hidden text-fg-tertiary">
            {isImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={doc.filePath} alt="" className="w-full h-full object-cover" />
            ) : (
              <FileIcon size={13} />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-body-sm font-medium text-fg-primary truncate">{doc.originalName}</p>
            <div className="flex items-center gap-2">
              <StatusBadge status={doc.status} />
              <span className="text-caption text-fg-tertiary">
                {new Date(doc.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {!isCompleted && (
            <>
              <button
                onClick={() => documentAction.handleSmartExtract()}
                disabled={doc.status === 'processing'}
                className="h-9 px-3 text-button-sm font-medium bg-fg-primary text-fg-inverse rounded-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                <SparkleIcon size={12} />Extraer con IA
              </button>
              <button
                onClick={() => documentAction.handleExtract()}
                disabled={doc.status === 'processing'}
                className="h-9 px-3 text-button-sm font-medium border border-border text-fg-secondary bg-surface-card rounded-md hover:bg-surface-sunken transition-colors flex items-center gap-1.5"
              >
                <OcrIcon size={12} />OCR
              </button>
            </>
          )}
          <button
            onClick={() => printDocument(doc)}
            className="h-8 w-8 lg:h-9 lg:w-9 flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors"
            title="Imprimir"
          >
            <PrintIcon size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="h-8 w-8 lg:h-9 lg:w-9 flex items-center justify-center text-fg-tertiary hover:text-danger-fg hover:bg-danger-bg rounded-md transition-colors"
            title="Eliminar"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Data panel — PRIMARY, larger */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-surface-card">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-h2">Datos extraídos</h2>
                {renderedFields.length > 0 && (
                  <span className="text-caption font-medium text-fg-tertiary bg-surface-sunken px-2 py-0.5 rounded-full">
                    {renderedFields.length} campo{renderedFields.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
              <p className="text-body-sm text-fg-tertiary">
                {isCompleted && renderedFields.length > 0
                  ? 'Información estructurada extraída del documento'
                  : 'Aún no se han extraído datos de este documento'}
              </p>
            </div>

            {isCompleted && renderedFields.length > 0 ? (
              <ExtractedFieldsPanel fields={renderedFields} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-fg-tertiary gap-3">
                <OcrIcon size={40} />
                <p className="text-body">{!isCompleted ? 'Procesando documento…' : 'No hay datos extraídos'}</p>
                {!isCompleted && doc.status !== 'processing' && (
                  <button
                    onClick={() => documentAction.handleSmartExtract()}
                    className="mt-2 h-9 px-4 text-button-sm font-medium bg-fg-primary text-fg-inverse rounded-md hover:opacity-90 transition-colors flex items-center gap-1.5"
                  >
                    <SparkleIcon size={12} />Extraer con IA
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Preview panel — reference, smaller */}
        <div className="lg:w-[380px] xl:w-[420px] lg:border-l border-t lg:border-t-0 border-border bg-surface-page flex-shrink-0 flex flex-col">
          <button
            onClick={() => setPreviewOpen(!previewOpen)}
            className="flex items-center justify-between px-4 py-3 lg:px-5 lg:py-4 border-b border-border bg-surface-card"
          >
            <span className="text-body-sm font-medium text-fg-primary">Vista previa del documento</span>
            <span className="text-fg-tertiary">{previewOpen ? '−' : '+'}</span>
          </button>

          {previewOpen && (
            <div className="flex-1 overflow-auto p-3 lg:p-4 flex items-center justify-center">
              {isImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.filePath}
                  alt={doc.originalName}
                  className="max-w-full max-h-full object-contain rounded-md shadow-sm"
                />
              ) : isPdf ? (
                <iframe
                  src={doc.filePath}
                  title={doc.originalName}
                  className="w-full h-[300px] lg:h-full rounded-md border border-border bg-surface-card"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-fg-tertiary">
                  <FileIcon size={32} />
                  <p className="text-caption">Sin vista previa</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Chat — collapsible */}
      <div className="border-t border-border bg-surface-card flex-shrink-0">
        <DocumentChatPanel chat={documentChat} compact={false} />
      </div>
    </div>
  );
}

function ArrowLeftIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
