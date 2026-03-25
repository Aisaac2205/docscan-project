import { useEffect } from 'react';
import { useAuth } from '@/shared/hooks/useAuth';
import { useDocumentStore } from '../../documents/store';

export function useDashboardStats() {
  const { user } = useAuth();
  const { documents, fetchDocuments, loading } = useDocumentStore();

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = {
    total: documents.length,
    completed: documents.filter((d) => d.status === 'completed').length,
    pending: documents.filter((d) => d.status === 'pending').length,
  };

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  return { firstName, stats, loading };
}
