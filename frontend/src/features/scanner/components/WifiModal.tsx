'use client';

import { useState } from 'react';
import {
  SpinnerIcon,
  ScannerDeviceIcon,
  CloseIcon,
  ScanIcon,
  TrashIcon,
  ChevronDownIcon,
  WifiIcon,
} from '@/shared/ui/icons';
import { Heading } from '@/shared/components/Layout';
import type { WifiStatus, ScannerConfig } from '../types/scanner.types';

interface WifiModalProps {
  wifiIp: string;
  wifiStatus: WifiStatus;
  wifiError: string | null;
  onIpChange: (ip: string) => void;
  onScan: () => void;
  onClose: () => void;
  configs: ScannerConfig[];
  pingStatus: Record<string, boolean | null>;
  showAddForm: boolean;
  onShowAddForm: (v: boolean) => void;
  saveName: string;
  onSaveNameChange: (v: string) => void;
  savePort: number | null;
  onSavePortChange: (v: number | null) => void;
  effectivePort: number;
  saveUseTls: boolean;
  onSaveUseTlsChange: (v: boolean) => void;
  saveVerifyTls: boolean;
  onSaveVerifyTlsChange: (v: boolean) => void;
  saving: boolean;
  discovering: boolean;
  onScanFromConfig: (config: ScannerConfig) => void;
  onSaveConfig: () => void;
  onDeleteConfig: (id: string) => void;
  onDiscover: () => void;
}

function SourceBadge({ source }: { source: ScannerConfig['discoveredVia'] }) {
  if (source === 'MANUAL') return null;
  const label = source === 'MDNS' ? 'auto' : 'sistema';
  return (
    <span className="px-1.5 py-0.5 text-caption font-medium rounded bg-surface-card border border-border text-fg-tertiary">
      {label}
    </span>
  );
}

function PingDot({ status }: { status: boolean | null | undefined }) {
  if (status === null || status === undefined) {
    return <span className="w-1.5 h-1.5 rounded-full bg-border-strong inline-block animate-pulse" />;
  }
  return (
    <span className={`w-1.5 h-1.5 rounded-full inline-block ${status ? 'bg-success-fg' : 'bg-danger-fg'}`} />
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2.5 cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-border accent-[var(--color-fg-primary)]"
      />
      <span className="flex-1 min-w-0">
        <span className="block text-body-sm font-medium text-fg-primary">{label}</span>
        {hint && <span className="block text-caption text-fg-tertiary">{hint}</span>}
      </span>
    </label>
  );
}

export function WifiModal({
  wifiIp, wifiStatus, wifiError,
  onIpChange, onScan, onClose,
  configs, pingStatus, showAddForm, onShowAddForm,
  saveName, onSaveNameChange,
  savePort, onSavePortChange, effectivePort,
  saveUseTls, onSaveUseTlsChange,
  saveVerifyTls, onSaveVerifyTlsChange,
  saving, discovering,
  onScanFromConfig, onSaveConfig, onDeleteConfig, onDiscover,
}: WifiModalProps) {
  const isScanning = wifiStatus === 'scanning';
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-overlay">
      <div className="bg-surface-card rounded-xl shadow-md w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <ScannerDeviceIcon className="text-fg-tertiary" />
            <Heading level={4} as="h2" className="text-fg-primary">Escáner físico</Heading>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-md text-fg-tertiary hover:text-fg-primary hover:bg-surface-sunken transition-colors">
            <CloseIcon />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Auto-discovery trigger. Backend tells us if it actually swept;
              if it didn't (server flag off) the toast surfaces that fact. */}
          <button
            onClick={onDiscover}
            disabled={discovering}
            className="w-full h-10 flex items-center justify-center gap-2 border border-border rounded-md text-button-sm text-fg-secondary bg-surface-card hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {discovering ? <SpinnerIcon /> : <WifiIcon size={14} />}
            {discovering ? 'Buscando…' : 'Buscar escáneres en la red'}
          </button>

          {/* Saved scanners */}
          {configs.length > 0 && (
            <div className="space-y-2">
              <p className="text-overline text-overline-uppercase text-fg-tertiary">
                Escáneres guardados
              </p>
              {configs.map((config) => (
                <div
                  key={config.id}
                  className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 border border-border rounded-md bg-surface-sunken hover:bg-neutral-200 transition-colors"
                >
                  <PingDot status={pingStatus[config.id]} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-body-sm font-medium text-fg-primary truncate">{config.name}</p>
                      <SourceBadge source={config.discoveredVia} />
                    </div>
                    <p className="text-caption text-fg-tertiary font-mono">
                      {config.useTls ? 'https' : 'http'}://{config.ip}:{config.port}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onScanFromConfig(config)}
                      disabled={isScanning || pingStatus[config.id] === false}
                      className="h-8 px-2.5 flex items-center gap-1.5 bg-fg-primary text-fg-inverse text-button-sm rounded-md hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      {isScanning ? <SpinnerIcon /> : <ScanIcon size={12} />}
                      Escanear
                    </button>
                    {config.ownership === 'USER' && (
                      <button
                        onClick={() => onDeleteConfig(config.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md text-fg-tertiary hover:text-danger-fg hover:bg-danger-bg transition-colors"
                      >
                        <TrashIcon size={13} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add form toggle */}
          {!showAddForm ? (
            <button
              onClick={() => onShowAddForm(true)}
              className="w-full h-10 flex items-center justify-center gap-2 border border-dashed border-border rounded-md text-button-sm text-fg-tertiary hover:text-fg-primary hover:border-border-strong transition-colors"
            >
              + Agregar escáner
            </button>
          ) : (
            <div className="space-y-3 pt-1">
              {configs.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border" />
                  <p className="text-overline text-overline-uppercase text-fg-tertiary whitespace-nowrap">Nuevo escáner</p>
                  <div className="flex-1 h-px bg-border" />
                </div>
              )}

              <div>
                <label className="block text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
                  Nombre
                </label>
                <input
                  type="text"
                  value={saveName}
                  onChange={(e) => onSaveNameChange(e.target.value)}
                  placeholder="Ej: EPSON L4360"
                  className="w-full h-10 px-3 border border-border rounded-md bg-surface-card text-fg-primary text-body-sm placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
                />
              </div>

              <div>
                <label className="block text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
                  Dirección IP
                </label>
                <input
                  type="text"
                  value={wifiIp}
                  onChange={(e) => onIpChange(e.target.value)}
                  placeholder="192.168.1.100"
                  className="w-full h-10 px-3 border border-border rounded-md bg-surface-card text-fg-primary text-body-sm font-mono placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
                />
              </div>

              {/* Advanced options (TLS / port) */}
              <div className="border border-border rounded-md">
                <button
                  type="button"
                  onClick={() => setAdvancedOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-3 py-2.5 text-body-sm font-medium text-fg-secondary hover:bg-surface-sunken transition-colors"
                >
                  <span>Opciones avanzadas</span>
                  <ChevronDownIcon className={`transition-transform ${advancedOpen ? 'rotate-180' : ''}`} />
                </button>
                {advancedOpen && (
                  <div className="px-3 pb-3 pt-1 space-y-3 border-t border-border">
                    <Toggle
                      label="Usar HTTPS"
                      hint="Algunas impresoras (EPSON, Brother nuevas) sólo aceptan HTTPS."
                      checked={saveUseTls}
                      onChange={onSaveUseTlsChange}
                    />
                    <Toggle
                      label="Verificar certificado"
                      hint="Desactivá si el escáner usa certificado autofirmado."
                      checked={saveVerifyTls}
                      onChange={onSaveVerifyTlsChange}
                    />
                    <div>
                      <label className="block text-overline text-overline-uppercase text-fg-tertiary mb-1.5">
                        Puerto
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={65535}
                        value={savePort ?? ''}
                        onChange={(e) => {
                          const v = e.target.value;
                          onSavePortChange(v === '' ? null : parseInt(v, 10));
                        }}
                        placeholder={`${effectivePort} (default)`}
                        className="w-full h-10 px-3 border border-border rounded-md bg-surface-card text-fg-primary text-body-sm font-mono placeholder:text-fg-tertiary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--color-border-focus)]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {wifiStatus === 'error' && wifiError && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-md text-body-sm font-medium bg-danger-bg border border-danger-border text-danger-fg">
                  <span>✕</span>
                  <span>{wifiError}</span>
                </div>
              )}

              <div className="bg-surface-sunken border border-border rounded-md px-3 py-3 space-y-1.5">
                <p className="text-overline text-overline-uppercase text-fg-tertiary">Cómo encontrar la IP</p>
                <p className="text-body-sm text-fg-secondary">1. Imprime una hoja de configuración de red desde el escáner.</p>
                <p className="text-body-sm text-fg-secondary">2. O revisá el panel → Red → Dirección IP.</p>
                <p className="text-body-sm text-fg-secondary">3. Asegurate de estar en la misma red local.</p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={onSaveConfig}
                  disabled={saving || !wifiIp.trim() || !saveName.trim()}
                  className="flex-1 h-10 flex items-center justify-center gap-2 bg-fg-primary text-fg-inverse text-button rounded-md hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? <><SpinnerIcon />Guardando...</> : 'Guardar escáner'}
                </button>
                <button
                  onClick={onScan}
                  disabled={isScanning || !wifiIp.trim()}
                  className="h-10 px-4 flex items-center gap-1.5 border border-border text-fg-secondary bg-surface-card text-button rounded-md hover:bg-surface-sunken disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isScanning ? <SpinnerIcon /> : <ScanIcon size={13} />}
                  Probar
                </button>
                <button
                  onClick={() => onShowAddForm(false)}
                  className="h-10 px-4 text-button border border-border text-fg-secondary bg-surface-card rounded-md hover:bg-surface-sunken transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border flex justify-end">
          <button
            onClick={onClose}
            className="h-10 px-4 text-button border border-border text-fg-secondary bg-surface-card rounded-md hover:bg-surface-sunken transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
