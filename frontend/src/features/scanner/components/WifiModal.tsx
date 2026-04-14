'use client';

import { SpinnerIcon, WifiIcon, CloseIcon, ScanIcon, TrashIcon } from '@/shared/ui/icons';
import type { WifiStatus, ScannerConfig } from '../types/scanner.types';

interface WifiModalProps {
  wifiIp: string;
  wifiStatus: WifiStatus;
  wifiError: string | null;
  onIpChange: (ip: string) => void;
  onScan: () => void;
  onClose: () => void;
  // configs
  configs: ScannerConfig[];
  pingStatus: Record<string, boolean | null>;
  showAddForm: boolean;
  onShowAddForm: (v: boolean) => void;
  saveName: string;
  onSaveNameChange: (v: string) => void;
  saving: boolean;
  onScanFromConfig: (config: ScannerConfig) => void;
  onSaveConfig: () => void;
  onDeleteConfig: (id: string) => void;
}

function PingDot({ status }: { status: boolean | null | undefined }) {
  if (status === null || status === undefined) {
    return <span className="w-1.5 h-1.5 rounded-full bg-stone-300 inline-block animate-pulse" />;
  }
  return (
    <span className={`w-1.5 h-1.5 rounded-full inline-block ${status ? 'bg-green-500' : 'bg-red-400'}`} />
  );
}

export function WifiModal({
  wifiIp, wifiStatus, wifiError,
  onIpChange, onScan, onClose,
  configs, pingStatus, showAddForm, onShowAddForm,
  saveName, onSaveNameChange, saving,
  onScanFromConfig, onSaveConfig, onDeleteConfig,
}: WifiModalProps) {
  const isScanning = wifiStatus === 'scanning';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <WifiIcon className="text-stone-500" />
            <p className="text-sm font-semibold text-stone-800">Escáner en red</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Saved scanners */}
          {configs.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                Escáneres guardados
              </p>
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center gap-3 px-3 py-2.5 border border-[var(--border)] rounded-lg bg-stone-50 hover:bg-stone-100 transition-colors"
                >
                  <PingDot status={pingStatus[config.id]} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-stone-800 truncate">{config.name}</p>
                    <p className="text-xs text-stone-400 font-mono">{config.ip}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onScanFromConfig(config)}
                      disabled={isScanning || pingStatus[config.id] === false}
                      className="h-7 px-2.5 flex items-center gap-1.5 bg-stone-900 text-white text-xs font-medium rounded-md hover:bg-stone-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {isScanning ? <SpinnerIcon /> : <ScanIcon size={12} />}
                      Escanear
                    </button>
                    <button
                      onClick={() => onDeleteConfig(config.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <TrashIcon size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add form toggle */}
          {!showAddForm ? (
            <button
              onClick={() => onShowAddForm(true)}
              className="w-full h-9 flex items-center justify-center gap-2 border border-dashed border-[var(--border)] rounded-lg text-xs font-medium text-stone-400 hover:text-stone-700 hover:border-stone-400 transition-colors"
            >
              + Agregar escáner
            </button>
          ) : (
            <div className="space-y-3 pt-1">
              {configs.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[var(--border)]" />
                  <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider whitespace-nowrap">Nuevo escáner</p>
                  <div className="flex-1 h-px bg-[var(--border)]" />
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => onSaveNameChange(e.target.value)}
                  placeholder="Ej: Escáner oficina"
                  className="w-full h-9 px-3 border border-[var(--border)] rounded-md bg-white text-stone-800 text-sm input-focus"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                  Dirección IP
                </label>
                <input
                  type="text"
                  value={wifiIp}
                  onChange={(e) => onIpChange(e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full h-9 px-3 border border-[var(--border)] rounded-md bg-white text-stone-800 text-sm font-mono input-focus"
                />
              </div>

              {wifiStatus === 'error' && wifiError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium bg-[var(--error-bg)] border border-[var(--error-border)] text-[var(--error)]">
                  <span>✕</span>
                  <span>{wifiError}</span>
                </div>
              )}

              <div className="bg-stone-50 border border-[var(--border)] rounded-lg px-3 py-3 space-y-1.5">
                <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Cómo encontrar la IP</p>
                <p className="text-xs text-stone-500">1. Imprime una hoja de configuración de red desde el escáner.</p>
                <p className="text-xs text-stone-500">2. O revisá el panel → Red → Dirección IP.</p>
                <p className="text-xs text-stone-500">3. Asegurate de estar en la misma red WiFi.</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onSaveConfig}
                  disabled={saving || !wifiIp.trim() || !saveName.trim()}
                  className="flex-1 h-9 flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? <><SpinnerIcon />Guardando...</> : 'Guardar escáner'}
                </button>
                <button
                  onClick={onScan}
                  disabled={isScanning || !wifiIp.trim()}
                  className="h-9 px-3 flex items-center gap-1.5 border border-[var(--border)] text-stone-600 bg-white text-sm font-medium rounded-lg hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isScanning ? <SpinnerIcon /> : <ScanIcon size={13} />}
                  Probar
                </button>
                <button
                  onClick={() => onShowAddForm(false)}
                  className="h-9 px-3 text-sm font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--border)] flex justify-end">
          <button
            onClick={onClose}
            className="h-9 px-4 text-sm font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
