import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentsRepository } from './repositories/documents.repository';
import { StorageModule } from '../storage/storage.module';
import { PersonsModule } from '../persons/persons.module';

@Module({
  imports: [StorageModule, PersonsModule],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsRepository],
  exports: [DocumentsService, DocumentsRepository],
})
export class DocumentsModule {}
