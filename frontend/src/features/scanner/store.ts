import { create } from 'zustand';
import { scannerClient } from './client';

type ScannerState = {
  scanning: boolean;
  error: string | null;
  cameraError: string | null;
  // Persona pre-asignada para los próximos uploads/capturas en esta vista.
  // null = el documento queda en la bandeja de entrada hasta que RRHH lo asocie.
  targetPersonId: string | null;
  targetPersonName: string | null;
  setScanning: (v: boolean) => void;
  setError: (e: string | null) => void;
  setTargetPerson: (id: string | null, name: string | null) => void;
  captureFromCamera: (base64: string) => Promise<{ documentId: string; url: string; originalName: string } | null>;
};

export const useScannerStore = create<ScannerState>((set, get) => ({
  scanning: false,
  error: null,
  cameraError: null,
  targetPersonId: null,
  targetPersonName: null,
  setScanning: (v) => set({ scanning: v }),
  setError: (e) => set({ error: e }),
  setTargetPerson: (id, name) => set({ targetPersonId: id, targetPersonName: name }),
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
