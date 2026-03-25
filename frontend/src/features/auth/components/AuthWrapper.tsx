'use client';

import { ReactNode } from 'react';

/**
 * Wrapper de Autenticación.
 * Componente Client-side que se encarga de reestructurar estados o redirigir en caso de tokens vencidos.
 * Siguiendo SRP, toda lógica relacionada con "Sesiones y Usuarios" vive en la feature Auth.
 */
export function AuthWrapper({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
