import { useState } from 'react';
import { scannerClient } from '../client';
import { toast } from '@/shared/ui/toast/store';
import type { WifiStatus, CaptureResult } from '../types/scanner.types';

export function useWifiScanner(applyResult: (res: CaptureResult | null) => boolean) {
  const [wifiModal, setWifiModal] = useState(false);
  const [wifiIp, setWifiIp] = useState('');
  const [wifiPort, setWifiPort] = useState('80');
  const [wifiStatus, setWifiStatus] = useState<WifiStatus>('idle');
  const [wifiError, setWifiError] = useState<string | null>(null);

  const openWifiModal = () => {
    setWifiStatus('idle');
    setWifiError(null);
    setWifiModal(true);
  };

  const closeWifiModal = () => {
    setWifiModal(false);
    setWifiStatus('idle');
    setWifiError(null);
  };

  const handleNetworkScan = async () => {
    const ip = wifiIp.trim();
    if (!ip) { setWifiError('Ingresa la dirección IP del escáner'); return; }
    setWifiStatus('scanning');
    setWifiError(null);
    try {
      const res = await scannerClient.captureFromNetwork(ip, parseInt(wifiPort) || 80);
      if (applyResult(res)) {
        toast.success('Documento escaneado desde la red');
        closeWifiModal();
      }
    } catch (err: unknown) {
      setWifiStatus('error');
      setWifiError(err instanceof Error ? err.message : 'No se pudo conectar al escáner');
    }
  };

  return {
    wifiModal,
    wifiIp,
    setWifiIp,
    wifiPort,
    setWifiPort,
    wifiStatus,
    wifiError,
    openWifiModal,
    closeWifiModal,
    handleNetworkScan,
  };
}
