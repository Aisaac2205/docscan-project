import { IsString, IsOptional } from 'class-validator';

export class ProcessOcrDto {
  @IsString()
  documentId: string;

  @IsString()
  @IsOptional()
  language?: string;
}

export class OcrResultDto {
  text: string;
  confidence: number;
  documentId: string;
}
