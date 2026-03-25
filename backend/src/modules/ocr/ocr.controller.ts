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

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@Controller('ocr')
@UseGuards(JwtAuthGuard)
@Throttle({ ai: { ttl: 60_000, limit: 10 } })
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

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
    );
    return { documentId: dto.documentId, extractionMode: mode, extractedData };
  }

  @Post('analyze')
  async analyze(
    @Req() req: AuthenticatedRequest,
    @Body() dto: AnalyzeDocumentDto,
  ): Promise<AnalyzeResultDto> {
    return this.ocrService.analyzeDocument(dto.documentId, req.user.id);
  }

  @Post('query')
  async query(
    @Req() req: AuthenticatedRequest,
    @Body() dto: QueryDocumentDto,
  ): Promise<QueryResultDto> {
    return this.ocrService.queryDocument(dto.documentId, req.user.id, dto.question);
  }

  @Get('query/:documentId/history')
  async history(
    @Req() req: AuthenticatedRequest,
    @Param('documentId') documentId: string,
  ) {
    return this.ocrService.getQueryHistory(documentId, req.user.id);
  }
}
