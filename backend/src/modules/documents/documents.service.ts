import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { DocumentsRepository } from './repositories/documents.repository';
import { CreateDocumentDto, UpdateDocumentDto } from './dto';

@Injectable()
export class DocumentsService {
  constructor(private repository: DocumentsRepository) { }

  async createDocument(userId: string, dto: CreateDocumentDto) {
    return this.repository.create({
      userId,
      originalName: dto.originalName,
      mimeType: dto.mimeType,
      filePath: dto.filePath,
      documentType: dto.documentType || 'document',
    });
  }

  async getDocuments(userId: string) {
    return this.repository.findByUserId(userId);
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

  async findByOriginalName(userId: string, originalName: string) {
    return this.repository.findByOriginalName(userId, originalName);
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
