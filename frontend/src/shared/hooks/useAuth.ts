'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, TOKEN_STORAGE_KEY } from '../api/client'; //

type User = {
  id: string;
  email: string;
  name?: string | null;
};

// 1. El estado solo maneja la data pura, sin funciones
type AuthState = {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
};

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    loading: true,  // always start as loading until fetchMe() resolves
    error: null
  });

  // Fetch current user when token exists
  useEffect(() => {
    let mounted = true;
    async function fetchMe() {
      const token = api.getToken();
      if (!token) {
        setState({ token: null, user: null, loading: false, error: null });
        return;
      }
      setState((s) => ({ ...s, loading: true }));
      try {
        const res = await api.get<{ id: string; email: string; name?: string | null }>('/api/auth/me');
        if (!mounted) return;
        setState({ token, user: res.data, loading: false, error: null });
      } catch (err: any) {
        if (!mounted) return;
        // Only clear token on auth errors (401), not network/server errors
        if (err?.response?.status === 401) {
          api.setToken(null);
          setState({ token: null, user: null, loading: false, error: null });
        } else {
          // Keep token, just stop loading — may recover on retry
          setState((s) => ({ ...s, loading: false }));
        }
      }
    }
    fetchMe();
    return () => { mounted = false; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      const res = await api.post<{ accessToken: string }>('/api/auth/login', { email, password });
      const token = res.data.accessToken;
      api.setToken(token);
      const me = await api.get<User>('/api/auth/me');
      setState({ token, user: me.data, loading: false, error: null });
      return me.data;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err?.response?.data?.message || 'Login failed', loading: false }));
      return null;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((s) => ({ ...s, error: null }));
    try {
      await api.post('/api/auth/register', { name, email, password });
      const res = await api.post<{ accessToken: string }>('/api/auth/login', { email, password });
      const token = res.data.accessToken;
      api.setToken(token);
      const me = await api.get<User>('/api/auth/me');
      setState({ token, user: me.data, loading: false, error: null });
      return me.data;
    } catch (err: any) {
      setState((s) => ({ ...s, error: err?.response?.data?.message || 'Registration failed', loading: false }));
      return null;
    }
  }, []);

  const logout = useCallback(() => {
    api.setToken(null);
    setState({ token: null, user: null, loading: false, error: null });
    if (typeof window !== 'undefined') window.location.href = '/login';
  }, []);

  // 2. La función sigue existiendo y actualiza el estado correctamente
  const setError = useCallback((e: string | null) => {
    setState((s) => ({ ...s, error: e }));
  }, []);

  return {
    token: state.token,
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    register,
    logout,
    setError,
  } as const;
}