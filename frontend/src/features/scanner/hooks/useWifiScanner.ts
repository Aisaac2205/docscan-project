import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { scannerClient } from '../client';
import { useScannerStore } from '../store';
import { toast } from '@/shared/ui/toast/store';
import type { WifiStatus, ScannerConfig } from '../types/scanner.types';

export function useWifiScanner(applyResult: (res: { documentId: string; url: string; originalName: string } | null) => boolean) {
  // applyResult is retained in the hook signature to preserve the caller API,
  // even though the wifi flow now hands the result off via the store + sub-route.
  void applyResult;
  const router = useRouter();
  const [wifiModal, setWifiModal] = useState(false);
  const [wifiIp, setWifiIp] = useState('');
  const [wifiStatus, setWifiStatus] = useState<WifiStatus>('idle');
  const [wifiError, setWifiError] = useState<string | null>(null);

  // Master switch from backend: when false, skip env-sync AND polling.
  const [featureEnabled, setFeatureEnabled] = useState<boolean | null>(null);

  // Saved configs
  const [configs, setConfigs] = useState<ScannerConfig[]>([]);
  const [pingStatus, setPingStatus] = useState<Record<string, boolean | null>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [savePort, setSavePort] = useState<number | null>(null);
  const [saveUseTls, setSaveUseTls] = useState(false);
  const [saveVerifyTls, setSaveVerifyTls] = useState(true);
  const [saving, setSaving] = useState(false);
  const [discovering, setDiscovering] = useState(false);

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

  // Resolve master switch once on mount.
  useEffect(() => {
    scannerClient
      .getFeatureState()
      .then(({ enabled }) => setFeatureEnabled(enabled))
      .catch(() => setFeatureEnabled(true));
  }, []);

  // Always-on: load configs on mount + poll their online state every 30s,
  // so the parent view can decide whether to surface the scanner option.
  // Skipped entirely when the feature is disabled via SCANNER_ENABLED=false.
  useEffect(() => {
    if (featureEnabled === false) return;
    loadConfigs();
  }, [featureEnabled, loadConfigs]);

  useEffect(() => {
    if (featureEnabled === false) return;
    if (configs.length === 0) return;
    pingAll(configs);
    const interval = window.setInterval(() => pingAll(configs), 30_000);
    return () => window.clearInterval(interval);
  }, [featureEnabled, configs, pingAll]);

  const hasOnlineConfig = useMemo(
    () => Object.values(pingStatus).some((v) => v === true),
    [pingStatus],
  );

  // Both scan handlers hand off control to /scan/network: they stash the request
  // in the store and navigate. The sub-route does the actual API call and shows
  // a full-screen animation while it runs.
  const handleScanFromConfig = (config: ScannerConfig) => {
    useScannerStore.getState().setPendingNetworkScan({
      kind: 'config',
      configId: config.id,
      label: config.name,
      ip: config.ip,
      port: config.port,
      useTls: config.useTls,
      verifyTls: config.verifyTls,
    });
    closeWifiModal();
    router.push('/scan/network');
  };

  const handleNetworkScan = () => {
    const ip = wifiIp.trim();
    if (!ip) { setWifiError('Ingresa la dirección IP del escáner'); return; }
    useScannerStore.getState().setPendingNetworkScan({
      kind: 'adhoc',
      label: ip,
      ip,
      port: effectivePort,
      useTls: saveUseTls,
      verifyTls: saveVerifyTls,
    });
    closeWifiModal();
    router.push('/scan/network');
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

  const handleDiscover = async () => {
    setDiscovering(true);
    try {
      const { discoveryActive } = await scannerClient.discover();
      await loadConfigs();
      if (discoveryActive) {
        toast.success('Búsqueda completada');
      } else {
        // Backend has SCANNER_DISCOVERY_ENABLED=false. Endpoint still returned
        // existing SYSTEM rows, but no real mDNS sweep happened. Tell the user.
        toast.error('El descubrimiento automático está desactivado en el servidor');
      }
    } catch {
      toast.error('No se pudieron buscar escáneres');
    } finally {
      setDiscovering(false);
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
    discovering,
    handleScanFromConfig,
    handleSaveConfig,
    handleDeleteConfig,
    handleDiscover,
  };
}
