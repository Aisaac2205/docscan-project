'use client';

import { type ReactNode } from 'react';
import {
  DataTable,
  type DataTableColumn,
} from '@/shared/components/data-display/DataTable';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui';
import { cn } from '@/shared/lib/cn';
import type { Document } from '../types/document.types';
import { formatLongDate, formatShortDate } from '../utils/formatters';
import { ConfidenceText } from './ConfidenceText';
import { DocumentStatusBadge } from './DocumentStatusBadge';
import { DocumentTypeTag } from './DocumentTypeTag';
import { DocumentsActionsMenu } from './DocumentsActionsMenu';
import { PdfIcon } from './PdfIcon';
import { PersonCell } from './PersonCell';

interface DocumentsTableProps {
  documents: Document[];
  onRowClick: (doc: Document) => void;
  onView: (doc: Document) => void;
  onDownload: (doc: Document) => void;
  onReassign: (doc: Document) => void;
  onDelete: (doc: Document) => void;
  emptyState?: ReactNode;
}

export function DocumentsTable({
  documents,
  onRowClick,
  onView,
  onDownload,
  onReassign,
  onDelete,
  emptyState,
}: DocumentsTableProps) {
  const columns: DataTableColumn<Document>[] = [
    {
      key: 'type',
      header: 'Tipo',
      width: '11rem',
      render: (doc) => <DocumentTypeTag type={doc.documentType} />,
    },
    {
      key: 'document',
      header: 'Documento',
      render: (doc) => (
        <div className="flex items-center gap-3 min-w-0">
          <span
            className={cn(
              'inline-flex items-center justify-center h-9 w-9 rounded-md',
              'bg-surface-card-hover',
            )}
          >
            <PdfIcon size={20} />
          </span>
          <span
            className="truncate text-body text-fg-primary"
            title={doc.originalName}
          >
            {doc.originalName}
          </span>
        </div>
      ),
    },
    {
      key: 'person',
      header: 'Persona',
      width: '14rem',
      render: (doc) => <PersonCell personName={doc.person?.fullName ?? null} />,
    },
    {
      key: 'date',
      header: 'Fecha',
      width: '8rem',
      render: (doc) => (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-body-sm text-fg-secondary cursor-default">
              {formatShortDate(doc.createdAt)}
            </span>
          </TooltipTrigger>
          <TooltipContent>{formatLongDate(doc.createdAt)}</TooltipContent>
        </Tooltip>
      ),
    },
    {
      key: 'confidence',
      header: 'Confianza',
      width: '6rem',
      align: 'right',
      render: (doc) => <ConfidenceText confidence={doc.confidence} />,
    },
    {
      key: 'status',
      header: 'Estado',
      width: '8rem',
      render: (doc) => <DocumentStatusBadge doc={doc} />,
    },
    {
      key: 'actions',
      header: '',
      width: '3rem',
      align: 'right',
      render: (doc) => (
        <DocumentsActionsMenu
          documentName={doc.originalName}
          onView={() => onView(doc)}
          onDownload={() => onDownload(doc)}
          onReassign={() => onReassign(doc)}
          onDelete={() => onDelete(doc)}
        />
      ),
    },
  ];

  return (
    <DataTable
      ariaLabel="Documentos"
      columns={columns}
      data={documents}
      getRowKey={(doc) => doc.id}
      onRowClick={onRowClick}
      emptyState={emptyState}
    />
  );
}
