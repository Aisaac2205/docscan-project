import { useState, useCallback, useEffect } from 'react';
import { scannerClient } from '@/lib/scanner-client';
import { ScannerDevice } from '@/types/document.types';

export function useScanner() {
  const [devices, setDevices] = useState<ScannerDevice[]>([]);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const fetchDevices = useCallback(async () => {
    try {
      const deviceList = await scannerClient.getDevices();
      setDevices(deviceList);
      if (deviceList.length > 0 && !selectedDevice) {
        setSelectedDevice(deviceList[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Error al obtener dispositivos');
    }
  }, [selectedDevice]);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const scan = useCallback(async (): Promise<string | null> => {
    if (!selectedDevice) {
      setError('No hay dispositivo seleccionado');
      return null;
    }

    setScanning(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('No se pudo crear el contexto del canvas');
      }

      canvas.width = 800;
      canvas.height = 600;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.font = '24px Arial';
      ctx.fillText('Escáner Demo', 50, 50);
      ctx.fillText('模拟扫描', 50, 100);
      ctx.fillText('TWAIN Scanner Integration', 50, 150);

      const imageData = canvas.toDataURL('image/png');
      return imageData;
    } catch (err: any) {
      setError(err.message || 'Error al escanear');
      return null;
    } finally {
      setScanning(false);
    }
  }, [selectedDevice]);

  const saveScan = useCallback(async (imageData: string) => {
    try {
      const result = await scannerClient.saveScannedImage(imageData);
      return result;
    } catch (err: any) {
      setError(err.message || 'Error al guardar escaneo');
      return null;
    }
  }, []);

  return {
    devices,
    scanning,
    error,
    selectedDevice,
    setSelectedDevice,
    scan,
    saveScan,
    refreshDevices: fetchDevices,
  };
}
