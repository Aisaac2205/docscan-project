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
      const existing = await this.prisma.scannerConfig.findUnique({
        where: { uuid: scanner.uuid },
      });

      if (existing) {
        // Update only volatile fields. Do NOT overwrite `name` (user may have
        // renamed it) or TLS settings (they came from a manual decision).
        await this.prisma.scannerConfig.update({
          where: { id: existing.id },
          data: {
            ip: scanner.ip,
            port: scanner.port,
            mdnsName: scanner.mdnsName,
            online: true,
            lastSeenAt: scanner.observedAt,
          },
        });
        this.logger.debug(
          `Refreshed discovered scanner ${existing.id}: ${scanner.ip}:${scanner.port}`,
        );
        return;
      }

      const created = await this.prisma.scannerConfig.create({
        data: {
          userId: null,
          ownership: Ownership.SYSTEM,
          discoveredVia: DiscoverySource.MDNS,
          uuid: scanner.uuid,
          name: scanner.modelName ?? scanner.mdnsName,
          mdnsName: scanner.mdnsName,
          ip: scanner.ip,
          port: scanner.port,
          useTls: scanner.useTls,
          verifyTls: true,
          online: true,
          lastSeenAt: scanner.observedAt,
        },
      });
      this.logger.log(
        `Registered discovered scanner: id=${created.id} uuid=${scanner.uuid} ${scanner.ip}:${scanner.port}`,
      );
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
