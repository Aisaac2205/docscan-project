import { AppShell } from '@/shared/components/Layout/AppShell';
import { ReactNode } from 'react';

export default function InboxLayout({ children }: { children: ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
