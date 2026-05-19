// Public API del módulo Documentos. Otros features importan desde acá,
// no desde paths internos.

export { documentsClient } from './client';
export { useDocumentStore } from './store';
export type {
  Document,
  DocumentFilters,
  DocumentPersonSummary,
  DocumentsMetric,
  DocumentsStats,
  DocumentsStatsFilters,
  ListSortField,
  ListSortOrder,
  PaginatedDocuments,
  PaginationMeta,
} from './types/document.types';

export { CONFIDENCE_REVIEW_THRESHOLD } from './utils/constants';
export { getDisplayStatus, DISPLAY_STATUS_LABEL } from './utils/getDisplayStatus';
export type { DisplayStatus } from './utils/getDisplayStatus';
export {
  formatConfidencePercent,
  getConfidenceLevel,
} from './utils/getConfidenceLevel';
export type { ConfidenceLevel } from './utils/getConfidenceLevel';
export {
  DOCUMENT_TYPE_OPTIONS,
  getDocumentTypeLabel,
  getDocumentTypeOption,
  getDocumentTypeShort,
} from './utils/documentTypes';
export type {
  DocumentTypeOption,
  DocumentTypeValue,
} from './utils/documentTypes';
export {
  formatLongDate,
  formatShortDate,
  getInitials,
  toIsoDate,
} from './utils/formatters';

// Componentes reusables.
export { ConfidenceText } from './components/ConfidenceText';
export { DocumentStatusBadge } from './components/DocumentStatusBadge';
export { DocumentTypeTag } from './components/DocumentTypeTag';
export { DocumentsMetricsRow } from './components/DocumentsMetricsRow';
export { PdfIcon } from './components/PdfIcon';
export { PersonCell } from './components/PersonCell';

// Hooks.
export { useDocumentsStats } from './hooks/useDocumentsStats';
export { useDocumentsQuery, toApiFilters } from './hooks/useDocumentsQuery';
export type {
  DocumentsQueryState,
  DocumentsQueryUpdates,
  LimitOption,
} from './hooks/useDocumentsQuery';
