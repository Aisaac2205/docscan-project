'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Input, Label } from '@/shared/components/ui';
import { Heading } from '@/shared/components/Layout';
import { AuthLayout } from './AuthLayout';

const LOGIN_STATS = [
  { label: 'Modos OCR', value: '5' },
  { label: 'Formatos', value: 'PDF + Imagen' },
  { label: 'Motor IA', value: 'Gemini' },
];

function LoginBrandContent() {
  return (
    <>
      <blockquote className="text-brand-ink-200 text-h2 font-normal leading-relaxed mb-8">
        &ldquo;Digitaliza, organiza y extrae datos de tus documentos con precisión mediante inteligencia artificial.&rdquo;
      </blockquote>
      <div className="grid grid-cols-3 gap-4">
        {LOGIN_STATS.map((stat) => (
          <div key={stat.label} className="border border-brand-ink-600 rounded-lg p-4">
            <div className="text-fg-inverse text-h4">{stat.value}</div>
            <div className="text-brand-ink-400 text-caption mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { login, loading, error, token } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token && !loading) router.replace('/');
  }, [token, loading, router]);

  if (token && !loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result) router.push('/');
  };

  return (
    <AuthLayout brandContent={<LoginBrandContent />}>
      <div className="mb-6 sm:mb-8">
        <Heading level={1} className="mb-1">Bienvenido de vuelta</Heading>
        <p className="text-fg-secondary text-body-sm">Ingresa tus credenciales para continuar</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-danger-bg border border-danger-border rounded-md text-danger-fg text-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-email">Correo electrónico</Label>
          <Input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@empresa.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="login-password">Contraseña</Label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>

        <Button
          type="submit"
          loading={loading}
          className="w-full mt-1 bg-brand-ink-700 hover:bg-brand-ink-700 active:bg-brand-ink-700 text-white transition-none"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </Button>
      </form>

      <p className="mt-6 text-center text-fg-secondary text-body-sm">
        ¿No tienes cuenta?{' '}
        <a href="/register" className="text-fg-link hover:underline font-medium transition-colors">
          Regístrate gratis
        </a>
      </p>
    </AuthLayout>
  );
}
