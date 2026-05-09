import { IsEnum, IsOptional, IsString } from 'class-validator';

export type HealthStatus = 'pending' | 'validated' | 'registered' | 'rejected';

export class UpdateHealthStatusDto {
  @IsEnum(['pending', 'validated', 'registered', 'rejected'])
  status: HealthStatus;

  @IsOptional()
  @IsString()
  notes?: string;
}
