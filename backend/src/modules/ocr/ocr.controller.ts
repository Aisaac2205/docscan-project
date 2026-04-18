import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OcrService } from './ocr.service';
import {
  ProcessOcrDto, OcrResultDto, ExtractionMode,
  AnalyzeDocumentDto, QueryDocumentDto,
  AnalyzeResultDto, QueryResultDto,
} from './dto/ocr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OcrProviderRegistry } from './providers/ocr-provider.registry';
import type { ProviderInfo } from './providers/ocr-provider.interface';
import { ScannerAgentGuard } from '../../common/guards/scanner-agent.guard';
import { Public } from '../../common/decorators/public.decorator';
import { appConfig } from '../../config';
import { StorageService } from '../storage/storage.service';
import { DocumentsService } from '../documents/documents.service';
import { ScannerOcrUploadDto, ScannerOcrScanResponse } from './dto/scanner-ocr.dto';
import { ScannerOcrErrorDto } from './dto/scanner-ocr-error.dto';
import { ScannerOcrHeartbeatDto } from './dto/scanner-ocr-heartbeat.dto';

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('ocr')
@UseGuards(JwtAuthGuard)
@Throttle({ ai: { ttl: 60_000, limit: 10 } })
export class OcrController {
  constructor(
    private readonly ocrService: OcrService,
    private readonly registry: OcrProviderRegistry,
    private readonly storageService: StorageService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post('scan')
  @Public()
  @UseGuards(ScannerAgentGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: appConfig.upload.dir,
        filename: (_req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname || '.pdf') || '.pdf';
          cb(null, `scanner-agent-${uniqueSuffix}${ext}`);
        },
      }),
      limits: {
        fileSize: appConfig.upload.maxFileSize,
      },
      fileFilter: (_req, file, cb) => {
        if (file.mimetype !== 'application/pdf') {
          cb(new BadRequestException('Only PDF files are allowed for scanner ingestion'), false);
          return;
        }
        cb(null, true);
      },
    }),
  )
  async scanUpload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Body() dto: ScannerOcrUploadDto,
  ): Promise<ScannerOcrScanResponse> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!dto.userId?.trim()) {
      throw new BadRequestException('userId is required');
    }

    const extractionMode = dto.extractionMode ?? ExtractionMode.GENERAL;
    const customFields = dto.customFields ? this.parseCustomFields(dto.customFields) : undefined;
    const userId = dto.userId.trim();
    const jobId = req.header('x-job-id')?.trim();

    if (jobId) {
      const existing = await this.documentsService.findByOriginalName(userId, this.buildJobOriginalName(jobId));
      if (existing) {
        const previousMode = (existing.documentType as ExtractionMode) ?? extractionMode;
        return {
          documentId: existing.id,
          extractionMode: previousMode,
          extractedData: existing.extractedData,
          status: 'completed',
        };
      }
    }

    const uploaded = await this.storageService.uploadFile(file);
    const originalName = jobId
      ? this.buildJobOriginalName(jobId)
      : file.originalname || `scan-${Date.now()}.pdf`;

    const createdDocument = await this.documentsService.createDocument(userId, {
      originalName,
      mimeType: 'application/pdf',
      filePath: uploaded.url,
    });

    const extractedData = await this.ocrService.extractData(
      createdDocument.id,
      userId,
      extractionMode,
      customFields,
      dto.provider,
      dto.model,
    );

    return {
      documentId: createdDocument.id,
      extractionMode,
      extractedData,
      status: 'completed',
    };
  }

  @Post('scan/error')
  @Public()
  @UseGuards(ScannerAgentGuard)
  async scanError(
    @Body() dto: ScannerOcrErrorDto,
  ): Promise<{ received: true }> {
    console.error('[scanner-agent] Error report received', dto);
    return { received: true };
  }

  @Post('scan/heartbeat')
  @Public()
  @UseGuards(ScannerAgentGuard)
  async scanHeartbeat(
    @Body() dto: ScannerOcrHeartbeatDto,
  ): Promise<{ received: true; serverTime: string }> {
    console.log('[scanner-agent] Heartbeat', dto);
    return { received: true, serverTime: new Date().toISOString() };
  }

  /** Lista los providers disponibles con sus modelos. Usado por el frontend para el picker. */
  @Get('providers')
  async providers(): Promise<ProviderInfo[]> {
    return this.registry.listAvailable();
  }

  @Post('process')
  async process(
    @Req() req: AuthenticatedRequest,
    @Body() dto: ProcessOcrDto,
  ): Promise<OcrResultDto> {
    const userId = req.user.id;
    const mode = dto.extractionMode ?? ExtractionMode.GENERAL;
    const extractedData = await this.ocrService.extractData(
      dto.documentId,
      userId,
      mode,
      dto.customFields,
      dto.provider,
      dto.model,
    );
    return { documentId: dto.documentId, extractionMode: mode, extractedData };
  }

  @Post('analyze')
  async analyze(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AnalyzeDocumentDto,
  ): Promise<AnalyzeResultDto> {
    return this.ocrService.analyzeDocument(dto.documentId, req.user.id, dto.provider, dto.model);
  }

  @Post('query')
  async query(
    @Req() req: AuthenticatedRequest,
    @Body() dto: QueryDocumentDto,
  ): Promise<QueryResultDto> {
    return this.ocrService.queryDocument(dto.documentId, req.user.id, dto.question, dto.provider, dto.model);
  }

  @Get('query/:documentId/history')
  async history(
    @Req() req: AuthenticatedRequest,
    @Param('documentId') documentId: string,
  ) {
    return this.ocrService.getQueryHistory(documentId, req.user.id);
  }

  private parseCustomFields(rawCustomFields: string): string[] {
    let parsed: unknown;
    try {
      parsed = JSON.parse(rawCustomFields);
    } catch {
      throw new BadRequestException('customFields must be valid JSON');
    }

    if (!Array.isArray(parsed)) {
      throw new BadRequestException('customFields must be an array of strings');
    }

    const invalid = parsed.some((value) => typeof value !== 'string' || value.trim().length === 0);
    if (invalid) {
      throw new BadRequestException('customFields must contain only non-empty strings');
    }

    return parsed;
  }

  private buildJobOriginalName(jobId: string): string {
    return `scanner-job-${jobId}.pdf`;
  }
}
