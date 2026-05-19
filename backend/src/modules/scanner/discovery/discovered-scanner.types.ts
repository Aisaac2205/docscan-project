/**
 * Snapshot of a scanner observed on the network by a discovery adapter.
 * Transport-agnostic: mDNS today, SSDP/WS-Discovery later, all map to this shape.
 */
export interface DiscoveredScanner {
  /** Stable identity from TXT record (eSCL `UUID=`). The reconciliation anchor. */
  uuid: string;
  /** mDNS instance name (e.g. "EPSON L4360 Series._uscan._tcp.local"). */
  mdnsName: string;
  /** Human-readable model (TXT `ty=`). Falls back to mdnsName when absent. */
  modelName?: string;
  ip: string;
  port: number;
  useTls: boolean;
  /** TXT `rs=` — should equal "eSCL" for a valid eSCL endpoint. */
  rs?: string;
  /** When the announcement was observed (browser-side wallclock). */
  observedAt: Date;
}

/** Event names emitted on EventEmitter2 by discovery adapters. */
export const ScannerDiscoveryEvents = {
  Discovered: 'scanner.discovered',
  Lost: 'scanner.lost',
} as const;

export interface ScannerDiscoveredPayload {
  scanner: DiscoveredScanner;
}

export interface ScannerLostPayload {
  uuid: string;
  mdnsName: string;
}
