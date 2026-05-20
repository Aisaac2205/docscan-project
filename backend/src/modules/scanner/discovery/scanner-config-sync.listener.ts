import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DiscoverySource, Ownership } from '@prisma/client';
import { PrismaService } from '../../../config/database.config';
import {
  ScannerDiscoveryEvents,
  type ScannerDiscoveredPayload,
  type ScannerLostPayload,
} from './discovered-scanner.types';

/**
 * Bridges discovery events to the database. Lives in the scanner module but
 * does NOT touch ScannerService — keeps the discovery pipeline isolated so
 * the adapter can be swapped or removed without touching scan logic.
 *
 * Matching anchor: TXT `UUID`. IP is never used for identity (it changes).
 * Devices that previously had the same UUID but a different IP are updated
 * in place. New UUIDs create SYSTEM-owned rows with `discoveredVia=MDNS`.
 *
 * Soft-offline policy: on `scanner.lost` we flip `online=false` and stop.
 * No auto-delete — purge will be a separate admin endpoint (deferred until
 * an admin role exists on the User model).
 */
@Injectable()
export class ScannerConfigSyncListener {
  private readonly logger = new Logger(ScannerConfigSyncListener.name);

  constructor(private readonly prisma: PrismaService) {}

  @OnEvent(ScannerDiscoveryEvents.Discovered)
  async onDiscovered(payload: ScannerDiscoveredPayload): Promise<void> {
    const { scanner } = payload;
    try {
      // findUnique is for log differentiation only — the upsert below is the
      // race-safe write. Two near-simultaneous announcements (e.g. _uscan._tcp
      // and _uscans._tcp arriving back-to-back) used to crash on the unique
      // constraint when both handlers did findUnique→null→create.
      const existedBefore = await this.prisma.scannerConfig.findUnique({
        where: { uuid: scanner.uuid },
        select: { id: true },
      });

      // The adapter is authoritative for the transport tuple (ip, port,
      // useTls). They move together as a coherent unit — DHCP renews flip
      // ip; a firmware switching from `_uscan` to `_uscans` flips port AND
      // useTls. Refreshing only part of the tuple yields an inconsistent
      // row (e.g. useTls=false + port=443) where ping fails forever.
      //
      // verifyTls is forced to false on both create AND update for mDNS
      // rows: discovery is LAN-only by definition, and consumer printers
      // virtually always ship with self-signed certs. Validating those
      // breaks ping/scan out-of-the-box for no real security gain (the
      // trust boundary is the LAN, not the cert chain). Users who need
      // strict validation can create a MANUAL config instead.
      //
      // Name stays user-controlled (no UI to edit it yet, but we plan to).
      const synced = await this.prisma.scannerConfig.upsert({
        where: { uuid: scanner.uuid },
        update: {
          ip: scanner.ip,
          port: scanner.port,
          useTls: scanner.useTls,
          verifyTls: false,
          mdnsName: scanner.mdnsName,
          online: true,
          lastSeenAt: scanner.observedAt,
        },
        create: {
          userId: null,
          ownership: Ownership.SYSTEM,
          discoveredVia: DiscoverySource.MDNS,
          uuid: scanner.uuid,
          name: scanner.modelName ?? scanner.mdnsName,
          mdnsName: scanner.mdnsName,
          ip: scanner.ip,
          port: scanner.port,
          useTls: scanner.useTls,
          verifyTls: false,
          online: true,
          lastSeenAt: scanner.observedAt,
        },
      });

      if (existedBefore) {
        this.logger.debug(
          `Refreshed discovered scanner ${synced.id}: ${scanner.useTls ? 'https' : 'http'}://${scanner.ip}:${scanner.port}`,
        );
      } else {
        this.logger.log(
          `Registered discovered scanner: id=${synced.id} uuid=${scanner.uuid} ${scanner.ip}:${scanner.port}`,
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to persist discovered scanner ${scanner.uuid}: ${msg}`);
    }
  }

  @OnEvent(ScannerDiscoveryEvents.Lost)
  async onLost(payload: ScannerLostPayload): Promise<void> {
    try {
      const config = await this.prisma.scannerConfig.findUnique({
        where: { uuid: payload.uuid },
      });
      if (!config) return;
      await this.prisma.scannerConfig.update({
        where: { id: config.id },
        data: { online: false },
      });
      this.logger.debug(`Marked offline (soft): id=${config.id} uuid=${payload.uuid}`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to mark offline ${payload.uuid}: ${msg}`);
    }
  }
}
