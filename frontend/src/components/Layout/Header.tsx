'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const router = useRouter();
  const { logout, getUser } = useAuth();
  const user = getUser();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary-600">DocScan</h1>
            <span className="ml-2 text-sm text-gray-500">OCR Scanner</span>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-sm">
                <span className="text-gray-700 font-medium">{user.name}</span>
                <span className="text-gray-500 ml-2">({user.email})</span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
