import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Bonjour, type Browser, type Service, type ServiceConfig } from 'bonjour-service';

/**
 * `bonjour-service` forwards its constructor options straight to `multicast-dns`,
 * which DOES honour `interface` (see node_modules/multicast-dns/index.js). The
 * public typings only expose `Partial<ServiceConfig>` and omit it. We model the
 * real surface here instead of using `// @ts-ignore`.
 */
type BonjourOpts = Partial<ServiceConfig> & { interface?: string };
import { appConfig } from '../../../config';
import type { ScannerDiscoveryPort } from './scanner-discovery.port';
import {
  type DiscoveredScanner,
  ScannerDiscoveryEvents,
  type ScannerDiscoveredPayload,
  type ScannerLostPayload,
} from './discovered-scanner.types';

/**
 * Browses `_uscan._tcp` on the local network and emits discovery events.
 *
 * - HTTP-only (`_uscan._tcp`). HTTPS variant `_uscans._tcp` is not browsed in v1;
 *   add a second browser later if a deployment needs it.
 * - Crashes inside the mDNS stack (firewall denial, socket already bound by
 *   Apple Bonjour Service, no usable interface) are caught and logged. The
 *   backend keeps running with an empty snapshot — same UX as Noop.
 * - Emits via EventEmitter2 only. Never writes to the database directly.
 *   Reconciliation lives in a separate listener (Phase 3).
 */
@Injectable()
export class BonjourDiscoveryAdapter
  implements ScannerDiscoveryPort, OnApplicationBootstrap, OnModuleDestroy
{
  private readonly logger = new Logger(BonjourDiscoveryAdapter.name);
  private bonjour: Bonjour | null = null;
  private browser: Browser | null = null;
  private started = false;
  /** Keyed by UUID (preferred) or fqdn fallback when UUID missing. */
  private readonly devices = new Map<string, DiscoveredScanner>();

  constructor(private readonly events: EventEmitter2) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.start();
  }

  async onModuleDestroy(): Promise<void> {
    await this.stop();
  }

  async start(): Promise<void> {
    if (this.started) return;
    try {
      const iface = appConfig.scanner.mdnsInterface || undefined;
      const opts: BonjourOpts | undefined = iface ? { interface: iface } : undefined;
      this.bonjour = new Bonjour(opts, (err: Error) => {
        this.logger.warn(`mDNS socket error: ${err.message}`);
      });
      this.browser = this.bonjour.find({ type: 'uscan', protocol: 'tcp' });
      this.browser.on('up', (svc) => this.onServiceUp(svc));
      this.browser.on('down', (svc) => this.onServiceDown(svc));
      this.started = true;
      this.logger.log(
        `Scanner discovery listening on _uscan._tcp${iface ? ` (interface ${iface})` : ''}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Could not start mDNS discovery, running degraded: ${msg}`);
      await this.cleanup();
    }
  }

  async stop(): Promise<void> {
    if (!this.started) return;
    await this.cleanup();
    this.logger.log('Scanner discovery stopped');
  }

  async refresh(): Promise<DiscoveredScanner[]> {
    if (!this.started || !this.browser) return this.snapshot();
    this.browser.update();
    await new Promise<void>((resolve) => setTimeout(resolve, 1500));
    return this.snapshot();
  }

  snapshot(): DiscoveredScanner[] {
    return Array.from(this.devices.values());
  }

  private onServiceUp(svc: Service): void {
    const scanner = this.toDiscovered(svc);
    if (!scanner) return;
    const key = scanner.uuid;
    this.devices.set(key, scanner);
    this.logger.log(
      `Discovered scanner: ${scanner.modelName ?? scanner.mdnsName} @ ${scanner.ip}:${scanner.port} uuid=${scanner.uuid}`,
    );
    const payload: ScannerDiscoveredPayload = { scanner };
    this.events.emit(ScannerDiscoveryEvents.Discovered, payload);
  }

  private onServiceDown(svc: Service): void {
    const uuid = this.txtValue(svc, 'uuid') || svc.fqdn || svc.name;
    if (!uuid) return;
    const known = this.devices.get(uuid);
    this.devices.delete(uuid);
    const payload: ScannerLostPayload = {
      uuid,
      mdnsName: known?.mdnsName ?? svc.name,
    };
    this.logger.log(`Lost scanner: ${payload.mdnsName} uuid=${uuid}`);
    this.events.emit(ScannerDiscoveryEvents.Lost, payload);
  }

  /**
   * Maps a raw mDNS service to our domain shape.
   * Drops announcements that do not look like a valid eSCL device.
   */
  private toDiscovered(svc: Service): DiscoveredScanner | null {
    const ip = this.pickIPv4(svc.addresses);
    if (!ip) return null;
    const uuid = this.txtValue(svc, 'uuid');
    if (!uuid) {
      this.logger.debug(`Ignoring mDNS announcement without UUID: ${svc.name}`);
      return null;
    }
    const rs = this.txtValue(svc, 'rs');
    if (rs && rs.toLowerCase() !== 'escl') {
      this.logger.debug(`Ignoring non-eSCL announcement (rs=${rs}): ${svc.name}`);
      return null;
    }
    return {
      uuid,
      mdnsName: svc.name,
      modelName: this.txtValue(svc, 'ty'),
      ip,
      port: svc.port,
      useTls: false,
      rs,
      observedAt: new Date(),
    };
  }

  /**
   * TXT records arrive as Record<string, string|Buffer|true>. Keys MAY be
   * mixed-case across firmwares (Mopria says lowercase but reality is messy),
   * so we normalize both sides.
   */
  private txtValue(svc: Service, key: string): string | undefined {
    const txt = svc.txt as Record<string, unknown> | undefined;
    if (!txt) return undefined;
    const want = key.toLowerCase();
    for (const [k, v] of Object.entries(txt)) {
      if (k.toLowerCase() !== want) continue;
      if (typeof v === 'string') return v;
      if (Buffer.isBuffer(v)) return v.toString('utf8');
    }
    return undefined;
  }

  private pickIPv4(addresses: string[] | undefined): string | null {
    if (!addresses) return null;
    return addresses.find((a) => /^\d{1,3}(\.\d{1,3}){3}$/.test(a)) ?? null;
  }

  private async cleanup(): Promise<void> {
    try {
      this.browser?.stop();
    } catch {
      /* ignore */
    }
    try {
      this.bonjour?.destroy();
    } catch {
      /* ignore */
    }
    this.browser = null;
    this.bonjour = null;
    this.started = false;
    this.devices.clear();
  }
}
