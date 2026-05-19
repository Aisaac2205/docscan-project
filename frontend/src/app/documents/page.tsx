import { Suspense } from 'react';
import { DocumentsView } from '@/views/DocumentsView/DocumentsView';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <DocumentsView />
    </Suspense>
  );
}
