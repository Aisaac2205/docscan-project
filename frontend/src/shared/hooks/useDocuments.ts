import { useDocumentStore } from '@/features/documents/store';

export function useDocuments() {
  const { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument } = useDocumentStore();
  return { documents, loading, error, fetchDocuments, uploadDocument, deleteDocument };
}
