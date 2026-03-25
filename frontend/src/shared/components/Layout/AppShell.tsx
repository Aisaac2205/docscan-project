'use client';

import { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <Sidebar />
      <main
        style={{
          paddingLeft: 'var(--sidebar-width)',
          paddingTop: 'var(--header-height)',
        }}
        className="min-h-screen"
      >
        <div className="p-6 max-w-5xl">
          {children}
        </div>
      </main>
    </>
  );
}
