'use client';

import { useEffect } from 'react';
import { create } from 'zustand';
import { api, TOKEN_STORAGE_KEY } from '../api/client';

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  setToken: (token) => {
    api.setToken(token);
    set({ token });
  },
  clearToken: () => {
    api.setToken(null);
    set({ token: null });
  },
}));

/**
 * Syncs the auth token from localStorage after client mount.
 * Must be called once in a top-level layout or provider.
 *
 * SSR always starts with `token = null` (no localStorage).
 * After hydration, this effect reads the persisted token and
 * updates the store — triggering react-query to kick off.
 */
export function useHydrateAuth(): void {
  useEffect(() => {
    try {
      const persisted = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (persisted) {
        useAuthStore.getState().setToken(persisted);
      }
    } catch {
      // localStorage unavailable — stay unauthenticated
    }
  }, []);
}
