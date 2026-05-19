import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsStatsService } from './documents-stats.service';
import { DocumentsRepository } from './repositories/documents.repository';
import { StorageModule } from '../storage/storage.module';
import { PersonsModule } from '../persons/persons.module';

@Module({
  imports: [StorageModule, PersonsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsStatsService, DocumentsRepository],
  exports: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
