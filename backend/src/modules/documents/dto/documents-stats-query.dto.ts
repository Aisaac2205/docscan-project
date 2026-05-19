import { IsISO8601, IsOptional } from 'class-validator';

export class DocumentsStatsQueryDto {
  @IsOptional()
  @IsISO8601()
  dateFrom?: string;

  @IsOptional()
  @IsISO8601()
  dateTo?: string;
}

export interface DocumentsMetric {
  value: number;
  delta: number;        // signed % vs período anterior
  sparkline: number[];  // 7 puntos, viejo → nuevo
}

export interface DocumentsStatsResponse {
  total: DocumentsMetric;
  ocrPrecision: DocumentsMetric;
  needsReview: DocumentsMetric;
}
