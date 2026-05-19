import { Injectable, Logger } from '@nestjs/common';
import type { ScannerDiscoveryPort } from './scanner-discovery.port';
import type { DiscoveredScanner } from './discovered-scanner.types';

/**
 * Default adapter. Does nothing. Keeps the system functional and backward-compatible
 * when no real discovery backend is wired (or when `bonjour-service` is removed).
 *
 * Swapped for `BonjourDiscoveryAdapter` in Phase 2 via the module's provider factory.
 */
@Injectable()
export class NoopDiscoveryAdapter implements ScannerDiscoveryPort {
  private readonly logger = new Logger(NoopDiscoveryAdapter.name);

  async start(): Promise<void> {
    this.logger.debug('Scanner discovery disabled (noop adapter active)');
  }

  async stop(): Promise<void> {
    /* no-op */
  }

  async refresh(): Promise<DiscoveredScanner[]> {
    return [];
  }

  snapshot(): DiscoveredScanner[] {
    return [];
  }
}
