import { useState } from 'react';
import { toast } from '@/shared/ui/toast/store';
import type { BtStatus } from '../types/scanner.types';

interface BluetoothDeviceInfo {
  name?: string;
}

interface BluetoothAPI {
  requestDevice(options: { acceptAllDevices: boolean }): Promise<BluetoothDeviceInfo>;
}

interface NavigatorWithBluetooth extends Navigator {
  bluetooth?: BluetoothAPI;
}

export function useBluetoothPrinter(onPrint: () => void, hasResult: boolean) {
  const [btModal, setBtModal] = useState(false);
  const [btStatus, setBtStatus] = useState<BtStatus>('idle');
  const [btDeviceName, setBtDeviceName] = useState<string | null>(null);
  const [btError, setBtError] = useState<string | null>(null);

  const openBtModal = () => setBtModal(true);
  const closeBtModal = () => { setBtModal(false); setBtError(null); };

  const handleBtConnect = async () => {
    const nav = navigator as NavigatorWithBluetooth;
    if (!nav.bluetooth) {
      setBtError('Tu navegador no soporta Web Bluetooth. Usa Chrome o Edge.');
      setBtStatus('error');
      return;
    }
    setBtStatus('connecting');
    setBtError(null);
    try {
      const device = await nav.bluetooth.requestDevice({ acceptAllDevices: true });
      const name = device.name || 'Dispositivo Bluetooth';
      setBtDeviceName(name);
      setBtStatus('connected');
      toast.success(`Emparejado con ${name}`);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'NotFoundError') {
        setBtStatus('idle');
      } else {
        setBtStatus('error');
        setBtError(err instanceof Error ? err.message : 'Error al conectar');
      }
    }
  };

  const handleBtPrint = () => {
    if (hasResult) onPrint();
    else toast.info('Captura un documento primero para imprimir');
  };

  const disconnectBt = () => { setBtStatus('idle'); setBtDeviceName(null); };

  return {
    btModal,
    btStatus,
    btDeviceName,
    btError,
    openBtModal,
    closeBtModal,
    handleBtConnect,
    handleBtPrint,
    disconnectBt,
  };
}
