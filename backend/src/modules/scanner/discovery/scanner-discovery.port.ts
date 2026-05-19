import type { DiscoveredScanner } from './discovered-scanner.types';

/**
 * Port for scanner network discovery. Adapters (mDNS, SSDP, noop) implement
 * this contract so the rest of the module never imports a concrete library.
 *
 * Adapters emit `scanner.discovered` / `scanner.lost` via EventEmitter2;
 * this port exposes only lifecycle + on-demand query.
 */
export interface ScannerDiscoveryPort {
  /** Start passive listening. Idempotent. Must not throw on missing privileges — log and degrade. */
  start(): Promise<void>;
  /** Stop listening and release sockets. Idempotent. */
  stop(): Promise<void>;
  /**
   * Force a re-query (mDNS: send a fresh PTR query, wait briefly, return snapshot).
   * Powers `POST /api/scanner/discover`. Should resolve in <= 5s.
   */
  refresh(): Promise<DiscoveredScanner[]>;
  /** Current in-memory snapshot of devices seen since `start()`. Never throws. */
  snapshot(): DiscoveredScanner[];
}

/** DI token. Use `@Inject(SCANNER_DISCOVERY_PORT)` to receive the active adapter. */
export const SCANNER_DISCOVERY_PORT = Symbol('SCANNER_DISCOVERY_PORT');
