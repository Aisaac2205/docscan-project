'use client';

import { create } from 'zustand';
import { api, TOKEN_STORAGE_KEY } from '../api/client';

type AuthState = {
  token: string | null;
  setToken: (token: string | null) => void;
  clearToken: () => void;
};

function readInitialToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  token: readInitialToken(),
  setToken: (token) => {
    api.setToken(token);
    set({ token });
  },
  clearToken: () => {
    api.setToken(null);
    set({ token: null });
  },
}));
