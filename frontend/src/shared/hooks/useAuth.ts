'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { useAuthStore } from '../auth/authStore';
import { useCurrentUser, currentUserQueryKey, type CurrentUser } from '../auth/useCurrentUser';

/**
 * Compat surface kept identical to the previous hook so existing consumers
 * (LoginForm, RegisterForm, Header, useDashboardStats) keep working unchanged.
 * Internally backed by Zustand (token) + react-query (current user).
 */
export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.token);
  const setToken = useAuthStore((s) => s.setToken);
  const clearToken = useAuthStore((s) => s.clearToken);

  const userQuery = useCurrentUser();

  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const login = useCallback(
    async (email: string, password: string) => {
      setError(null);
      setActionLoading(true);
      try {
        const res = await api.post<{ accessToken: string }>('/api/auth/login', { email, password });
        setToken(res.data.accessToken);
        const me = await queryClient.fetchQuery({
          queryKey: currentUserQueryKey,
          queryFn: async () => (await api.get<CurrentUser>('/api/auth/me')).data,
          staleTime: Infinity,
        });
        return me;
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(message || 'Login failed');
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [queryClient, setToken],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setError(null);
      setActionLoading(true);
      try {
        await api.post('/api/auth/register', { name, email, password });
        const res = await api.post<{ accessToken: string }>('/api/auth/login', { email, password });
        setToken(res.data.accessToken);
        const me = await queryClient.fetchQuery({
          queryKey: currentUserQueryKey,
          queryFn: async () => (await api.get<CurrentUser>('/api/auth/me')).data,
          staleTime: Infinity,
        });
        return me;
      } catch (err: unknown) {
        const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setError(message || 'Registration failed');
        return null;
      } finally {
        setActionLoading(false);
      }
    },
    [queryClient, setToken],
  );

  const logout = useCallback(() => {
    clearToken();
    queryClient.removeQueries({ queryKey: currentUserQueryKey });
    queryClient.clear();
    if (typeof window !== 'undefined') router.push('/login');
  }, [clearToken, queryClient, router]);

  return {
    token,
    user: userQuery.data ?? null,
    loading: actionLoading || (Boolean(token) && userQuery.isLoading),
    error,
    login,
    register,
    logout,
    setError,
  } as const;
}
