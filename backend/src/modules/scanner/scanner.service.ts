import { Injectable } from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { dirname } from 'path';
import { appConfig } from '../../config';

@Injectable()
export class ScannerService {
  async getDevices(): Promise<{ id: string; name: string; manufacturer: string }[]> {
    return [
      {
        id: 'scanner-1',
        name: 'Escáner Predeterminado',
        manufacturer: 'TWAIN',
      },
    ];
  }

  async saveScannedImage(
    imageData: string,
    userId: string,
  ): Promise<{ filePath: string; originalName: string }> {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    const timestamp = Date.now();
    const fileName = `scan-${userId}-${timestamp}.png`;
    const filePath = `${appConfig.upload.dir}/${fileName}`;

    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, buffer);

    return {
      filePath,
      originalName: `scan-${timestamp}.png`,
    };
  }
}
