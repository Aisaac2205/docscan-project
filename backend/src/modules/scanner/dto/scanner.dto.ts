export class ScannerDeviceDto {
  id: string;
  name: string;
  manufacturer: string;
}

export class ScanResultDto {
  imageData: string;
  deviceId: string;
}
