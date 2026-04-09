import { create } from 'zustand';
import { scannerClient } from './client';

type ScannerState = {
  scanning: boolean;
  error: string | null;
  cameraError: string | null;
  setScanning: (v: boolean) => void;
  setError: (e: string | null) => void;
  captureFromCamera: (base64: string) => Promise<{ documentId: string; url: string; originalName: string } | null>;
};

export const useScannerStore = create<ScannerState>((set) => ({
  scanning: false,
  error: null,
  cameraError: null,
  setScanning: (v) => set({ scanning: v }),
  setError: (e) => set({ error: e }),
  captureFromCamera: async (base64) => {
    set({ scanning: true, cameraError: null });
    try {
      const res = await scannerClient.captureFromCamera(base64);
      set({ scanning: false });
      return res;
    } catch (err: unknown) {
      set({ cameraError: err instanceof Error ? err.message : 'Error al capturar imagen', scanning: false });
      return null;
    }
  },
}));
