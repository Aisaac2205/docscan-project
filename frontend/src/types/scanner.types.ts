export interface ScanResult {
  imageData: string;
  deviceId: string;
}

export interface ScannerState {
  devices: import('./document.types').ScannerDevice[];
  scanning: boolean;
  error: string | null;
  selectedDevice: string | null;
}
