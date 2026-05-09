import { useState, useEffect } from 'react';
import { ocrClient } from '@/features/ocr/client';
import type { ProviderInfo } from '@/features/ocr/types/ocr.types';

// Cache a nivel de módulo: la promesa se comparte entre todos los consumidores
let cachePromise: Promise<ProviderInfo[]> | null = null;
let cacheResult: ProviderInfo[] | null = null;

function getProvidersCached(): Promise<ProviderInfo[]> {
  if (cacheResult) return Promise.resolve(cacheResult);
  if (cachePromise) return cachePromise;

  cachePromise = ocrClient.getProviders()
    .then((list) => {
      cacheResult = list;
      return list;
    })
    .catch((err) => {
      cachePromise = null;
      throw err;
    });

  return cachePromise;
}

export function useOCRProviders() {
  const [providers, setProviders] = useState<ProviderInfo[]>(cacheResult ?? []);
  const [loading, setLoading] = useState(!cacheResult);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cacheResult) {
      setProviders(cacheResult);
      setLoading(false);
      return;
    }

    setLoading(true);
    getProvidersCached()
      .then((list) => {
        setProviders(list);
        setError(null);
      })
      .catch(() => {
        setError('No se pudieron cargar los proveedores OCR');
      })
      .finally(() => setLoading(false));
  }, []);

  return { providers, loading, error };
}

export function getGeminiModelFromProviders(providers: ProviderInfo[]): string | null {
  const gemini = providers.find((p) => p.id === 'gemini' && p.available);
  return gemini?.models[0]?.name ?? null;
}
