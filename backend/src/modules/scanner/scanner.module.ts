import { Module, Logger, type Provider } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ScannerController } from './scanner.controller';
import { ScannerService } from './scanner.service';
import { StorageModule } from '../storage/storage.module';
import { DocumentsModule } from '../documents/documents.module';
import { PrismaModule } from '../../config/prisma.module';
import { appConfig } from '../../config';
import { SCANNER_DISCOVERY_PORT } from './discovery/scanner-discovery.port';
import { NoopDiscoveryAdapter } from './discovery/noop-discovery.adapter';
import { BonjourDiscoveryAdapter } from './discovery/bonjour-discovery.adapter';
import { ScannerConfigSyncListener } from './discovery/scanner-config-sync.listener';

/**
 * Picks the active discovery adapter at bootstrap. Returns Noop unless
 * `SCANNER_DISCOVERY_ENABLED=true`. Keeps the rest of the module ignorant
 * of which backend is in play — the port contract is the only seam.
 */
const discoveryProvider: Provider = {
  provide: SCANNER_DISCOVERY_PORT,
  inject: [EventEmitter2],
  useFactory: (events: EventEmitter2) => {
    const logger = new Logger('ScannerDiscovery');
    if (appConfig.scanner.discoveryEnabled) {
      logger.log('Using BonjourDiscoveryAdapter (SCANNER_DISCOVERY_ENABLED=true)');
      return new BonjourDiscoveryAdapter(events);
    }
    logger.log('Using NoopDiscoveryAdapter (set SCANNER_DISCOVERY_ENABLED=true to enable mDNS)');
    return new NoopDiscoveryAdapter();
  },
};

@Module({
  imports: [PrismaModule, StorageModule, DocumentsModule],
  controllers: [ScannerController],
  providers: [ScannerService, discoveryProvider, ScannerConfigSyncListener],
  exports: [ScannerService, SCANNER_DISCOVERY_PORT],
})
export class ScannerModule {}
