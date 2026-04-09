'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/shared/hooks/useAuth';

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
    <div className="min-h-screen bg-[var(--bg)] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[480px] bg-stone-900 flex-col justify-between p-12 flex-shrink-0">
        <div>
          <div className="flex items-center gap-2.5">
            <DocScanIcon />
            <span className="text-white font-semibold text-lg tracking-tight">DocScan</span>
          </div>
        </div>
        <div>
          <blockquote className="text-stone-300 text-xl font-light leading-relaxed mb-8">
            &ldquo;Digitaliza, organiza y extrae datos de tus documentos con precisión mediante inteligencia artificial.&rdquo;
          </blockquote>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Modos OCR', value: '5' },
              { label: 'Formatos', value: 'PDF + Imagen' },
              { label: 'Motor IA', value: 'Gemini 2.5' },
            ].map((stat) => (
              <div key={stat.label} className="border border-stone-700 rounded-lg p-4">
                <div className="text-white font-semibold text-lg">{stat.value}</div>
                <div className="text-stone-500 text-xs mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-stone-600 text-sm">
          &copy; {new Date().getFullYear()} DocScan. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-[360px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <DocScanIcon dark />
            <span className="font-semibold text-lg tracking-tight">DocScan</span>
          </div>

          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-semibold text-stone-900 mb-1">Bienvenido de vuelta</h1>
            <p className="text-stone-500 text-sm">Ingresa tus credenciales para continuar</p>
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-md text-[var(--error)] text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nombre@empresa.com"
                className="w-full h-10 px-3 border border-[var(--border)] rounded-md bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 border border-[var(--border)] rounded-md bg-white text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 mt-1 bg-stone-900 text-white text-sm font-medium rounded-md hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <SpinnerIcon />
                  Iniciando sesión...
                </>
              ) : 'Iniciar sesión'}
            </button>
          </form>

          <p className="mt-6 text-center text-stone-500 text-sm">
            ¿No tienes cuenta?{' '}
            <a href="/register" className="text-accent-600 hover:text-accent-700 font-medium transition-colors">
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
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect width="28" height="28" rx="6" fill={dark ? '#1C1917' : 'white'} />
      <rect x="7" y="6" width="10" height="13" rx="1.5" fill={dark ? 'white' : '#1C1917'} />
      <rect x="11" y="6" width="10" height="13" rx="1.5" fill={dark ? '#A8A29E' : '#78716C'} />
      <rect x="9" y="20" width="14" height="2" rx="1" fill={dark ? '#78716C' : '#A8A29E'} />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin" width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M7 1.5A5.5 5.5 0 0 1 12.5 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
