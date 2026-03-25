import { IsString, IsOptional, IsIn } from 'class-validator';

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
    extractedData?: any;
}
