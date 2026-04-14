import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { DocumentsModule } from '../documents/documents.module';
import { GeminiProvider } from './providers/gemini.provider';
import { LMStudioProvider } from './providers/lmstudio.provider';
import { OcrProviderRegistry } from './providers/ocr-provider.registry';

@Module({
  imports: [DocumentsModule],
  controllers: [OcrController],
  providers: [GeminiProvider, LMStudioProvider, OcrProviderRegistry, OcrService],
  exports: [OcrService],
})
export class OcrModule {}
