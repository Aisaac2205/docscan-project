import { Injectable, BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import * as sharp from 'sharp';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

export interface UploadedFile {
  url: string;
  size: number;
  width: number;
  height: number;
}

@Injectable()
export class StorageService {
  private readonly storageZone: string;
  private readonly storageAccessKey: string;
  private readonly storageHost: string;
  private readonly cdnBaseUrl: string;
  private readonly maxFileSize = 10 * 1024 * 1024; // 10MB

  constructor() {
    this.storageZone = process.env.BUNNY_STORAGE_ZONE || '';
    this.storageAccessKey = process.env.BUNNY_STORAGE_ACCESS_KEY || '';
    this.storageHost = process.env.BUNNY_STORAGE_HOST || '';
    this.cdnBaseUrl = process.env.BUNNY_CDN_BASE_URL || '';

    if (!this.storageZone || !this.storageAccessKey || !this.storageHost || !this.cdnBaseUrl) {
      console.warn('Bunny storage environment variables are not fully configured');
    }
  }

  async uploadFile(file: Express.Multer.File): Promise<UploadedFile> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(`File size exceeds maximum of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/tiff', 'application/pdf'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Allowed: JPEG, PNG, WebP, GIF, TIFF, PDF');
    }

    const tempPath = file.path;
    const fileId = randomUUID();

    if (file.mimetype === 'application/pdf') {
      try {
        const pdfBuffer = fs.readFileSync(tempPath);
        const remotePath = `/${file.originalname.replace(/\.[^.]+$/, '')}_${fileId}.pdf`;
        const uploadSuccess = await this.uploadToBunny(remotePath, pdfBuffer);
        if (!uploadSuccess) {
          throw new HttpException('Failed to upload to storage', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        await this.safeUnlink(tempPath);
        return { url: `${this.cdnBaseUrl}${remotePath}`, size: pdfBuffer.length, width: 0, height: 0 };
      } catch (error) {
        if (fs.existsSync(tempPath)) await this.safeUnlink(tempPath);
        if (error instanceof HttpException) throw error;
        throw new HttpException(
          `Failed to upload PDF: ${error instanceof Error ? error.message : 'Unknown error'}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    }

    const outputFileName = `${fileId}.webp`;
    const tempOutputPath = path.join(path.dirname(tempPath), outputFileName);

    try {
      // Leer a buffer antes de procesar para liberar el file handle en Windows
      // (sharp(path) mantiene el descriptor abierto en Windows → EBUSY al unlinkSync)
      const inputBuffer = fs.readFileSync(tempPath);
      const optimizedBuffer = await sharp(inputBuffer)
        .resize(4096, 4096, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 85, effort: 6 })
        .toBuffer();

      const metadata = await sharp(optimizedBuffer).metadata();

      const remotePath = `/${file.originalname.split('.')[0]}_${fileId}.webp`;
      const uploadSuccess = await this.uploadToBunny(remotePath, optimizedBuffer);

      if (!uploadSuccess) {
        throw new HttpException(
          'Failed to upload to storage',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      await this.safeUnlink(tempPath);
      if (fs.existsSync(tempOutputPath)) {
        await this.safeUnlink(tempOutputPath);
      }

      return {
        url: `${this.cdnBaseUrl}${remotePath}`,
        size: optimizedBuffer.length,
        width: metadata.width || 0,
        height: metadata.height || 0,
      };
    } catch (error) {
      if (fs.existsSync(tempPath)) {
        await this.safeUnlink(tempPath);
      }
      if (fs.existsSync(tempOutputPath)) {
        await this.safeUnlink(tempOutputPath);
      }
      throw new HttpException(
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async uploadToBunny(remotePath: string, data: Buffer): Promise<boolean> {
    const url = `https://${this.storageHost}/${this.storageZone}${remotePath}`;

    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'AccessKey': this.storageAccessKey,
          'Content-Type': 'application/octet-stream',
        },
        body: new Uint8Array(data),
      });

      return response.ok;
    } catch (error) {
      console.error('Bunny upload error:', error);
      return false;
    }
  }

  /** Elimina un archivo con reintentos — Windows puede tener el handle ocupado brevemente tras escribirlo (EBUSY). */
  private async safeUnlink(filePath: string): Promise<void> {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        fs.unlinkSync(filePath);
        return;
      } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code === 'ENOENT') return; // ya fue borrado
        if (code === 'EBUSY' && attempt < 2) {
          await new Promise((r) => setTimeout(r, 80 * (attempt + 1)));
        } else {
          throw err;
        }
      }
    }
  }

  async deleteFile(fileUrl: string): Promise<boolean> {
    const url = `https://${this.storageHost}/${this.storageZone}${fileUrl.replace(this.cdnBaseUrl, '')}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'AccessKey': this.storageAccessKey,
        },
      });

      return response.ok || response.status === 404;
    } catch (error) {
      console.error('Bunny delete error:', error);
      return false;
    }
  }
}