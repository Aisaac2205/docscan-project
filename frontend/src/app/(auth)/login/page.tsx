'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';
import { Button, Input, Label } from '@/shared/components/ui';

export default function LoginPage() {
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
    <div className="min-h-screen bg-surface-page flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-brand-ink-700 flex-col justify-between p-12 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <DocScanIcon />
            <span className="text-fg-inverse text-h4 tracking-tight">DocScan</span>
          </div>
        </div>
        <div>
          <blockquote className="text-brand-ink-200 text-h2 font-normal leading-relaxed mb-8">
            &ldquo;Digitaliza, organiza y extrae datos de tus documentos con precisión mediante inteligencia artificial.&rdquo;
          </blockquote>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Modos OCR', value: '5' },
              { label: 'Formatos', value: 'PDF + Imagen' },
              { label: 'Motor IA', value: 'Gemini' },
            ].map((stat) => (
              <div key={stat.label} className="border border-brand-ink-600 rounded-lg p-4">
                <div className="text-fg-inverse text-h4">{stat.value}</div>
                <div className="text-brand-ink-400 text-caption mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-brand-ink-400 text-body-sm">
          &copy; {new Date().getFullYear()} DocScan. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <DocScanIcon dark />
            <span className="text-h4 tracking-tight">DocScan</span>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-h1 mb-1">Bienvenido de vuelta</h1>
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

            <Button type="submit" loading={loading} className="w-full mt-1">
              {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <p className="mt-6 text-center text-fg-secondary text-body-sm">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-fg-link hover:underline font-medium transition-colors">
              Regístrate gratis
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

function DocScanIcon({ dark }: { dark?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="DocScan"
      width={28}
      height={28}
      className={dark ? undefined : 'invert'}
      priority
    />
  );
}
