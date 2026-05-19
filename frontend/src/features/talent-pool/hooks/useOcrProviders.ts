'use client';

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/shared/auth/authStore';
import { ocrClient } from '@/features/ocr/client';
import type { ProviderId, ProviderInfo } from '@/features/ocr/types/ocr.types';

export const ocrProvidersQueryKey = ['ocr', 'providers'] as const;

interface UseOcrProvidersResult {
  readonly providers: ProviderInfo[];
  readonly loadingProviders: boolean;
  readonly providersError: string | null;
  readonly selectedProvider: ProviderId;
  readonly selectedModel: string | undefined;
  readonly selectProvider: (provider: ProviderId, firstModelId?: string) => void;
  readonly selectModel: (modelId: string | undefined) => void;
}

const DEFAULT_PROVIDER: ProviderId = 'gemini';

/**
 * Carga los providers OCR disponibles y mantiene la selección (provider + modelo).
 * Cuando se conocen los providers, se autoselecciona el preferido (gemini → lmstudio)
 * con su primer modelo. La selección manual posterior la respeta.
 */
export function useOcrProviders(): UseOcrProvidersResult {
  const token = useAuthStore((s) => s.token);

  const query = useQuery({
    queryKey: ocrProvidersQueryKey,
    queryFn: () => ocrClient.getProviders(),
    enabled: Boolean(token),
  });

  const providers = useMemo(
    () => (query.data ?? []).filter((p) => p.available),
    [query.data],
  );

  const [selectedProvider, setSelectedProvider] = useState<ProviderId>(DEFAULT_PROVIDER);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(undefined);
  const [hydrated, setHydrated] = useState(false);

  // Autoselect inicial cuando llegan los providers. No pisa selecciones manuales.
  useEffect(() => {
    if (hydrated || providers.length === 0) return;
    const preferred =
      providers.find((p) => p.id === 'gemini') ?? providers.find((p) => p.id === 'lmstudio');
    if (preferred) {
      setSelectedProvider(preferred.id);
      setSelectedModel(preferred.models[0]?.id);
    }
    setHydrated(true);
  }, [providers, hydrated]);

  return {
    providers,
    loadingProviders: query.isLoading,
    providersError: query.error
      ? query.error instanceof Error
        ? query.error.message
        : 'Error al cargar modos de IA'
      : null,
    selectedProvider,
    selectedModel,
    selectProvider: (provider, firstModelId) => {
      setSelectedProvider(provider);
      setSelectedModel(firstModelId);
    },
    selectModel: setSelectedModel,
  };
}
