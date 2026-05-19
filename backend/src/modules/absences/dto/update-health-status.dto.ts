import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export type HealthStatus = 'pending' | 'validated' | 'registered' | 'rejected';

export class UpdateHealthStatusDto {
  @IsEnum(['pending', 'validated', 'registered', 'rejected'])
  status: HealthStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

// Patch parcial de los campos OCR + notas. Cualquier campo omitido se mantiene
// como estaba. No permite cambiar el estado (eso vive en /status).
export class UpdateHealthRecordDto {
  @IsOptional() @IsString() @MaxLength(150) nombre_paciente?: string | null;
  @IsOptional() @IsString() @MaxLength(150) nombre_medico?: string | null;
  @IsOptional() @IsString() @MaxLength(50)  numero_colegiado?: string | null;
  @IsOptional() @IsString() @MaxLength(500) diagnostico?: string | null;
  @IsOptional() @IsString() @MaxLength(20)  fecha_emision?: string | null;
  @IsOptional() @IsString() @MaxLength(20)  fecha_inicio_reposo?: string | null;
  @IsOptional() @IsString() @MaxLength(20)  fecha_fin_reposo?: string | null;
  @IsOptional() @IsInt() @Min(0) dias_reposo?: number | null;
  @IsOptional() @IsBoolean() tiene_sello?: boolean | null;
  @IsOptional() @IsBoolean() tiene_firma?: boolean | null;
  @IsOptional() @IsString() @MaxLength(150) institucion_emisora?: string | null;
  @IsOptional() @IsString() @MaxLength(500) notes?: string | null;
}
