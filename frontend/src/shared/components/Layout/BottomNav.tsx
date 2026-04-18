'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  {
    id: 'dashboard',
    label: 'Inicio',
    path: '/dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
  },
  {
    id: 'scan',
    label: 'Escanear',
    path: '/scan',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 5h14" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M5 11v4M8 11v4M11 11v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'documents',
    label: 'Documentos',
    path: '/documents',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="5" y="3" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7 7h4M7 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: 'talent-pool',
    label: 'Bolsa',
    path: '/talent-pool',
    icon: (
      <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="5" r="2.25" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="11" cy="5" r="2.25" stroke="currentColor" strokeWidth="1.3" />
        <path d="M1.75 13c0-1.9 1.56-3.45 3.5-3.45h1.5c1.94 0 3.5 1.55 3.5 3.45" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M7.75 13c0-1.55 1.27-2.8 2.85-2.8h.8c1.57 0 2.85 1.25 2.85 2.8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav
      style={{ height: 'var(--bottom-nav-height)' }}
      className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[var(--border)] flex items-center justify-around px-2 safe-bottom"
    >
      {tabs.map((tab) => {
        const active = pathname === tab.path;
        return (
          <button
            key={tab.id}
            onClick={() => router.push(tab.path)}
            className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 py-1.5 transition-colors min-h-[44px] ${
              active ? 'text-stone-900' : 'text-stone-400 active:text-stone-600'
            }`}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-stone-900 rounded-full" />
            )}
            <span className={active ? 'text-stone-700' : 'text-stone-400'}>
              {tab.icon}
            </span>
            <span className={`text-[10px] font-medium ${active ? 'text-stone-900' : 'text-stone-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
