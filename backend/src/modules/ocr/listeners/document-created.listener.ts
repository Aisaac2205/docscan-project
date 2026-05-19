import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  DOCUMENT_CREATED,
  DocumentCreatedEvent,
} from '../../documents/events/document.events';
import { DocumentsService } from '../../documents/documents.service';
import { OcrService } from '../ocr.service';
import { ExtractionMode } from '../dto/ocr.dto';

@Injectable()
export class DocumentCreatedListener {
  private readonly logger = new Logger(DocumentCreatedListener.name);

  constructor(
    private readonly ocrService: OcrService,
    private readonly documentsService: DocumentsService,
  ) {}

  @OnEvent(DOCUMENT_CREATED, { async: true })
  async handle(event: DocumentCreatedEvent): Promise<void> {
    const { documentId, userId, source } = event;

    // Scanner flows ('scanner-camera', 'scanner-network') exigen extracción
    // explícita desde la UI. Auto-OCR solo aplica a uploads directos al inbox.
    if (source !== 'upload') {
      this.logger.log(`Auto-OCR skipped documentId=${documentId} source=${source}`);
      return;
    }

    const startedAt = Date.now();
    this.logger.log(`Auto-OCR start documentId=${documentId} source=${source}`);

    try {
      await this.ocrService.extractData(documentId, userId, ExtractionMode.GENERAL);
      this.logger.log(
        `Auto-OCR completed documentId=${documentId} durationMs=${Date.now() - startedAt}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(
        `Auto-OCR failed documentId=${documentId} durationMs=${Date.now() - startedAt}: ${msg}`,
      );
      // Mark document as failed so the frontend stops polling and surfaces the error.
      await this.documentsService
        .updateSystemData(documentId, { status: 'failed' })
        .catch((e) => this.logger.error(`Failed to mark document failed: ${e}`));
    }
  }
}
