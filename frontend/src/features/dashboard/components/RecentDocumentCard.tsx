'use client';

import type { Document } from '@/features/documents/types/document.types';

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
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="1" width="16" height="18" rx="2" stroke="#EF4444" strokeWidth="1.4" />
        <path d="M6 7h8M6 10h8M6 13h5" stroke="#EF4444" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    );
  }
  if (mimeType.startsWith('image/')) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <rect x="2" y="1" width="16" height="18" rx="2" stroke="#3B82F6" strokeWidth="1.4" />
        <circle cx="7" cy="6" r="1.5" stroke="#3B82F6" strokeWidth="1.2" />
        <path d="M2 14l5-4 4 3 3-2 4 4" stroke="#3B82F6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="1" width="16" height="18" rx="2" stroke="#A8A29E" strokeWidth="1.4" />
      <path d="M6 7h8M6 10h8" stroke="#A8A29E" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function getFileTypeBadge(mimeType: string) {
  if (mimeType === 'application/pdf') return { label: 'PDF', color: 'bg-red-50 text-red-600 border-red-200' };
  if (mimeType.startsWith('image/')) return { label: 'Imagen', color: 'bg-blue-50 text-blue-600 border-blue-200' };
  return { label: 'Archivo', color: 'bg-stone-100 text-stone-600 border-stone-200' };
}

export function RecentDocumentCard({ document }: RecentDocumentCardProps) {
  const badge = getFileTypeBadge(document.mimeType);

  return (
    <div className="flex items-center gap-4 p-4 bg-white border border-stone-200 rounded-xl hover:border-stone-300 hover:shadow-md transition-all card-interactive">
      {/* File icon */}
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${badge.color.replace('text-', 'bg-').replace('-600', '-50').replace('bg-red-50', 'bg-red-50').replace('bg-blue-50', 'bg-blue-50').replace('bg-stone-100', 'bg-stone-100')} border`}>
        {getFileIcon(document.mimeType)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-stone-800 truncate">{document.originalName}</p>
        <p className="text-xs text-stone-400 mt-0.5">
          {document.mimeType?.split('/').pop()?.toUpperCase() || 'ARCHIVO'} · Procesado: {timeAgo(document.createdAt)}
        </p>
      </div>

      {/* Status badge */}
      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ${
        document.status === 'completed'
          ? 'bg-green-50 text-green-700 border-green-200'
          : document.status === 'failed'
          ? 'bg-red-50 text-red-700 border-red-200'
          : 'bg-amber-50 text-amber-700 border-amber-200'
      }`}>
        {document.status === 'completed' ? 'Completado' : document.status === 'failed' ? 'Fallido' : 'Procesando'}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {document.filePath && (
          <>
            <a
              href={document.filePath}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
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
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors"
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
