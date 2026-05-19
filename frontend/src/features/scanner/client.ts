import { api } from '@/shared/api/client';
import type { ScannerConfig, DiscoverResponse } from './types/scanner.types';

export interface NetworkScanOptions {
  ipAddress: string;
  port?: number;
  useTls?: boolean;
  verifyTls?: boolean;
  personId?: string;
}

export interface CreateScannerConfigInput {
  name: string;
  ip: string;
  port?: number;
  useTls?: boolean;
  verifyTls?: boolean;
}

export const scannerClient = {
  async captureFromCamera(
    base64: string,
    personId?: string,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const res = await api.post('/api/scanner/capture', { imageData: base64, personId });
    return res.data;
  },

  async captureFromNetwork(
    opts: NetworkScanOptions,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const res = await api.post('/api/scanner/network-scan', opts);
    return res.data;
  },

  async getConfigs(): Promise<ScannerConfig[]> {
    const res = await api.get('/api/scanner/configs');
    return res.data;
  },

  async createConfig(data: CreateScannerConfigInput): Promise<ScannerConfig> {
    const res = await api.post('/api/scanner/configs', data);
    return res.data;
  },

  async deleteConfig(id: string): Promise<void> {
    await api.delete(`/api/scanner/configs/${id}`);
  },

  async discover(): Promise<DiscoverResponse> {
    const res = await api.post('/api/scanner/discover');
    return res.data;
  },

  async pingConfig(id: string): Promise<{ online: boolean }> {
    const res = await api.get(`/api/scanner/configs/${id}/ping`);
    return res.data;
  },

  async getFeatureState(): Promise<{ enabled: boolean }> {
    const res = await api.get('/api/scanner/feature-state');
    return res.data;
  },
};
