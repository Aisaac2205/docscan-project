import { useState, useEffect, useCallback, useMemo } from 'react';
import { scannerClient } from '../client';
import { useScannerStore } from '../store';
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
  const [savePort, setSavePort] = useState<number | null>(null);
  const [saveUseTls, setSaveUseTls] = useState(false);
  const [saveVerifyTls, setSaveVerifyTls] = useState(true);
  const [saving, setSaving] = useState(false);

  // Smart default for port: 443 if TLS, 80 otherwise. User can override.
  const effectivePort = savePort ?? (saveUseTls ? 443 : 80);

  const loadConfigs = useCallback(async () => {
    try {
      const data = await scannerClient.getConfigs();
      setConfigs(data);
    } catch {
      // silently ignore — user may not have any yet
    }
  }, []);

  const resetAddForm = useCallback(() => {
    setShowAddForm(false);
    setSaveName('');
    setWifiIp('');
    setSavePort(null);
    setSaveUseTls(false);
    setSaveVerifyTls(true);
  }, []);

  const openWifiModal = () => {
    setWifiStatus('idle');
    setWifiError(null);
    resetAddForm();
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

  // Always-on: load configs on mount + poll their online state every 30s,
  // so the parent view can decide whether to surface the scanner option.
  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  useEffect(() => {
    if (configs.length === 0) return;
    pingAll(configs);
    const interval = window.setInterval(() => pingAll(configs), 30_000);
    return () => window.clearInterval(interval);
  }, [configs, pingAll]);

  const hasOnlineConfig = useMemo(
    () => Object.values(pingStatus).some((v) => v === true),
    [pingStatus],
  );

  const handleScanFromConfig = async (config: ScannerConfig) => {
    const personId = useScannerStore.getState().targetPersonId ?? undefined;
    setWifiStatus('scanning');
    setWifiError(null);
    try {
      const res = await scannerClient.captureFromNetwork({
        ipAddress: config.ip,
        port: config.port,
        useTls: config.useTls,
        verifyTls: config.verifyTls,
        personId,
      });
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
    const personId = useScannerStore.getState().targetPersonId ?? undefined;
    setWifiStatus('scanning');
    setWifiError(null);
    try {
      const res = await scannerClient.captureFromNetwork({
        ipAddress: ip,
        port: effectivePort,
        useTls: saveUseTls,
        verifyTls: saveVerifyTls,
        personId,
      });
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
      const created = await scannerClient.createConfig({
        name,
        ip,
        port: effectivePort,
        useTls: saveUseTls,
        verifyTls: saveVerifyTls,
      });
      setConfigs((prev) => [...prev, created]);
      resetAddForm();
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
      setPingStatus((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
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
    hasOnlineConfig,
    showAddForm,
    setShowAddForm,
    saveName,
    setSaveName,
    savePort,
    setSavePort,
    effectivePort,
    saveUseTls,
    setSaveUseTls,
    saveVerifyTls,
    setSaveVerifyTls,
    saving,
    handleScanFromConfig,
    handleSaveConfig,
    handleDeleteConfig,
  };
}
