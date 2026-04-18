import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../config/database.config';
import { Prisma } from '@prisma/client';

export interface ExtractedData {
  proveedor?: string;
  fecha?: string;
  total?: number;
  nit?: string;
  [key: string]: unknown;
}

@Injectable()
export class DocumentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    originalName: string;
    mimeType: string;
    filePath: string;
    documentType?: string;
  }) {
    return this.prisma.document.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUserIdAndType(userId: string, documentType: string) {
    return this.prisma.document.findMany({
      where: { userId, documentType },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByOriginalName(userId: string, originalName: string) {
    return this.prisma.document.findFirst({
      where: { userId, originalName },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: {
    rawText?: string;
    confidence?: number;
    status?: string;
    originalName?: string;
    extractedData?: Prisma.InputJsonValue;
    documentType?: string;
    filePath?: string;
  }) {
    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.document.findFirst({
      where: { id, userId },
    });
  }
}
