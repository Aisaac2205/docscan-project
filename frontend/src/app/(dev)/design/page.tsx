import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { DesignSystemGallery } from '@/shared/components/ui/__examples__';

export const metadata: Metadata = {
  title: 'Design system · DocScan',
  robots: { index: false, follow: false },
};

export default function DesignSystemPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }
  return <DesignSystemGallery />;
}
