import { apiClient } from './api-client';
import { ScannerDevice } from '../types/document.types';

class ScannerClient {
  async getDevices(): Promise<ScannerDevice[]> {
    return apiClient.get<ScannerDevice[]>('/scanner/devices');
  }

  async saveScannedImage(imageData: string): Promise<{ filePath: string; originalName: string }> {
    return apiClient.post<{ filePath: string; originalName: string }>('/scanner/save', { imageData });
  }
}

export const scannerClient = new ScannerClient();
