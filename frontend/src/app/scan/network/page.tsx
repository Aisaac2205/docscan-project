import { Suspense } from 'react';
import { NetworkScanView } from '@/views/ScannerView/NetworkScanView';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NetworkScanView />
    </Suspense>
  );
}
