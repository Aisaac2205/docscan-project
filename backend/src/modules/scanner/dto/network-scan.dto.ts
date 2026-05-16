import { IsBoolean, IsInt, IsIP, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';

export class NetworkScanDto {
  @IsIP()
  ipAddress: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;

  @IsBoolean()
  @IsOptional()
  useTls?: boolean;

  @IsBoolean()
  @IsOptional()
  verifyTls?: boolean;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  personId?: string;
}
