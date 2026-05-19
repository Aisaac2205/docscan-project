'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heading } from '@/shared/components/Layout';
import { Skeleton, TooltipProvider } from '@/shared/components/ui';
import { toast } from '@/shared/ui/toast/store';
import { documentsClient } from '@/features/documents/client';
import { AssignPersonModal } from '@/features/documents/components/AssignPersonModal';
import { DocumentsFilters } from '@/features/documents/components/DocumentsFilters';
import { DocumentsMetricsRow } from '@/features/documents/components/DocumentsMetricsRow';
import { DocumentsPagination } from '@/features/documents/components/DocumentsPagination';
import { DocumentsSearchInput } from '@/features/documents/components/DocumentsSearchInput';
import { DocumentsTable } from '@/features/documents/components/DocumentsTable';
import {
  toApiFilters,
  useDocumentsQuery,
  type LimitOption,
} from '@/features/documents/hooks/useDocumentsQuery';
import { useDocumentsStats } from '@/features/documents/hooks/useDocumentsStats';
import type {
  Document,
  PaginationMeta,
} from '@/features/documents/types/document.types';

export function DocumentsView() {
  const router = useRouter();
  const { state, update } = useDocumentsQuery();

  const [documents, setDocuments] = useState<Document[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignTarget, setAssignTarget] = useState<Document | null>(null);

  const apiFilters = useMemo(() => toApiFilters(state), [state]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const response = await documentsClient.list(apiFilters);
      setDocuments(response.data);
      setPagination(response.pagination);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos cargar los documentos.');
    } finally {
      setLoading(false);
    }
  }, [apiFilters]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const { stats, loading: loadingStats } = useDocumentsStats({
    dateFrom: state.dateFrom ?? undefined,
    dateTo: state.dateTo ?? undefined,
  });

  const goToDetail = useCallback(
    (doc: Document) => {
      router.push(`/documents/${doc.id}`);
    },
    [router],
  );

  const handleDownload = (doc: Document) => {
    if (!doc.filePath) return;
    window.open(doc.filePath, '_blank', 'noopener,noreferrer');
  };

  const handleReassign = (doc: Document) => {
    setAssignTarget(doc);
  };

  const handleDelete = async (doc: Document) => {
    const ok = window.confirm(
      `¿Eliminar "${doc.originalName}"? Esta acción no se puede deshacer.`,
    );
    if (!ok) return;
    try {
      await documentsClient.delete(doc.id);
      toast.success('Documento eliminado.');
      fetchList();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No pudimos eliminar el documento.');
    }
  };

  const handleAssignConfirm = async (personId: string | null) => {
    if (!assignTarget) return;
    await documentsClient.assignPerson(assignTarget.id, personId);
    toast.success(personId ? 'Persona asignada.' : 'Asignación quitada.');
    fetchList();
  };

  return (
    <TooltipProvider>
      <div className="space-y-5">
        <header className="space-y-1">
          <Heading level={1}>Documentos</Heading>
          <p className="text-body-sm text-fg-secondary">
            Listado paginado con búsqueda full-text, filtros y vista de detalle.
          </p>
        </header>

        <DocumentsMetricsRow stats={stats} loading={loadingStats} />

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <DocumentsSearchInput
            value={state.search}
            onChange={(search) => update({ search })}
          />
          <DocumentsFilters state={state} onChange={update} />
        </div>

        <div className="space-y-3">
          {loading && documents.length === 0 ? (
            <Skeleton className="h-72 rounded-lg" />
          ) : (
            <DocumentsTable
              documents={documents}
              onRowClick={goToDetail}
              onView={goToDetail}
              onDownload={handleDownload}
              onReassign={handleReassign}
              onDelete={handleDelete}
              emptyState={
                <div className="flex flex-col items-center justify-center gap-2 py-12 rounded-lg border border-border-subtle bg-surface-card">
                  <p className="text-body-sm text-fg-secondary">
                    No hay documentos con los filtros actuales.
                  </p>
                  <p className="text-caption text-fg-tertiary">
                    Ajustá los filtros o subí un documento desde la sección Escaneo.
                  </p>
                </div>
              }
            />
          )}

          <DocumentsPagination
            pagination={pagination}
            limit={state.limit}
            onPageChange={(page) => update({ page })}
            onLimitChange={(limit: LimitOption) => update({ limit })}
          />
        </div>

        <AssignPersonModal
          open={assignTarget !== null}
          documentName={assignTarget?.originalName}
          currentPersonId={assignTarget?.personId ?? null}
          onClose={() => setAssignTarget(null)}
          onConfirm={handleAssignConfirm}
        />
      </div>
    </TooltipProvider>
  );
}
