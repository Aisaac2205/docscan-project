import { IsString, IsOptional, IsEnum, IsArray, ArrayMaxSize, MaxLength, Matches } from 'class-validator';
// IDs use cuid() format — validate as non-empty strings, not UUIDs

export enum ExtractionMode {
  INVOICE  = 'invoice',   // Factura: proveedor, fecha, total, nit
  RECEIPT  = 'receipt',   // Recibo/ticket: vendedor, fecha, total, items
  ID_CARD  = 'id_card',   // DPI, cédula, pasaporte
  GENERAL  = 'general',   // Texto libre completo
  CUSTOM   = 'custom',    // Campos personalizados por el usuario
}

// Solo letras, números, espacios y guión bajo — sin comillas ni caracteres de control
const SAFE_FIELD_REGEX = /^[\w\s]{1,50}$/;

export class ProcessOcrDto {
  @IsString()
  documentId: string;

  @IsOptional()
  @IsEnum(ExtractionMode)
  extractionMode?: ExtractionMode;

  /** Solo cuando extractionMode = 'custom'. Máx 10 campos, 50 chars c/u, solo alfanuméricos. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @MaxLength(50, { each: true })
  @Matches(SAFE_FIELD_REGEX, { each: true, message: 'customFields solo puede contener letras, números, espacios y guión bajo' })
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
