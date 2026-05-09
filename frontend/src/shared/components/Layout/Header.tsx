'use client';

import React from 'react';
import Image from 'next/image';
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
      className="fixed top-0 left-0 right-0 z-30 bg-surface-card border-b border-border flex items-center"
    >
      <div
        className="flex items-center h-full px-4 lg:px-5 lg:border-r lg:border-border"
        style={{ width: 'var(--sidebar-width)', minWidth: 'auto' }}
      >
        <Link href="/" className="flex items-center gap-2 group">
          <DocScanLogo />
          <span className="text-h4 text-fg-primary tracking-tight">DocScan</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-end px-4 lg:px-5 gap-2 sm:gap-3">
        {user && (
          <>
            <div className="hidden sm:flex items-center gap-2.5">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-surface-sunken border border-border flex items-center justify-center text-caption text-fg-secondary">
                {initials}
              </div>
              <div className="text-body-sm">
                <span className="text-fg-primary font-medium">{user.name}</span>
                <span className="text-fg-tertiary ml-1.5 text-caption hidden md:inline">{user.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 h-8 text-button-sm text-fg-secondary hover:text-fg-primary hover:bg-surface-sunken rounded-md transition-all border border-transparent hover:border-border min-h-[44px]"
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
    <Image src="/logo.png" alt="DocScan" width={30} height={30} priority style={{ width: 'var(--header-logo-size)', height: 'var(--header-logo-size)' }} />
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
