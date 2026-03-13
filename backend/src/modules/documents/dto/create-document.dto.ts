import { IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  originalName: string;

  @IsString()
  mimeType: string;

  @IsString()
  filePath: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  rawText?: string;

  @IsOptional()
  confidence?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
