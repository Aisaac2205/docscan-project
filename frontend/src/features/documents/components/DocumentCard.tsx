import React, { useState } from 'react';
import type { Document } from '../types/document.types';
import { useDocumentAction } from '../hooks/useDocumentAction';
import { useDocumentChat } from '../hooks/useDocumentChat';
import { DocumentChatPanel } from './DocumentChatPanel';
import { StatusBadge } from './StatusBadge';
import { printDocument } from '../utils/print';
import { useDocumentStore } from '../store';
import {
  FileIcon, OcrIcon, PrintIcon, TrashIcon, SpinnerIcon,
  SparkleIcon, ChatIcon, ChevronDownIcon,
} from '@/shared/ui/icons';

interface DocumentCardProps {
  doc: Document;
}

export function DocumentCard({ doc }: DocumentCardProps) {
  const { deleteDocument } = useDocumentStore();
  const documentAction = useDocumentAction(doc);
  const documentChat = useDocumentChat(doc.id);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const extracted = doc.extractedData as Record<string, any> | null;
  const isCompleted = doc.status === 'completed';
  const canExtract = doc.status !== 'processing' && !documentAction.isProcessingLocal;

  return (
    <div className="bg-white border border-[var(--border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-start gap-3 p-4">
        <div className="w-10 h-10 rounded-lg bg-stone-50 border border-[var(--border)] flex items-center justify-center flex-shrink-0 overflow-hidden">
          {doc.filePath ? (
            <img
              src={doc.filePath}
              alt=""
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <FileIcon />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-stone-800 truncate">{doc.originalName}</p>
            <StatusBadge status={doc.status} />
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            {new Date(doc.createdAt).toLocaleDateString('es-GT', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap justify-end">
          {!isCompleted && (
            <>
              <button
                onClick={documentAction.handleSmartExtract}
                disabled={!canExtract || documentAction.isLocked}
                title="Analizar y extraer todos los campos automáticamente"
                className="h-8 px-3 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
              >
                {documentAction.isProcessingLocal
                  ? <><SpinnerIcon size={12} />Procesando...</>
                  : <><SparkleIcon size={12} />Extraer con IA</>}
              </button>
              <button
                onClick={documentAction.handleExtract}
                disabled={!canExtract || documentAction.isLocked}
                title="Extracción general de texto"
                className="h-8 px-3 text-xs font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <OcrIcon size={12} />OCR
              </button>
            </>
          )}

          {isCompleted && extracted && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors"
            >
              Ver campos
              <ChevronDownIcon className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          )}

          <button
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (!isChatOpen) setIsExpanded(false);
            }}
            title="Preguntar sobre el documento"
            className={`h-8 px-3 flex items-center gap-1.5 text-xs font-medium border rounded-lg transition-colors ${
              isChatOpen
                ? 'bg-stone-900 text-white border-stone-900'
                : 'border-[var(--border)] text-stone-600 bg-white hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <ChatIcon size={12} />
            {documentChat.history.length > 0 ? `${documentChat.history.length}` : 'Preguntar'}
          </button>

          <button
            onClick={() => printDocument(doc)}
            title="Imprimir documento"
            className="h-8 px-3 flex items-center gap-1.5 text-xs font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 hover:text-stone-900 transition-colors"
          >
            <PrintIcon />Imprimir
          </button>

          <button
            onClick={() => deleteDocument(doc.id)}
            title="Eliminar documento"
            className="h-8 w-8 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {isCompleted && isExpanded && extracted && (
        <div className="border-t border-[var(--border)] px-4 pb-4 pt-3 animate-slide-up">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-2.5">
            Datos extraídos — Gemini OCR
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {Object.entries(extracted).map(([key, value]) => (
              <DataField key={key} label={key.replace(/_/g, ' ')} value={renderValue(value)} />
            ))}
          </div>
        </div>
      )}

      {isChatOpen && <DocumentChatPanel chat={documentChat} />}
    </div>
  );
}

function renderValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === 'object') return JSON.stringify(value, null, 2);
  return String(value);
}

function DataField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="bg-stone-50 rounded-lg px-3 py-2 border border-[var(--border)]">
      <p className="text-[10px] font-medium text-stone-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-stone-800 mt-0.5 truncate">
        {value ?? <span className="text-stone-300 font-normal">—</span>}
      </p>
    </div>
  );
}
