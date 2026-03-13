import { Injectable, NotFoundException } from '@nestjs/common';
import { createWorker, Worker } from 'tesseract.js';
import { ocrConfig } from '../../config/ocr.config';
import { DocumentsRepository } from '../documents/repositories/documents.repository';

@Injectable()
export class OcrService {
  private worker: Worker | null = null;

  constructor(private documentsRepository: DocumentsRepository) {}

  async initializeWorker() {
    if (!this.worker) {
      this.worker = await createWorker(ocrConfig.language);
    }
    return this.worker;
  }

  async processImage(
    filePath: string,
    documentId: string,
    language: string = ocrConfig.language,
  ): Promise<{ text: string; confidence: number }> {
    const document = await this.documentsRepository.findById(documentId);
    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    await this.documentsRepository.update(documentId, { status: 'processing' });

    try {
      const worker = await this.initializeWorker();
      
      const result = await worker.recognize(filePath);
      
      const confidence = result.data.confidence / 100;

      await this.documentsRepository.update(documentId, {
        rawText: result.data.text,
        confidence,
        status: 'completed',
      });

      return {
        text: result.data.text,
        confidence,
      };
    } catch (error) {
      await this.documentsRepository.update(documentId, { status: 'failed' });
      throw error;
    }
  }

  async terminateWorker() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}
