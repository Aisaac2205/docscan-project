import { Injectable, BadRequestException } from '@nestjs/common';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { StorageService } from '../storage/storage.service';
import { DocumentsService } from '../documents/documents.service';
import { appConfig } from '../../config';
import * as http from 'http';
import * as https from 'https';

@Injectable()
export class ScannerService {
  constructor(
    private readonly storageService: StorageService,
    private readonly documentsService: DocumentsService,
  ) {}

  async saveCapturedImage(
    imageData: string,
    userId: string,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const timestamp = Date.now();
    const fileName = `camera-${userId}-${timestamp}.png`;
    const outputDir = appConfig.upload.dir;
    const outputPath = join(outputDir, fileName);

    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, buffer);

    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: 'image/png',
      size: buffer.length,
      destination: outputDir,
      filename: fileName,
      path: outputPath,
      buffer,
      stream: undefined as any,
    };

    const uploaded = await this.storageService.uploadFile(fakeFile);
    await unlink(outputPath).catch(() => {});

    const created = await this.documentsService.createDocument(userId, {
      originalName: fileName,
      mimeType: 'image/png',
      filePath: uploaded.url,
    });

    return { documentId: created.id, url: uploaded.url, originalName: fileName };
  }

  async scanFromNetwork(
    ipAddress: string,
    port: number,
    userId: string,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const baseUrl = `http://${ipAddress}:${port}/eSCL`;

    // 1. Verify scanner is reachable
    await this.httpGet(`${baseUrl}/ScannerStatus`).catch(() => {
      throw new BadRequestException(
        `No se pudo conectar al escáner en ${ipAddress}:${port}. Verifica la IP y que el dispositivo esté encendido.`,
      );
    });

    // 2. Send scan job (eSCL / AirScan protocol)
    const scanXml = `<?xml version="1.0" encoding="UTF-8"?>
<scan:ScanSettings
  xmlns:scan="http://schemas.hp.com/imaging/escl/2011/05/03"
  xmlns:pwg="http://www.pwg.org/schemas/2010/12/sm">
  <pwg:Version>2.6</pwg:Version>
  <scan:Intent>Document</scan:Intent>
  <scan:ScanRegions>
    <scan:ScanRegion>
      <pwg:ContentRegionUnits>escl:ThreeHundredthsOfInches</pwg:ContentRegionUnits>
      <pwg:Width>2550</pwg:Width>
      <pwg:Height>3300</pwg:Height>
      <pwg:XOffset>0</pwg:XOffset>
      <pwg:YOffset>0</pwg:YOffset>
    </scan:ScanRegion>
  </scan:ScanRegions>
  <scan:ColorMode>RGB24</scan:ColorMode>
  <scan:XResolution>300</scan:XResolution>
  <scan:YResolution>300</scan:YResolution>
  <pwg:DocumentFormat>image/jpeg</pwg:DocumentFormat>
</scan:ScanSettings>`;

    const jobLocation = await this.httpPost(
      `${baseUrl}/ScanJobs`,
      scanXml,
      'text/xml',
    ).catch(() => {
      throw new BadRequestException(
        'El escáner rechazó el trabajo de escaneo. Asegúrate de que sea compatible con AirScan (eSCL).',
      );
    });

    if (!jobLocation) {
      throw new BadRequestException('El escáner no devolvió una ubicación de trabajo.');
    }

    // 3. Retrieve scanned document (poll up to 30 s)
    const docUrl = jobLocation.startsWith('http')
      ? `${jobLocation}/NextDocument`
      : `http://${ipAddress}:${port}${jobLocation}/NextDocument`;

    const imageBuffer = await this.pollForDocument(docUrl, 30).catch(() => {
      throw new BadRequestException(
        'El escáner tardó demasiado en responder. Vuelve a intentarlo.',
      );
    });

    // 4. Save and upload
    const timestamp = Date.now();
    const fileName = `scanner-${userId}-${timestamp}.jpg`;
    const outputDir = appConfig.upload.dir;
    const outputPath = join(outputDir, fileName);

    await mkdir(outputDir, { recursive: true });
    await writeFile(outputPath, imageBuffer);

    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: fileName,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: imageBuffer.length,
      destination: outputDir,
      filename: fileName,
      path: outputPath,
      buffer: imageBuffer,
      stream: undefined as any,
    };

    const uploaded = await this.storageService.uploadFile(fakeFile);
    await unlink(outputPath).catch(() => {});

    const created = await this.documentsService.createDocument(userId, {
      originalName: fileName,
      mimeType: 'image/jpeg',
      filePath: uploaded.url,
    });

    return { documentId: created.id, url: uploaded.url, originalName: fileName };
  }

  /* ── HTTP helpers (Node built-in) ── */

  private httpGet(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? https : http;
      lib.get(url, { timeout: 8000 }, (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () =>
          res.statusCode && res.statusCode < 400
            ? resolve(data)
            : reject(new Error(`HTTP ${res.statusCode}`)),
        );
      }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
    });
  }

  private httpPost(url: string, body: string, contentType: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;
      const data = Buffer.from(body, 'utf-8');

      const req = lib.request(
        {
          hostname: parsed.hostname,
          port: parsed.port,
          path: parsed.pathname,
          method: 'POST',
          headers: {
            'Content-Type': contentType,
            'Content-Length': data.length,
          },
          timeout: 10000,
        },
        (res) => {
          const location = res.headers['location'] as string | undefined;
          res.resume(); // drain body
          if (res.statusCode && res.statusCode < 400) {
            resolve(location ?? '');
          } else {
            reject(new Error(`HTTP ${res.statusCode}`));
          }
        },
      );
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.write(data);
      req.end();
    });
  }

  private async pollForDocument(url: string, maxSeconds: number): Promise<Buffer> {
    const deadline = Date.now() + maxSeconds * 1000;
    while (Date.now() < deadline) {
      try {
        const buf = await this.httpGetBuffer(url);
        return buf;
      } catch {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    throw new Error('Poll timeout');
  }

  private httpGetBuffer(url: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? https : http;
      lib.get(url, { timeout: 8000 }, (res) => {
        if (!res.statusCode || res.statusCode >= 400) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
      }).on('error', reject).on('timeout', () => reject(new Error('timeout')));
    });
  }
}
