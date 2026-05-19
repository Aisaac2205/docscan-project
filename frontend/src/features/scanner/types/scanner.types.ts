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

export type Ownership = 'USER' | 'SYSTEM';
export type DiscoverySource = 'MANUAL' | 'ENV' | 'MDNS';

export interface ScannerConfig {
  id: string;
  name: string;
  ip: string;
  port: number;
  useTls: boolean;
  verifyTls: boolean;
  ownership: Ownership;
  discoveredVia: DiscoverySource;
  online: boolean;
  uuid: string | null;
  mdnsName: string | null;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface DiscoverResponse {
  scanners: ScannerConfig[];
  discoveryActive: boolean;
}

export interface CaptureResult {
  documentId: string;
  url: string;
  originalName: string;
}
