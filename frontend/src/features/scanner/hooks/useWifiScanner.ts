import { useState, useEffect, useCallback } from 'react';
import { scannerClient } from '../client';
import { toast } from '@/shared/ui/toast/store';
import type { WifiStatus, ScannerConfig } from '../types/scanner.types';

export function useWifiScanner(applyResult: (res: { documentId: string; url: string; originalName: string } | null) => boolean) {
  const [wifiModal, setWifiModal] = useState(false);
  const [wifiIp, setWifiIp] = useState('');
  const [wifiStatus, setWifiStatus] = useState<WifiStatus>('idle');
  const [wifiError, setWifiError] = useState<string | null>(null);

  // Saved configs
  const [configs, setConfigs] = useState<ScannerConfig[]>([]);
  const [pingStatus, setPingStatus] = useState<Record<string, boolean | null>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [saving, setSaving] = useState(false);

  const loadConfigs = useCallback(async () => {
    try {
      const data = await scannerClient.getConfigs();
      setConfigs(data);
    } catch {
      // silently ignore — user may not have any yet
    }
  }, []);

  const openWifiModal = () => {
    setWifiStatus('idle');
    setWifiError(null);
    setShowAddForm(false);
    setSaveName('');
    setWifiIp('');
    setWifiModal(true);
    loadConfigs();
  };

  const closeWifiModal = () => {
    setWifiModal(false);
    setWifiStatus('idle');
    setWifiError(null);
    setShowAddForm(false);
  };

  const pingAll = useCallback(async (cfgs: ScannerConfig[]) => {
    const results: Record<string, boolean | null> = {};
    cfgs.forEach((c) => { results[c.id] = null; });
    setPingStatus(results);

    await Promise.allSettled(
      cfgs.map(async (c) => {
        const { online } = await scannerClient.pingConfig(c.id).catch(() => ({ online: false }));
        setPingStatus((prev) => ({ ...prev, [c.id]: online }));
      }),
    );
  }, []);

  useEffect(() => {
    if (wifiModal && configs.length > 0) {
      pingAll(configs);
    }
  }, [wifiModal, configs, pingAll]);

  const handleScanFromConfig = async (config: ScannerConfig) => {
    setWifiStatus('scanning');
    setWifiError(null);
    try {
      const res = await scannerClient.captureFromNetwork(config.ip, config.port);
      if (applyResult(res)) {
        toast.success(`Documento escaneado desde ${config.name}`);
        closeWifiModal();
      }
    } catch (err: unknown) {
      setWifiStatus('error');
      setWifiError(err instanceof Error ? err.message : 'No se pudo conectar al escáner');
    }
  };

  const handleNetworkScan = async () => {
    const ip = wifiIp.trim();
    if (!ip) { setWifiError('Ingresa la dirección IP del escáner'); return; }
    setWifiStatus('scanning');
    setWifiError(null);
    try {
      const res = await scannerClient.captureFromNetwork(ip);
      if (applyResult(res)) {
        toast.success('Documento escaneado desde la red');
        closeWifiModal();
      }
    } catch (err: unknown) {
      setWifiStatus('error');
      setWifiError(err instanceof Error ? err.message : 'No se pudo conectar al escáner');
    }
  };

  const handleSaveConfig = async () => {
    const ip = wifiIp.trim();
    const name = saveName.trim();
    if (!name) { setWifiError('Ingresa un nombre para el escáner'); return; }
    if (!ip) { setWifiError('Ingresa la dirección IP'); return; }
    setSaving(true);
    try {
      const created = await scannerClient.createConfig({ name, ip, port: 80 });
      setConfigs((prev) => [...prev, created]);
      setShowAddForm(false);
      setSaveName('');
      setWifiIp('');
      toast.success('Escáner guardado');
    } catch {
      toast.error('No se pudo guardar el escáner');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    try {
      await scannerClient.deleteConfig(id);
      setConfigs((prev) => prev.filter((c) => c.id !== id));
      toast.success('Escáner eliminado');
    } catch {
      toast.error('No se pudo eliminar el escáner');
    }
  };

  return {
    wifiModal,
    wifiIp,
    setWifiIp,
    wifiStatus,
    wifiError,
    openWifiModal,
    closeWifiModal,
    handleNetworkScan,
    // configs
    configs,
    pingStatus,
    showAddForm,
    setShowAddForm,
    saveName,
    setSaveName,
    saving,
    handleScanFromConfig,
    handleSaveConfig,
    handleDeleteConfig,
  };
}
