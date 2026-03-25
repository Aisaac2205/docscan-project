import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Base URL for backend API (can be overridden via env in Next.js)
const API_BASE = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
  ? process.env.NEXT_PUBLIC_API_URL
  : 'http://localhost:3001';

const TOKEN_STORAGE_KEY = 'docscan_token';

// Typed wrapper around Axios instance
export interface ApiClient extends AxiosInstance {
  setToken: (token: string | null) => void;
  getToken: () => string | null;
}

function readTokenFromStorage(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeTokenToStorage(token: string | null) {
  if (typeof window === 'undefined') return;
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    else localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // ignore storage errors
  }
}

const axiosInstance = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false,
});

const api = axiosInstance as ApiClient;

api.setToken = (token: string | null) => {
  writeTokenToStorage(token);
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    // also write a client-side cookie so server-side middleware can read it
    if (typeof document !== 'undefined') {
      try {
        // set cookie for 7 days
        document.cookie = `docscan_token=${encodeURIComponent(token)}; Path=/; Max-Age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      } catch {}
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    if (typeof document !== 'undefined') {
      try { document.cookie = 'docscan_token=; Path=/; Max-Age=0; SameSite=Lax'; } catch {}
    }
  }
};

api.getToken = () => readTokenFromStorage();

// Initialize token from storage on load (client-side)
const initialToken = readTokenFromStorage();
if (initialToken) api.setToken(initialToken);

// Request interceptor: ensure Authorization header is present
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = api.getToken();
  if (token && config && config.headers) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle global errors (401 -> redirect to /login)
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 && typeof window !== 'undefined') {
      const isOnLoginPage = window.location.pathname === '/login';
      // Only redirect if not already on login page (avoids loop on bad credentials)
      if (!isOnLoginPage) {
        api.setToken(null);
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export { api, TOKEN_STORAGE_KEY };
