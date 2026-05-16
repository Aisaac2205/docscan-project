import { IsBoolean, IsInt, IsIP, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class ScannerDeviceDto {
  id: string;
  name: string;
  manufacturer: string;
}

export class ScanResultDto {
  imageData: string;
  deviceId: string;
}

export class CreateScannerConfigDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsIP()
  ip: string;

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
}
