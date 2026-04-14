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
  name: string;
  ip: string;
  port: number;
}
