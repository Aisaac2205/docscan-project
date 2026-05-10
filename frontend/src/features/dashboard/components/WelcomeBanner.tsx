'use client';

interface WelcomeBannerProps {
  firstName: string;
}

export function WelcomeBanner({ firstName }: WelcomeBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-brand-ink-700 p-6 md:p-8 mb-6 md:mb-8">
      {/* Decorative blobs */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-fg-inverse/5 rounded-full -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-1/2 w-48 h-48 bg-fg-inverse/5 rounded-full translate-y-1/3" />

      <div className="relative z-10">
        <h2 className="text-h1 text-fg-inverse mb-2">
          ¡Bienvenido de vuelta, {firstName}!
        </h2>
        <p className="text-brand-ink-200 text-body max-w-xl">
          ¿Listo para continuar con el escaneo de tus documentos?
        </p>
      </div>
    </div>
  );
}
