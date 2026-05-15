import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ListPersonsQueryDto {
  @IsOptional()
  @IsEnum(['active', 'hired', 'archived', 'rejected'])
  status?: 'active' | 'hired' | 'archived' | 'rejected';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  q?: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? 1 : Number.parseInt(String(value), 10)))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === '' ? 25 : Number.parseInt(String(value), 10)))
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 25;

  @IsOptional()
  @IsEnum(['completeness'])
  include?: 'completeness';
}
