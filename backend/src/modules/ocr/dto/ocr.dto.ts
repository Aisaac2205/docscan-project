import { IsString, IsOptional, IsEnum, IsArray, ArrayMaxSize, MaxLength, Matches } from 'class-validator';
import type { ExtractedDataByMode } from '../schemas/extraction.schemas';
import type { ProviderId } from '../providers/ocr-provider.interface';
// IDs use cuid() format — validate as non-empty strings, not UUIDs
// customFields son sanitizados por OcrService.sanitizeFieldName antes de llegar a Gemini

export enum ExtractionMode {
  CV           = 'cv',           // Currículum Vitae: datos personales, experiencia, educación, habilidades
  ID_CARD      = 'id_card',      // DPI / Pasaporte guatemalteco: CUI, nombres, vigencia
  FISCAL_SOCIAL = 'fiscal_social', // NIT (SAT), RTU, número de afiliación IGSS
  MEDICAL_CERT = 'medical_cert', // Constancia médica: médico, colegiado, reposo
  GENERAL      = 'general',      // Texto libre completo
  CUSTOM       = 'custom',       // Campos personalizados por el usuario
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

  /** Provider de IA a usar. Si se omite usa el default configurado en OCR_PROVIDER. */
  @IsOptional()
  @IsEnum(['gemini', 'lmstudio'] as const)
  provider?: ProviderId;

  /** Modelo específico del provider. Si se omite usa el configurado en .env. */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}

export class OcrResultDto<M extends ExtractionMode = ExtractionMode> {
  documentId: string;
  extractionMode: M;
  extractedData: ExtractedDataByMode[M];
}

export class AnalyzeDocumentDto {
  @IsString()
  documentId: string;

  @IsOptional()
  @IsEnum(['gemini', 'lmstudio'] as const)
  provider?: ProviderId;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}

export class QueryDocumentDto {
  @IsString()
  documentId: string;

  @IsString()
  @MaxLength(500)
  question: string;

  @IsOptional()
  @IsEnum(['gemini', 'lmstudio'] as const)
  provider?: ProviderId;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
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
