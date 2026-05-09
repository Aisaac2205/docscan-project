import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export type PersonRole = 'candidate' | 'employee';
export type PersonStatus = 'active' | 'hired' | 'archived' | 'rejected';

export class CreatePersonDto {
  @IsString()
  @MaxLength(200)
  fullName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cui?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEnum(['candidate', 'employee'])
  role?: PersonRole;

  @IsOptional()
  @IsEnum(['active', 'hired', 'archived', 'rejected'])
  status?: PersonStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePersonDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  cui?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsEnum(['candidate', 'employee'])
  role?: PersonRole;

  @IsOptional()
  @IsEnum(['active', 'hired', 'archived', 'rejected'])
  status?: PersonStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateProfileOverridesDto {
  // accepts arbitrary object — HR's manual edits over OCR-extracted fields
  overrides: Record<string, unknown>;
}
