import {
  IsBooleanString,
  IsIn,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ALL_LIST_FILTER_TYPES } from '../documents.constants';

export const DEFAULT_LIST_PAGE = 1;
export const DEFAULT_LIST_LIMIT = 25;
export const MAX_LIST_LIMIT = 200;

export const ALL_LIST_SORT_FIELDS = ['createdAt', 'confidence', 'originalName'] as const;
export type ListSortField = (typeof ALL_LIST_SORT_FIELDS)[number];

export const ALL_LIST_SORT_ORDERS = ['asc', 'desc'] as const;
export type ListSortOrder = (typeof ALL_LIST_SORT_ORDERS)[number];

/**
 * Query DTO para `GET /api/documents`. Todos los params son opcionales; el
 * controller resuelve defaults coherentes en runtime.
 *
 * Filtros tipados como string libre por compatibilidad: `documentType` y
 * `status` en Prisma son strings, no enums. El whitelist de `type` se
 * aplica solo si el caller lo manda; valores fuera del set retornan
 * resultado vacío naturalmente (no es un error).
 */
export class ListDocumentsQueryDto {
  @IsOptional()
  @IsString()
  personId?: string;

  @IsOptional()
  @IsBooleanString()
  unassigned?: string;

  @IsOptional()
  @IsString()
  @IsIn([...ALL_LIST_FILTER_TYPES])
  type?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;

  /**
   * Límite superior del confidence (fracción 0–1). Lo usa el filtro "Revisión"
   * combinando `status=completed&confidenceMax=0.85`.
   */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceMax?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(1)
  confidenceMin?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIST_LIMIT)
  limit?: number;

  @IsOptional()
  @IsIn([...ALL_LIST_SORT_FIELDS])
  sort?: ListSortField;

  @IsOptional()
  @IsIn([...ALL_LIST_SORT_ORDERS])
  order?: ListSortOrder;
}
