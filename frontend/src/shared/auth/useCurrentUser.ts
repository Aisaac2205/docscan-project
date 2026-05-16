'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuthStore } from './authStore';

export type CurrentUser = {
  id: string;
  email: string;
  name?: string | null;
};

export const currentUserQueryKey = ['auth', 'me'] as const;

async function fetchCurrentUser(): Promise<CurrentUser> {
  const res = await api.get<CurrentUser>('/api/auth/me');
  return res.data;
}

/**
 * Single source of truth for the logged-in user.
 * Cached for the lifetime of the session (staleTime: Infinity).
 * Refreshes only on explicit invalidation (login/register) or hard reload.
 */
export function useCurrentUser() {
  const token = useAuthStore((s) => s.token);

  return useQuery({
    queryKey: currentUserQueryKey,
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: (failureCount, err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) return false;
      return failureCount < 1;
    },
  });
}
