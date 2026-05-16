import { Module } from '@nestjs/common';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';
import { DocumentsModule } from '../documents/documents.module';
import { GeminiProvider } from './providers/gemini.provider';
import { LMStudioProvider } from './providers/lmstudio.provider';
import { OcrProviderRegistry } from './providers/ocr-provider.registry';
import { DocumentCreatedListener } from './listeners/document-created.listener';

@Module({
  imports: [DocumentsModule],
  controllers: [OcrController],
  providers: [
    GeminiProvider,
    LMStudioProvider,
    OcrProviderRegistry,
    OcrService,
    DocumentCreatedListener,
  ],
  exports: [OcrService, OcrProviderRegistry],
})
export class OcrModule {}
