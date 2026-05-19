import { Suspense } from 'react';
import { PersonsView } from '@/views/PersonsView/PersonsView';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PersonsView />
    </Suspense>
  );
}
