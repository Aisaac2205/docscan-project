export interface ScannerDevice {
  id: string;
  name: string;
  manufacturer: string;
}

export interface ScanResult {
  imageData: string;
  deviceId: string;
}

export type WifiStatus = 'idle' | 'connecting' | 'scanning' | 'error';

export interface ScannerConfig {
  id: string;
  name: string;
  ip: string;
  port: number;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface CaptureResult {
  documentId: string;
  url: string;
  originalName: string;
}
