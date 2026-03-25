'use client';

import { SpinnerIcon, WifiIcon, CloseIcon, ScanIcon } from '@/shared/ui/icons';
import type { WifiStatus } from '../types/scanner.types';

interface WifiModalProps {
  wifiIp: string;
  wifiPort: string;
  wifiStatus: WifiStatus;
  wifiError: string | null;
  onIpChange: (ip: string) => void;
  onPortChange: (port: string) => void;
  onScan: () => void;
  onClose: () => void;
}

export function WifiModal({ wifiIp, wifiPort, wifiStatus, wifiError, onIpChange, onPortChange, onScan, onClose }: WifiModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <WifiIcon className="text-stone-500" />
            <p className="text-sm font-semibold text-stone-800">Escáner en red</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <p className="text-xs text-stone-400 leading-relaxed">
            Ingresa la dirección IP del escáner de red. Compatible con impresoras multifunción que soporten el protocolo{' '}
            <span className="font-medium text-stone-600">AirScan (eSCL)</span>.
          </p>

          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Dirección IP
              </label>
              <input
                type="text"
                value={wifiIp}
                onChange={(e) => onIpChange(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full h-9 px-3 border border-[var(--border)] rounded-md bg-white text-stone-800 text-sm font-mono focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10 transition-all"
              />
            </div>
            <div className="w-20">
              <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                Puerto
              </label>
              <input
                type="number"
                value={wifiPort}
                onChange={(e) => onPortChange(e.target.value)}
                placeholder="80"
                className="w-full h-9 px-3 border border-[var(--border)] rounded-md bg-white text-stone-800 text-sm font-mono focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-900/10 transition-all"
              />
            </div>
          </div>

          {wifiStatus !== 'idle' && (
            <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${
              wifiStatus === 'error'
                ? 'bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]'
                : 'bg-stone-50 border border-[var(--border)] text-stone-600'
            }`}>
              {wifiStatus === 'scanning' && <SpinnerIcon className="text-stone-400" />}
              {wifiStatus === 'error' && <span className="text-[var(--error)]">✕</span>}
              <span>
                {wifiStatus === 'scanning' && 'Conectando y escaneando…'}
                {wifiStatus === 'error' && (wifiError || 'Error de conexión')}
              </span>
            </div>
          )}

          <div className="bg-stone-50 border border-[var(--border)] rounded-lg px-3 py-3 space-y-1.5">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Cómo encontrar la IP</p>
            <p className="text-xs text-stone-500">1. Imprime una hoja de configuración de red desde el escáner.</p>
            <p className="text-xs text-stone-500">2. O revisa el panel de la impresora → Red → Dirección IP.</p>
            <p className="text-xs text-stone-500">3. Asegúrate de estar en la misma red WiFi.</p>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-[var(--border)] flex gap-3">
          <button
            onClick={onScan}
            disabled={wifiStatus === 'scanning' || !wifiIp.trim()}
            className="flex-1 h-10 flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {wifiStatus === 'scanning'
              ? <><SpinnerIcon />Escaneando...</>
              : <><ScanIcon />Iniciar escaneo</>}
          </button>
          <button
            onClick={onClose}
            className="h-10 px-4 text-sm font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
