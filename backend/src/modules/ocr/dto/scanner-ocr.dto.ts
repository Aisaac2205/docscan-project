import { IsEnum, IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { ExtractionMode } from './ocr.dto';
import type { ProviderId } from '../providers/ocr-provider.interface';

export class ScannerOcrUploadDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsEnum(ExtractionMode)
  extractionMode?: ExtractionMode;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  @Matches(/^[^\n\r]*$/, {
    message: 'customFields must be a JSON string without line breaks',
  })
  customFields?: string;

  @IsOptional()
  @IsEnum(['gemini', 'lmstudio'] as const)
  provider?: ProviderId;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}

export interface ScannerOcrScanResponse {
  documentId: string;
  extractionMode: ExtractionMode;
  extractedData: unknown;
  status: 'completed';
}
