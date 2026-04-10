import { IsString, IsOptional, IsEnum, IsArray, ArrayMaxSize, MaxLength, Matches } from 'class-validator';
// IDs use cuid() format — validate as non-empty strings, not UUIDs
// customFields son sanitizados por OcrService.sanitizeFieldName antes de llegar a Gemini

export enum ExtractionMode {
  INVOICE  = 'invoice',   // Factura: proveedor, fecha, total, nit
  RECEIPT  = 'receipt',   // Recibo/ticket: vendedor, fecha, total, items
  ID_CARD  = 'id_card',   // DPI, cédula, pasaporte
  GENERAL  = 'general',   // Texto libre completo
  CUSTOM   = 'custom',    // Campos personalizados por el usuario
}

// Bloquea solo caracteres de control y newlines — la sanitización real ocurre en OcrService
const SAFE_FIELD_REGEX = /^[^\x00-\x1f\x7f\n\r]{1,150}$/;

export class ProcessOcrDto {
  @IsString()
  documentId: string;

  @IsOptional()
  @IsEnum(ExtractionMode)
  extractionMode?: ExtractionMode;

  /** Solo cuando extractionMode = 'custom'. Máx 10 campos, 150 chars c/u. Los chars especiales son sanitizados por el servicio. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(150, { each: true })
  @Matches(SAFE_FIELD_REGEX, { each: true, message: 'customFields no puede contener caracteres de control ni saltos de línea' })
  customFields?: string[];
}

export class OcrResultDto {
  documentId: string;
  extractionMode: string;
  extractedData: Record<string, any>;
}

export class AnalyzeDocumentDto {
  @IsString()
  documentId: string;
}

export class QueryDocumentDto {
  @IsString()
  documentId: string;

  @IsString()
  @MaxLength(500)
  question: string;
}

export interface SuggestedField {
  key: string;
  label: string;
  description?: string;
}

export interface AnalyzeResultDto {
  documentId: string;
  detectedType: string;
  detectedTypeLabel: string;
  confidence: number;
  description: string;
  suggestedFields: SuggestedField[];
}

export interface QueryResultDto {
  documentId: string;
  question: string;
  answer: string;
}
