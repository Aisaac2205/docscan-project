'use client';

import React from 'react';
import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { StatCard } from '@/features/dashboard/components/StatCard';
import { HardwareCard } from '@/features/dashboard/components/HardwareCard';
import { DocsIcon, OcrIcon, PendingIcon, ScannerDeviceIcon, CameraIcon, PrinterIcon } from '@/shared/ui/icons';

export function DashboardView() {
  const { firstName, stats, loading } = useDashboardStats();

  return (
    <div>
      <div className="mb-5 md:mb-7">
        <h1 className="text-lg md:text-xl font-semibold text-stone-900">Bienvenido, {firstName}</h1>
        <p className="text-sm text-stone-400 mt-0.5">Panel de control · DocScan</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 md:mb-7">
        <StatCard label="Total documentos" value={loading ? '—' : String(stats.total)} icon={<DocsIcon />} />
        <StatCard label="Con OCR" value={loading ? '—' : String(stats.completed)} icon={<OcrIcon />} highlight={stats.completed > 0} />
        <StatCard label="Pendientes" value={loading ? '—' : String(stats.pending)} icon={<PendingIcon />} />
      </div>

      <div className="mb-6">
        <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-3">
          Hardware disponible
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <HardwareCard
            icon={<ScannerDeviceIcon />}
            title="Escáner en red"
            subtitle="AirScan / eSCL"
            description="Conecta cualquier escáner multifunción en tu red local mediante el protocolo AirScan. Sin software adicional."
            status="available"
            statusLabel="Disponible"
          />
          <HardwareCard
            icon={<CameraIcon />}
            title="Cámara / Móvil"
            subtitle="WebRTC · getUserMedia"
            description="Usa la cámara del dispositivo sin instalar nada. Funciona en cualquier navegador moderno."
            status="available"
            statusLabel="Sin configuración"
          />
          <HardwareCard
            icon={<PrinterIcon />}
            title="Impresora"
            subtitle="Diálogo del sistema"
            description="Imprime documentos y resultados OCR desde cualquier página. Soporta impresoras USB, de red y PDF virtual."
            status="available"
            statusLabel="Sin configuración"
          />
        </div>
      </div>
    </div>
  );
}
