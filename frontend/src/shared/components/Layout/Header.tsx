'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

export function Header() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <header
      style={{ height: 'var(--header-height)' }}
      className="fixed top-0 left-0 right-0 z-30 bg-white border-b border-[var(--border)] flex items-center"
    >
      <div
        className="flex items-center h-full px-4 lg:px-5 lg:border-r lg:border-[var(--border)]"
        style={{ width: 'var(--sidebar-width)', minWidth: 'auto' }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <DocScanLogo />
          <span className="font-semibold text-stone-900 text-[15px] tracking-tight">DocScan</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-end px-4 lg:px-5 gap-2 sm:gap-3">
        {user && (
          <>
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-stone-100 border border-[var(--border)] flex items-center justify-center text-xs font-semibold text-stone-600">
                {initials}
              </div>
              <div className="text-sm">
                <span className="text-stone-700 font-medium">{user.name}</span>
                <span className="text-stone-400 ml-1.5 text-xs hidden md:inline">{user.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 h-8 text-sm text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-md transition-all border border-transparent hover:border-[var(--border)] min-h-[44px]"
            >
              <LogoutIcon />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}

function DocScanLogo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <rect width="26" height="26" rx="6" fill="#1C1917" />
      <rect x="6" y="5" width="9" height="12" rx="1.5" fill="white" />
      <rect x="10" y="5" width="9" height="12" rx="1.5" fill="#78716C" />
      <rect x="8" y="18.5" width="13" height="2" rx="1" fill="#57534E" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M6 2H2.5A1.5 1.5 0 0 0 1 3.5v8A1.5 1.5 0 0 0 2.5 13H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M10 10l3-2.5L10 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 7.5H6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

