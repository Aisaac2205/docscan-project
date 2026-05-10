import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Document } from '../types/document.types';
import { StatusBadge } from './StatusBadge';
import { AssignPersonButton } from './AssignPersonButton';
import { personsApi } from '@/features/persons/api/personsApi';
import {
  FileIcon, PrintIcon, TrashIcon,
} from '@/shared/ui/icons';

interface DocumentCardProps {
  doc: Document;
  onDelete: (id: string) => void;
  onPrint: (doc: Document) => void;
}

export function DocumentCard({ doc, onDelete, onPrint }: DocumentCardProps) {
  const router = useRouter();
  const isImage = doc.filePath && !doc.filePath.toLowerCase().endsWith('.pdf');
  const isPdf = doc.filePath?.toLowerCase().endsWith('.pdf');
  const [personName, setPersonName] = useState<string | null>(null);

  useEffect(() => {
    if (!doc.personId) { setPersonName(null); return; }
    let cancelled = false;
    personsApi.getOne(doc.personId)
      .then((p) => { if (!cancelled) setPersonName(p.fullName); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [doc.personId]);

  const handleOpen = () => router.push(`/documents/${doc.id}`);

  return (
    <div
      onClick={handleOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpen(); }}
      role="button"
      tabIndex={0}
      className="group w-full text-left bg-surface-card border border-border rounded-lg overflow-hidden hover:border-border-strong hover:shadow-sm transition-all duration-200 cursor-pointer"
    >
      {/* Thumbnail bar */}
      <div className="flex items-stretch">
        <div className={`flex items-center justify-center flex-shrink-0 w-14 lg:w-16 ${isPdf ? 'bg-surface-page' : 'bg-surface-sunken'}`}>
          {isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={doc.filePath}
              alt=""
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <FileIcon className={isPdf ? 'text-fg-tertiary' : 'text-fg-disabled'} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-3 lg:px-4 py-2.5 lg:py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-body-sm font-medium text-fg-primary truncate transition-colors">
              {doc.originalName}
            </p>
            <StatusBadge status={doc.status} />
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <p className="text-caption text-fg-tertiary">
              {new Date(doc.createdAt).toLocaleDateString('es-GT', {
                day: '2-digit', month: 'short', year: 'numeric',
              })}
            </p>
            {doc.confidence !== null && doc.confidence !== undefined && (
              <span className="text-caption text-fg-tertiary">
                {Math.round(doc.confidence * 100)}% confianza
              </span>
            )}
            <span onClick={(e) => e.stopPropagation()}>
              <AssignPersonButton
                documentId={doc.id}
                documentName={doc.originalName}
                currentPersonId={doc.personId}
                currentPersonName={personName}
                compact
                onAssigned={(pid) => {
                  if (!pid) setPersonName(null);
                }}
              />
            </span>
          </div>
        </div>

        {/* Actions — visible on hover */}
        <div className="flex items-center gap-0.5 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => { e.stopPropagation(); onPrint(doc); }}
            title="Imprimir"
            className="h-7 w-7 lg:h-8 lg:w-8 flex items-center justify-center text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors"
          >
            <PrintIcon size={13} className="lg:w-3.5 lg:h-3.5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(doc.id); }}
            title="Eliminar"
            className="h-7 w-7 lg:h-8 lg:w-8 flex items-center justify-center text-fg-tertiary hover:text-danger-fg hover:bg-danger-bg rounded-md transition-colors"
          >
            <TrashIcon size={13} className="lg:w-3.5 lg:h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
