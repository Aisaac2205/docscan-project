import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OcrService } from './ocr.service';
import { ProcessOcrDto } from './dto/ocr.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ocr')
@UseGuards(JwtAuthGuard)
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post('process')
  async process(@Body() dto: ProcessOcrDto) {
    const result = await this.ocrService.processImage(
      dto.documentId,
      dto.documentId,
      dto.language,
    );
    return result;
  }
}
