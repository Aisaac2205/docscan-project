import { api } from '@/shared/api/client';

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
};
