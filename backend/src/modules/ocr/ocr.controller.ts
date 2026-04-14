import { Controller, Post, Get, Body, UseGuards, Req, Param } from '@nestjs/common';
import { Request } from 'express';
import { Throttle } from '@nestjs/throttler';
import { OcrService } from './ocr.service';
import {
  ProcessOcrDto, OcrResultDto, ExtractionMode,
  AnalyzeDocumentDto, QueryDocumentDto,
  AnalyzeResultDto, QueryResultDto,
} from './dto/ocr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OcrProviderRegistry } from './providers/ocr-provider.registry';
import type { ProviderInfo } from './providers/ocr-provider.interface';

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
  ) {}

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
}
