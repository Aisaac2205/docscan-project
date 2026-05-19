import { IsString, IsOptional, IsIn, IsEnum } from 'class-validator';
import { Prisma } from '@prisma/client';

export * from './list-documents-query.dto';
export * from './paginated-documents.dto';
export * from './documents-stats-query.dto';

export class ClassifyBackgroundDto {
  @IsEnum(['penal', 'policial'])
  tipo_emisor: 'penal' | 'policial';
}

export class CreateDocumentDto {
  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsString()
  filePath: string;

  @IsOptional()
  @IsString()
  @IsIn(['invoice', 'document'])
  documentType?: string;

  @IsOptional()
  @IsString()
  personId?: string;
}

export class UpdateDocumentDto {
    @IsOptional()
    @IsString()
    originalName?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    confidence?: number;

    @IsOptional()
    extractedData?: Prisma.InputJsonValue;
}
