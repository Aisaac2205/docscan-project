'use client';

import { SpinnerIcon, BluetoothIcon, CloseIcon, PrintIcon } from '@/shared/ui/icons';
import type { BtStatus } from '../types/scanner.types';

interface BluetoothModalProps {
  btStatus: BtStatus;
  btDeviceName: string | null;
  btError: string | null;
  hasResult: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onPrint: () => void;
  onClose: () => void;
}

export function BluetoothModal({
  btStatus, btDeviceName, btError, hasResult,
  onConnect, onDisconnect, onPrint, onClose,
}: BluetoothModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BluetoothIcon className="text-stone-500" />
            <p className="text-sm font-semibold text-stone-800">Dispositivo Bluetooth</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-md text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {btStatus === 'connected' && btDeviceName ? (
            <div className="flex items-center gap-3 bg-stone-50 border border-[var(--border)] rounded-xl p-4">
              <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center flex-shrink-0">
                <BluetoothIcon className="text-white" size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-stone-800">{btDeviceName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  <p className="text-xs text-stone-400">Emparejado</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-stone-400 leading-relaxed">
              Empareja una impresora o escáner Bluetooth. El navegador mostrará los
              dispositivos cercanos disponibles. Asegúrate de que el dispositivo esté
              encendido y en modo de emparejamiento.
            </p>
          )}

          {btStatus === 'error' && btError && (
            <div className="px-3 py-2 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-md text-[var(--error)] text-xs">
              {btError}
            </div>
          )}

          {btStatus !== 'connected' && (
            <div className="bg-stone-50 border border-[var(--border)] rounded-lg px-3 py-3 space-y-1.5">
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Impresión por Bluetooth</p>
              <p className="text-xs text-stone-500">1. Empareja el dispositivo con el botón de abajo.</p>
              <p className="text-xs text-stone-500">2. Captura o escanea un documento.</p>
              <p className="text-xs text-stone-500">3. Usa el botón "Imprimir" — el sistema usará la impresora BT emparejada.</p>
            </div>
          )}

          {btStatus === 'connected' && hasResult && (
            <button
              onClick={onPrint}
              className="w-full h-10 flex items-center justify-center gap-2 border border-[var(--border)] text-stone-700 bg-white text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
            >
              <PrintIcon />Imprimir en {btDeviceName}
            </button>
          )}
        </div>

        <div className="px-5 py-4 border-t border-[var(--border)] flex gap-3">
          {btStatus !== 'connected' ? (
            <button
              onClick={onConnect}
              disabled={btStatus === 'connecting'}
              className="flex-1 h-10 flex items-center justify-center gap-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {btStatus === 'connecting'
                ? <><SpinnerIcon />Buscando dispositivos...</>
                : <><BluetoothIcon className="text-white" />Buscar dispositivos</>}
            </button>
          ) : (
            <button
              onClick={onDisconnect}
              className="flex-1 h-10 flex items-center justify-center gap-2 border border-[var(--border)] text-stone-600 bg-white text-sm font-medium rounded-lg hover:bg-stone-50 transition-colors"
            >
              Desconectar
            </button>
          )}
          <button
            onClick={onClose}
            className="h-10 px-4 text-sm font-medium border border-[var(--border)] text-stone-600 bg-white rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
