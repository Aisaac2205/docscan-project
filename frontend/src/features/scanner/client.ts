import { api } from '@/shared/api/client';
import type { ScannerConfig } from './types/scanner.types';

export const scannerClient = {
  async captureFromCamera(
    base64: string,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const res = await api.post('/api/scanner/capture', { imageData: base64 });
    return res.data;
  },

  async captureFromNetwork(
    ipAddress: string,
    port = 80,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const res = await api.post('/api/scanner/network-scan', { ipAddress, port });
    return res.data;
  },

  async getConfigs(): Promise<ScannerConfig[]> {
    const res = await api.get('/api/scanner/configs');
    return res.data;
  },

  async createConfig(data: { name: string; ip: string; port: number }): Promise<ScannerConfig> {
    const res = await api.post('/api/scanner/configs', data);
    return res.data;
  },

  async deleteConfig(id: string): Promise<void> {
    await api.delete(`/api/scanner/configs/${id}`);
  },

  async pingConfig(id: string): Promise<{ online: boolean }> {
    const res = await api.get(`/api/scanner/configs/${id}/ping`);
    return res.data;
  },
};
