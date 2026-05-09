'use client';

import { useRouter } from 'next/navigation';

export function UploadZone() {
  const router = useRouter();

  const goToScan = () => router.push('/scan');

  return (
    <div className="mb-6 md:mb-8">
      <h3 className="text-lg font-semibold text-stone-800 mb-4">Procesar nuevos documentos</h3>

      <button
        onClick={goToScan}
        className="w-full relative border-2 border-dashed rounded-2xl p-8 md:p-10 text-center transition-all cursor-pointer border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50"
      >
        <div className="w-14 h-14 rounded-xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
          <CloudUploadIcon />
        </div>
        <p className="text-sm font-medium text-stone-700 mb-1">
          Capturá o subí documentos
        </p>
        <p className="text-xs text-stone-400 mb-4">
          Cámara, escáner de red o arrastrá archivos
        </p>
        <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 transition-colors">
          Ir al escáner
        </span>
      </button>

      <p className="text-xs text-stone-400 mt-3">Soporta PDF, JPG, PNG hasta 20 MB cada uno</p>
    </div>
  );
}

function CloudUploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 4c-3.3 0-6 2.46-6 5.5 0 .43.06.84.17 1.24A4.5 4.5 0 0 0 6 19h11c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96C17.12 6.56 14.76 4 12 4z" stroke="#78716C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 12v4M12 12l-2 2M12 12l2 2" stroke="#78716C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


