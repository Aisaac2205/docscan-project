import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';
import { AuthResponse, LoginDto, RegisterDto } from '@/types/api.types';

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (dto: LoginDto): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/login', dto);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (dto: RegisterDto): Promise<AuthResponse | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient.post<AuthResponse>('/auth/register', dto);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user));
      }
      return response;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al registrarse');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }, []);

  const getUser = useCallback(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }, []);

  return {
    loading,
    error,
    login,
    register,
    logout,
    getToken,
    getUser,
  };
}
