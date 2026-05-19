'use client';

import type { Document } from '@/features/documents/types/document.types';
import { Badge, type BadgeVariant } from '@/shared/components/ui';
import { PdfIcon } from '@/shared/ui/icons';

interface RecentDocumentCardProps {
  document: Document;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semanas`;
  return `Hace ${Math.floor(diffDays / 30)} meses`;
}

function getFileIcon(mimeType: string) {
  if (mimeType === 'application/pdf') {
    return <PdfIcon size={44} />;
  }
  if (mimeType.startsWith('image/')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-info-fg">
        <rect x="2" y="1" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="7" cy="6" r="1.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M2 14l5-4 4 3 3-2 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="text-fg-tertiary">
      <rect x="2" y="1" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M6 7h8M6 10h8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function getIconBg(mimeType: string): string {
  if (mimeType === 'application/pdf') return 'bg-danger-bg';
  if (mimeType.startsWith('image/'))  return 'bg-info-bg';
  return 'bg-surface-sunken';
}

function getStatusVariant(status: Document['status']): { label: string; variant: BadgeVariant } {
  if (status === 'completed') return { label: 'Completado', variant: 'success' };
  if (status === 'failed')    return { label: 'Fallido',    variant: 'danger' };
  return { label: 'Procesando', variant: 'warning' };
}

export function RecentDocumentCard({ document }: RecentDocumentCardProps) {
  const status = getStatusVariant(document.status);

  return (
    <div className="flex items-center gap-4 p-4 bg-surface-card border border-border rounded-lg hover:border-border-strong hover:shadow-sm transition-all card-interactive">
      {/* File icon */}
      <div className={`w-11 h-11 rounded-md flex items-center justify-center flex-shrink-0 ${getIconBg(document.mimeType)}`}>
        {getFileIcon(document.mimeType)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-body-sm font-medium text-fg-primary truncate">{document.originalName}</p>
        <p className="text-caption text-fg-tertiary mt-0.5">
          {document.mimeType?.split('/').pop()?.toUpperCase() || 'ARCHIVO'} · Procesado: {timeAgo(document.createdAt)}
        </p>
      </div>

      <Badge variant={status.variant}>{status.label}</Badge>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {document.filePath && (
          <>
            <a
              href={document.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors"
              title="Ver"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 8s2.5-4.5 7-4.5S15 8 15 8s-2.5 4.5-7 4.5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3" />
                <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
              </svg>
            </a>
            <a
              href={document.filePath}
              download
              className="p-2 text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-colors"
              title="Descargar"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 11V3M8 11L5 8M8 11l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 13v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
