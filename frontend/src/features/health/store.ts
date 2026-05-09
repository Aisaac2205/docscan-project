import { create } from 'zustand';
import { healthApi } from './api/healthApi';
import type { HealthRecord, HealthStatus, UpdateStatusPayload } from './types';

interface HealthStore {
  records: HealthRecord[];
  loading: boolean;
  error: string | null;
  fetchRecords: () => Promise<void>;
  updateStatus: (id: string, payload: UpdateStatusPayload) => Promise<void>;
}

export const useHealthStore = create<HealthStore>((set, get) => ({
  records: [],
  loading: false,
  error: null,

  async fetchRecords() {
    set({ loading: true, error: null });
    try {
      const records = await healthApi.getAll();
      set({ records, loading: false });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : 'Error al cargar registros',
        loading: false,
      });
    }
  },

  async updateStatus(id, payload) {
    try {
      const updated = await healthApi.updateStatus(id, payload);
      set((state) => ({
        records: state.records.map((r) => (r.id === id ? updated : r)),
      }));
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Error al actualizar estado' });
    }
  },
}));
