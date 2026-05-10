'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-page px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-display-lg mb-4">😵</div>
        <h2 className="text-h1 text-fg-primary mb-4">¡Algo salió mal!</h2>
        <p className="text-body text-fg-secondary mb-6">
          Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-fg-primary text-fg-inverse text-button-lg rounded-md hover:opacity-90 transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}
