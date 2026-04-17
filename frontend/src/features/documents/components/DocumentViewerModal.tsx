import { useState, useCallback } from 'react';
import type { Document } from '../types/document.types';
import { useDocumentAction } from '../hooks/useDocumentAction';
import { useDocumentChat } from '../hooks/useDocumentChat';
import { useExtractedFields } from '../hooks/useExtractedFields';
import { ExtractedFieldsPanel } from './ExtractedFieldsPanel';
import { DocumentChatPanel } from './DocumentChatPanel';
import { StatusBadge } from './StatusBadge';
import { printDocument } from '../utils/print';
import { FileIcon, OcrIcon, SparkleIcon, PrintIcon, SpinnerIcon, TrashIcon } from '@/shared/ui/icons';

interface DocumentViewerModalProps {
  doc: Document;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

type ViewerTab = 'preview' | 'data' | 'chat';

export function DocumentViewerModal({ doc, onClose, onDeleted }: DocumentViewerModalProps) {
  const [activeTab, setActiveTab] = useState<ViewerTab>('preview');
  const documentAction = useDocumentAction(doc);
  const documentChat = useDocumentChat(doc.id);
  const extracted = doc.extractedData as Record<string, unknown> | null;
  const renderedFields = useExtractedFields(extracted);
  const isCompleted = doc.status === 'completed';

  // Close on Escape
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  // Close on backdrop click
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  }, [handleClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6 md:p-8 animate-fade-in"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-label={`Visor de documento: ${doc.originalName}`}
    >
      <div className="flex flex-col w-full max-w-6xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* ── Top bar ─────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border)] bg-white flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-stone-100 border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {doc.filePath && !doc.filePath.toLowerCase().endsWith('.pdf') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.filePath}
                  alt=""
                  className="w-full h-full object-cover rounded-md"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              ) : (
                <FileIcon size={13} />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-stone-800 truncate">{doc.originalName}</p>
              <div className="flex items-center gap-2">
                <StatusBadge status={doc.status} />
                <span className="text-[10px] text-stone-400">
                  {new Date(doc.createdAt).toLocaleDateString('es-GT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Extract buttons — only when not completed */}
            {!isCompleted && (
              <>
                <button
                  onClick={() => documentAction.handleSmartExtract()}
                  disabled={doc.status === 'processing'}
                  className="h-8 px-3 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
                >
                  {doc.status === 'processing'
                    ? <><SpinnerIcon size={12} />Procesando…</>
                    : <><SparkleIcon size={12} />Extraer con IA</>}
                </button>
                <button
                  onClick={() => documentAction.handleExtract()}
                  disabled={doc.status === 'processing'}
                  className="h-8 px-3 text-xs font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <OcrIcon size={12} />OCR
                </button>
              </>
            )}
            <button
              onClick={() => printDocument(doc)}
              className="h-8 w-8 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
              title="Imprimir"
            >
              <PrintIcon size={14} />
            </button>
            <button
              onClick={() => {
                if (window.confirm('¿Eliminar este documento? Esta acción no se puede deshacer.')) {
                  onDeleted(doc.id);
                  onClose();
                }
              }}
              className="h-8 w-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-0 border-b border-[var(--border)] bg-stone-50 px-4 sm:px-6 flex-shrink-0">
          <TabButton
            active={activeTab === 'preview'}
            onClick={() => setActiveTab('preview')}
            label="Vista previa"
          />
          {isCompleted && extracted && (
            <TabButton
              active={activeTab === 'data'}
              onClick={() => setActiveTab('data')}
              label={`Datos extraídos${renderedFields.length > 0 ? ` (${renderedFields.length})` : ''}`}
            />
          )}
          <TabButton
            active={activeTab === 'chat'}
            onClick={() => setActiveTab('chat')}
            label={`Preguntar${documentChat.history.length > 0 ? ` (${documentChat.history.length})` : ''}`}
          />
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'preview' && (
            <div className="h-full overflow-auto bg-stone-100 flex items-center justify-center p-4">
              {doc.filePath && !doc.filePath.toLowerCase().endsWith('.pdf') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={doc.filePath}
                  alt={doc.originalName}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : doc.filePath?.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={doc.filePath}
                  title={doc.originalName}
                  className="w-full h-full rounded-lg border border-[var(--border)] bg-white"
                />
              ) : (
                <div className="flex flex-col items-center gap-3 text-stone-400">
                  <FileIcon size={48} />
                  <p className="text-sm">Sin vista previa disponible</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'data' && isCompleted && renderedFields.length > 0 && (
            <div className="h-full overflow-auto p-4 sm:p-6">
              <ExtractedFieldsPanel fields={renderedFields} />
            </div>
          )}

          {activeTab === 'data' && (!isCompleted || renderedFields.length === 0) && (
            <div className="h-full flex flex-col items-center justify-center text-stone-400 gap-2">
              <OcrIcon size={32} />
              <p className="text-sm">{!isCompleted ? 'Aún no se han extraído datos' : 'No hay datos extraídos para mostrar'}</p>
              {!isCompleted && (
                <button
                  onClick={() => documentAction.handleSmartExtract()}
                  className="mt-2 h-8 px-4 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5"
                >
                  <SparkleIcon size={12} />Extraer con IA
                </button>
              )}
            </div>
          )}

          {activeTab === 'chat' && (
            <DocumentChatPanel chat={documentChat} compact={false} />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab button ─────────────────────────────────────────────────────────────

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
        active
          ? 'border-stone-900 text-stone-900 bg-white'
          : 'border-transparent text-stone-500 hover:text-stone-700 hover:bg-stone-100'
      }`}
    >
      {label}
    </button>
  );
}
