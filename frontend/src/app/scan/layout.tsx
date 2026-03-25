import { AppShell } from '@/shared/components/Layout/AppShell';
import { ReactNode } from 'react';

export default function ScanLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
