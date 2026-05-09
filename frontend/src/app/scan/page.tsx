import { Suspense } from 'react';
import { ScannerView } from '@/views/ScannerView/ScannerView';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ScannerView />
    </Suspense>
  );
}
