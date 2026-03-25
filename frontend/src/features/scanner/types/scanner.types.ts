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
export type BtStatus = 'idle' | 'connecting' | 'connected' | 'error';

export interface CaptureResult {
  documentId: string;
  url: string;
  originalName: string;
}
