'use client';

import { usePathname, useRouter } from 'next/navigation';

const tabs = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="1" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="5" y="3" width="9" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M7 7h4M7 9.5h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside
      style={{ width: 'var(--sidebar-width)', top: 'var(--header-height)' }}
      className="hidden lg:flex fixed left-0 bottom-0 bg-white border-r border-[var(--border)] flex-col pt-4 pb-4 z-20"
    >
      <nav className="flex-1 px-2">
        <p className="px-3 mb-2 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
          Principal
        </p>
        <div className="space-y-0.5">
          {tabs.map((tab) => {
            const active = pathname === tab.path;
            return (
              <button
                key={tab.id}
                onClick={() => router.push(tab.path)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium text-left transition-all ${
                  active
                    ? 'bg-stone-100 text-stone-900'
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <span className={active ? 'text-stone-700' : 'text-stone-400'}>
                  {tab.icon}
                </span>
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="px-4 mt-4 space-y-2">
        <div className="p-3 bg-stone-50 rounded-lg border border-[var(--border)]">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-2">
            Hardware
          </p>
          <div className="space-y-1.5">
            {[
              { label: 'Escáner' },
              { label: 'Cámara' },
              { label: 'Impresora' },
            ].map(({ label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 bg-stone-400" />
                <span className="text-xs text-stone-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-stone-50 rounded-lg border border-[var(--border)]">
          <p className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider mb-1">OCR</p>
          <p className="text-xs text-stone-400 leading-relaxed">Gemini 2.5 Flash</p>
        </div>
      </div>
    </aside>
  );
}
