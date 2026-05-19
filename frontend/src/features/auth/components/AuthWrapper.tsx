'use client';

import { ReactNode } from 'react';
import { useHydrateAuth } from '@/shared/auth/authStore';

/**
 * Wrapper de Autenticación.
 * Componente Client-side que se encarga de reestructurar estados o redirigir en caso de tokens vencidos.
 * Siguiendo SRP, toda lógica relacionada con "Sesiones y Usuarios" vive en la feature Auth.
 *
 * `useHydrateAuth` syncs the persisted token from localStorage after mount,
 * ensuring SSR and CSR start with the same `token = null` (no hydration mismatch).
 */
export function AuthWrapper({ children }: { children: ReactNode }) {
  useHydrateAuth();
  return <>{children}</>;
}
