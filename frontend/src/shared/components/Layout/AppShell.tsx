'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main
        style={{
          paddingLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--header-height)',
          paddingBottom: 'var(--bottom-nav-height)',
        }}
        className="min-h-screen"
      >
        <div className="p-4 md:p-6 max-w-5xl mx-auto">
          {children}
        </div>
      </main>
      <BottomNav />
    </>
  );
}
