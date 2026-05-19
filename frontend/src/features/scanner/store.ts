import { create } from 'zustand';
import { scannerClient } from './client';
import type { CaptureResult } from './types/scanner.types';

// Request handoff between ScannerView (modal) and /scan/network (animated sub-route).
// `label` is shown in the animation header (e.g. the config name or the IP).
export type NetworkScanRequest =
  | { kind: 'config'; configId: string; label: string; ip: string; port: number; useTls: boolean; verifyTls: boolean }
  | { kind: 'adhoc'; label: string; ip: string; port: number; useTls: boolean; verifyTls: boolean };

type ScannerState = {
  scanning: boolean;
  error: string | null;
  cameraError: string | null;
  // Persona pre-asignada para los próximos uploads/capturas en esta vista.
  // null = el documento queda en la bandeja de entrada hasta que RRHH lo asocie.
  targetPersonId: string | null;
  targetPersonName: string | null;
  // Cross-route handoff for the wifi scanner animation flow.
  pendingNetworkScan: NetworkScanRequest | null;
  pendingNetworkResult: CaptureResult | null;
  setScanning: (v: boolean) => void;
  setError: (e: string | null) => void;
  setTargetPerson: (id: string | null, name: string | null) => void;
  setPendingNetworkScan: (req: NetworkScanRequest | null) => void;
  consumePendingNetworkResult: () => CaptureResult | null;
  setPendingNetworkResult: (res: CaptureResult | null) => void;
  captureFromCamera: (base64: string) => Promise<{ documentId: string; url: string; originalName: string } | null>;
};

export const useScannerStore = create<ScannerState>((set, get) => ({
  scanning: false,
  error: null,
  cameraError: null,
  targetPersonId: null,
  targetPersonName: null,
  pendingNetworkScan: null,
  pendingNetworkResult: null,
  setScanning: (v) => set({ scanning: v }),
  setError: (e) => set({ error: e }),
  setTargetPerson: (id, name) => set({ targetPersonId: id, targetPersonName: name }),
  setPendingNetworkScan: (req) => set({ pendingNetworkScan: req }),
  setPendingNetworkResult: (res) => set({ pendingNetworkResult: res }),
  consumePendingNetworkResult: () => {
    const res = get().pendingNetworkResult;
    if (res) set({ pendingNetworkResult: null });
    return res;
  },
  captureFromCamera: async (base64) => {
    set({ scanning: true, cameraError: null });
    try {
      const personId = get().targetPersonId ?? undefined;
      const res = await scannerClient.captureFromCamera(base64, personId);
      set({ scanning: false });
      return res;
    } catch (err: unknown) {
      set({ cameraError: err instanceof Error ? err.message : 'Error al capturar imagen', scanning: false });
      return null;
    }
  },
}));
