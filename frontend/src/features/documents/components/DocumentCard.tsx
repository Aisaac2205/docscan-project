import type { Document } from '../types/document.types';
import { StatusBadge } from './StatusBadge';
import {
  FileIcon, EyeIcon, PrintIcon, TrashIcon,
} from '@/shared/ui/icons';

interface DocumentCardProps {
  doc: Document;
  onOpen: (doc: Document) => void;
  onDelete: (id: string) => void;
  onPrint: (doc: Document) => void;
}

export function DocumentCard({ doc, onOpen, onDelete, onPrint }: DocumentCardProps) {
  const isImage = doc.filePath && !doc.filePath.toLowerCase().endsWith('.pdf');
  const isPdf = doc.filePath?.toLowerCase().endsWith('.pdf');

  return (
    <div
      onClick={() => onOpen(doc)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpen(doc); }}
      role="button"
      tabIndex={0}
      className="group w-full text-left bg-white border border-[var(--border)] rounded-xl overflow-hidden hover:border-stone-300 hover:shadow-sm transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail bar */}
      <div className="flex items-stretch">
        <div className={`flex items-center justify-center flex-shrink-0 ${isPdf ? 'w-14 bg-stone-50' : 'w-14 bg-stone-100'}`}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.filePath}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <FileIcon className={isPdf ? 'text-stone-400' : 'text-stone-300'} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-3 py-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-stone-800 truncate group-hover:text-stone-900 transition-colors">
              {doc.originalName}
            </p>
            <StatusBadge status={doc.status} />
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-stone-400">
              {new Date(doc.createdAt).toLocaleDateString('es-GT', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
            {doc.confidence !== null && doc.confidence !== undefined && (
              <span className="text-[10px] text-stone-400">
                {Math.round(doc.confidence * 100)}% confianza
              </span>
            )}
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(doc); }}
            title="Ver documento"
            className="h-7 w-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <EyeIcon size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPrint(doc); }}
            title="Imprimir"
            className="h-7 w-7 flex items-center justify-center text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <PrintIcon size={13} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
            title="Eliminar"
            className="h-7 w-7 flex items-center justify-center text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          >
            <TrashIcon size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
