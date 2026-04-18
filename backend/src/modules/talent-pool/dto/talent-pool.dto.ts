import {
  ArrayMaxSize,
  ArrayMinSize,
  IsBoolean,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { ProviderId } from '../../ocr/providers/ocr-provider.interface';

export enum TalentPoolPriority {
  RAPIDEZ = 'rapidez',
  EQUILIBRIO = 'equilibrio',
  CALIDAD = 'calidad',
}

export enum TalentPoolTone {
  BREVE = 'breve',
  ESTANDAR = 'estandar',
  DETALLADO = 'detallado',
}

export enum TalentPoolLabel {
  MUY_RECOMENDADO = 'Muy recomendado',
  RECOMENDADO = 'Recomendado',
  REVISAR = 'Revisar',
  NO_RECOMENDADO = 'No recomendado',
}

export class TalentPoolCriteriaDto {
  @IsString()
  @MaxLength(120)
  puesto: string;

  @IsString()
  @MaxLength(1200)
  objetivoRol: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  imprescindible: string[];

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  deseable: string[];

  @IsString()
  @MaxLength(120)
  experienciaMinima: string;

  @IsString()
  @MaxLength(120)
  idiomaRequerido: string;

  @IsString()
  @MaxLength(120)
  ubicacionModalidad: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(200, { each: true })
  noQueremos: string[];

  @IsEnum(TalentPoolPriority)
  prioridadProceso: TalentPoolPriority;

  @IsEnum(TalentPoolTone)
  tonoInforme: TalentPoolTone;
}

export class TalentPoolCandidateDto {
  @IsString()
  @MaxLength(120)
  nombre: string;

  @IsString()
  @MaxLength(7000)
  resumenCv: string;
}

export class TalentPoolRankDto {
  @ValidateNested()
  @Type(() => TalentPoolCriteriaDto)
  criterios: TalentPoolCriteriaDto;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(25)
  @ValidateNested({ each: true })
  @Type(() => TalentPoolCandidateDto)
  candidatos: TalentPoolCandidateDto[];

  @IsOptional()
  @IsEnum(['gemini', 'lmstudio'] as const)
  provider?: ProviderId;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  model?: string;
}

export interface TalentPoolRankedCandidateDto {
  nombre: string;
  score: number;
  etiqueta: TalentPoolLabel;
  explicacion: string;
  alertas: string[];
  orden: number;
}

export interface TalentPoolRankResultDto {
  puesto: string;
  prioridadProceso: TalentPoolPriority;
  tonoInforme: TalentPoolTone;
  totalCandidatos: number;
  ranking: TalentPoolRankedCandidateDto[];
  resumenGeneral: string;
  run: TalentPoolRunMetaDto;
}

export interface TalentPoolCandidateRawScore {
  nombre: string;
  score: number;
  explicacion: string;
  alertas?: string[];
}

export interface TalentPoolRunMetaDto {
  id: string;
  provider: string;
  model: string | null;
  isPinned: boolean;
  createdAt: string;
}

export interface TalentPoolHistoryItemDto {
  id: string;
  puesto: string;
  prioridadProceso: TalentPoolPriority;
  tonoInforme: TalentPoolTone;
  totalCandidatos: number;
  rankingTop3: TalentPoolRankedCandidateDto[];
  resumenGeneral: string;
  provider: string;
  model: string | null;
  isPinned: boolean;
  createdAt: string;
}

export class TalentPoolHistoryQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class TalentPoolPinRunDto {
  @IsBoolean()
  isPinned: boolean;
}
