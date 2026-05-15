'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Input, Label } from '@/shared/components/ui';
import { Heading } from '@/shared/components/Layout';
import { AuthLayout } from './AuthLayout';

const REGISTER_FEATURES = [
  'Extracción automática de datos con Gemini AI',
  'Soporte para imágenes y documentos PDF',
  'Consulta en lenguaje natural sobre cualquier documento',
];

function RegisterBrandContent() {
  return (
    <>
      <Heading level={1} as="h2" className="text-fg-inverse font-normal leading-snug mb-6">
        Comienza a digitalizar tus documentos<br />
        <span className="text-brand-ink-200">con inteligencia artificial.</span>
      </Heading>
      <div className="space-y-3">
        {REGISTER_FEATURES.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <div className="mt-0.5 w-4 h-4 rounded-full bg-brand-ink-600 flex items-center justify-center flex-shrink-0">
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="currentColor" className="text-brand-ink-200" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-brand-ink-200 text-body-sm leading-relaxed">{item}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const { register, loading, error, token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (token && !loading) router.replace('/');
  }, [token, loading, router]);

  if (token && !loading) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register(name, email, password);
    if (result) router.push('/');
  };

  return (
    <AuthLayout brandContent={<RegisterBrandContent />}>
      <div className="mb-6 sm:mb-8">
        <Heading level={1} className="mb-1">Crear cuenta</Heading>
        <p className="text-fg-secondary text-body-sm">Completa los datos para comenzar</p>
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 bg-danger-bg border border-danger-border rounded-md text-danger-fg text-body-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-name">Nombre completo</Label>
          <Input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            required
            autoComplete="name"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-email">Correo electrónico</Label>
          <Input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@empresa.com"
            required
            autoComplete="email"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="register-password">Contraseña</Label>
          <Input
            id="register-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            minLength={6}
            required
            autoComplete="new-password"
          />
        </div>

        <Button type="submit" loading={loading} className="w-full mt-1">
          {loading ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>

      <p className="mt-6 text-center text-fg-secondary text-body-sm">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-fg-link hover:underline font-medium transition-colors">
          Inicia sesión
        </a>
      </p>
    </AuthLayout>
  );
}
