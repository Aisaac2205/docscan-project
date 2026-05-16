import { ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Prisma } from '@prisma/client';
import { DocumentsRepository } from './repositories/documents.repository';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';
import { DOCUMENT_CREATED, DocumentCreatedEvent } from './events/document.events';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private repository: DocumentsRepository,
    private readonly events: EventEmitter2,
  ) { }

  async createDocument(
    userId: string,
    dto: CreateDocumentDto,
    source: DocumentCreatedEvent['source'] = 'upload',
  ) {
    const created = await this.repository.create({
      userId,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
      filePath: dto.filePath,
      documentType: dto.documentType || 'document',
      personId: dto.personId ?? null,
    });

    const payload: DocumentCreatedEvent = {
      documentId: created.id,
      userId,
      source,
    };
    this.events.emit(DOCUMENT_CREATED, payload);
    this.logger.log(`Emitted ${DOCUMENT_CREATED} documentId=${created.id} source=${source}`);

    return created;
  }

  async getDocuments(
    userId: string,
    filters?: { personId?: string; unassigned?: boolean; type?: string; status?: string },
  ) {
    return this.repository.findByUserIdFiltered(userId, filters ?? {});
  }

  async assignToPerson(id: string, userId: string, personId: string | null) {
    const document = await this.repository.findByIdAndUserId(id, userId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    return this.repository.update(id, { personId });
  }

  async classifyBackground(id: string, userId: string, tipoEmisor: 'penal' | 'policial') {
    const document = await this.repository.findByIdAndUserId(id, userId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    if (document.documentType !== 'background_check') {
      throw new ForbiddenException(
        'Solo se pueden clasificar documentos de tipo antecedentes (background_check).',
      );
    }

    const current =
      document.extractedData && typeof document.extractedData === 'object' && !Array.isArray(document.extractedData)
        ? (document.extractedData as Record<string, unknown>)
        : {};

    const next: Prisma.InputJsonValue = {
      ...current,
      tipo_emisor: tipoEmisor,
    };

    return this.repository.update(id, { extractedData: next });
  }

  async getDocumentsByType(userId: string, documentType: string) {
    return this.repository.findByUserIdAndType(userId, documentType);
  }

  async getDocument(id: string, userId: string) {
    const document = await this.repository.findByIdAndUserId(id, userId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    return document;
  }

  async updateDocument(id: string, userId: string, dto: UpdateDocumentDto) {
    const document = await this.repository.findByIdAndUserId(id, userId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    return this.repository.update(id, dto);
  }

  async deleteDocument(id: string, userId: string) {
    const document = await this.repository.findByIdAndUserId(id, userId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }
    return this.repository.delete(id);
  }

  async updateSystemData(id: string, updateData: { extractedData?: Prisma.InputJsonValue; status?: string }) {
    return this.repository.update(id, updateData);
  }
}
