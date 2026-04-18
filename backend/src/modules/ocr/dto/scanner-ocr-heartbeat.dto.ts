import { IsInt, IsString, Max, MaxLength, Min } from 'class-validator';

export class ScannerOcrHeartbeatDto {
  @IsString()
  @MaxLength(100)
  agentId: string;

  @IsString()
  @MaxLength(50)
  version: string;

  @IsInt()
  @Min(0)
  @Max(10000)
  queueDepth: number;

  @IsString()
  @MaxLength(200)
  mode: string;
}
