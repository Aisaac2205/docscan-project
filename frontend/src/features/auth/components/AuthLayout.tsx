import { ReactNode } from 'react';
import { DocScanIcon } from './DocScanIcon';

interface AuthLayoutProps {
  brandContent: ReactNode;
  children: ReactNode;
}

export function AuthLayout({ brandContent, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface-page flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-brand-ink-700 flex-col justify-between p-12 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <DocScanIcon />
            <span className="text-fg-inverse text-h4 tracking-tight">DocScan</span>
          </div>
        </div>
        <div>{brandContent}</div>
        <div className="text-brand-ink-400 text-body-sm">
          &copy; {new Date().getFullYear()} DocScan. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <DocScanIcon dark />
            <span className="text-h4 tracking-tight">DocScan</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
