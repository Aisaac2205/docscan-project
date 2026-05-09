'use client';

import { useRouter } from 'next/navigation';

interface WelcomeBannerProps {
  firstName: string;
}

export function WelcomeBanner({ firstName }: WelcomeBannerProps) {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-800 via-stone-900 to-black p-6 md:p-8 mb-6 md:mb-8">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-white/5 rounded-full translate-y-1/3" />

      <div className="relative z-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">
          ¡Bienvenido de vuelta, {firstName}!
        </h2>
        <p className="text-stone-300 text-sm md:text-base max-w-xl mb-5">
          ¿Listo para continuar con el escaneo de tus documentos?
        </p>
      </div>
    </div>
  );
}

function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 11V3M8 3L4 7M8 3l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 13v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
