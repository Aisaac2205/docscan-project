import { IsEnum, IsISO8601, IsInt, IsString, Max, MaxLength, Min } from 'class-validator';
import { ExtractionMode } from './ocr.dto';
import { IsOptional } from 'class-validator';

export class ScannerOcrErrorDto {
  @IsString()
  userId: string;

  @IsEnum(['scan', 'upload'] as const)
  stage: 'scan' | 'upload';

  @IsString()
  @MaxLength(2000)
  errorMessage: string;

  @IsInt()
  @Min(1)
  @Max(10)
  attempts: number;

  @IsISO8601()
  createdAt: string;

  @IsEnum(ExtractionMode)
  extractionMode: ExtractionMode;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  jobId?: string;
}
