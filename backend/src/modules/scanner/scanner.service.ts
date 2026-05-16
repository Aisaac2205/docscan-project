import { Injectable, Logger, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Readable } from 'stream';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { StorageService } from '../storage/storage.service';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../../config/database.config';
import { appConfig } from '../../config';
import * as http from 'http';
import * as https from 'https';

@Injectable()
export class ScannerService {
  private readonly logger = new Logger(ScannerService.name);

  constructor(
    private readonly storageService: StorageService,
    private readonly documentsService: DocumentsService,
    private readonly prisma: PrismaService,
  ) {}

  /* ── Scanner configs ── */

  async getConfigs(userId: string) {
    // Sync the env-driven default scanner (if configured) for this user before listing.
    await this.syncDefaultConfigFromEnv(userId);
    return this.prisma.scannerConfig.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * If ESCL_DEFAULT_SCANNER_NAME + IP are set in env, upsert a matching config
   * for this user. Lets a solo dev change the printer (IP/name/TLS) via .env
   * without touching the UI. No-op when env vars are not set.
   */
  private async syncDefaultConfigFromEnv(userId: string): Promise<void> {
    const { defaultName, defaultIp, defaultPort, defaultUseTls, defaultVerifyTls } =
      appConfig.scanner;
    if (!defaultName || !defaultIp) return;

    const port = defaultPort ?? (defaultUseTls ? 443 : 80);
    const existing = await this.prisma.scannerConfig.findFirst({
      where: { userId, name: defaultName },
    });

    if (!existing) {
      const created = await this.prisma.scannerConfig.create({
        data: {
          userId,
          name: defaultName,
          ip: defaultIp,
          port,
          useTls: defaultUseTls,
          verifyTls: defaultVerifyTls,
        },
      });
      this.logger.log(`Env default scanner created: id=${created.id} user=${userId} url=${this.buildBaseUrl(created)}`);
      return;
    }

    const drift =
      existing.ip !== defaultIp ||
      existing.port !== port ||
      existing.useTls !== defaultUseTls ||
      existing.verifyTls !== defaultVerifyTls;
    if (!drift) return;

    await this.prisma.scannerConfig.update({
      where: { id: existing.id },
      data: { ip: defaultIp, port, useTls: defaultUseTls, verifyTls: defaultVerifyTls },
    });
    this.logger.log(
      `Env default scanner updated: id=${existing.id} user=${userId} ` +
        `${existing.ip}:${existing.port} -> ${defaultIp}:${port} ` +
        `tls=${defaultUseTls} verify=${defaultVerifyTls}`,
    );
  }

  async createConfig(
    userId: string,
    data: { name: string; ip: string; port?: number; useTls?: boolean; verifyTls?: boolean },
  ) {
    const useTls = data.useTls ?? false;
    const port = data.port ?? (useTls ? 443 : 80);
    const created = await this.prisma.scannerConfig.create({
      data: {
        userId,
        name: data.name,
        ip: data.ip,
        port,
        useTls,
        verifyTls: data.verifyTls ?? true,
      },
    });
    this.logger.log(
      `ScannerConfig created: id=${created.id} user=${userId} url=${this.buildBaseUrl(created)}`,
    );
    return created;
  }

  /** Builds the eSCL base URL from a config row, respecting useTls. */
  private buildBaseUrl(cfg: { ip: string; port: number; useTls: boolean }): string {
    const scheme = cfg.useTls ? 'https' : 'http';
    return `${scheme}://${cfg.ip}:${cfg.port}`;
  }

  /** Builds an https.Agent that honors the per-config verifyTls flag. */
  private buildAgent(useTls: boolean, verifyTls: boolean): https.Agent | undefined {
    if (!useTls) return undefined;
    return new https.Agent({ rejectUnauthorized: verifyTls });
  }

  async deleteConfig(id: string, userId: string) {
    const config = await this.prisma.scannerConfig.findUnique({ where: { id } });
    if (!config) throw new NotFoundException('Escáner no encontrado');
    if (config.userId !== userId) throw new ForbiddenException();
    await this.prisma.scannerConfig.delete({ where: { id } });
    this.logger.log(`ScannerConfig deleted: id=${id} user=${userId}`);
  }

  async pingConfig(id: string, userId: string): Promise<{ online: boolean }> {
    const config = await this.prisma.scannerConfig.findUnique({ where: { id } });
    if (!config) throw new NotFoundException('Escáner no encontrado');
    if (config.userId !== userId) throw new ForbiddenException();

    const baseUrl = this.buildBaseUrl(config);
    const agent = this.buildAgent(config.useTls, config.verifyTls);
    const online = await this.httpGet(`${baseUrl}/eSCL/ScannerStatus`, agent)
      .then(() => true)
      .catch((err: Error) => {
        this.logger.warn(`Ping failed for ${baseUrl}: ${err.message}`);
        return false;
      });

    if (online) {
      this.logger.debug(`Ping OK: ${baseUrl}`);
      await this.prisma.scannerConfig.update({
        where: { id },
        data: { lastSeenAt: new Date() },
      });
    }

    return { online };
  }

  async saveCapturedImage(
    imageData: string,
    userId: string,
    personId?: string,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const startedAt = Date.now();
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const timestamp = Date.now();
    const fileName = `camera-${userId}-${timestamp}.png`;
    const outputDir = appConfig.upload.dir;
    const outputPath = join(outputDir, fileName);

    this.logger.log(`Camera capture starting: user=${userId} bytes=${buffer.length} personId=${personId ?? 'none'}`);

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
      stream: undefined as unknown as Readable,
    };

    const uploaded = await this.storageService.uploadFile(fakeFile);
    await unlink(outputPath).catch(() => {});

    const created = await this.documentsService.createDocument(
      userId,
      {
        originalName: fileName,
        mimeType: 'image/webp',
        filePath: uploaded.url,
        personId,
      },
      'scanner-camera',
    );

    this.logger.log(
      `Camera capture completed: documentId=${created.id} bytes=${buffer.length} durationMs=${Date.now() - startedAt}`,
    );
    return { documentId: created.id, url: uploaded.url, originalName: fileName };
  }

  async scanFromNetwork(
    opts: { ipAddress: string; port?: number; useTls?: boolean; verifyTls?: boolean },
    userId: string,
    personId?: string,
  ): Promise<{ documentId: string; url: string; originalName: string }> {
    const startedAt = Date.now();
    const useTls = opts.useTls ?? false;
    const verifyTls = opts.verifyTls ?? true;
    const port = opts.port ?? (useTls ? 443 : 80);
    const ipAddress = opts.ipAddress;
    const agent = this.buildAgent(useTls, verifyTls);
    const baseUrl = `${this.buildBaseUrl({ ip: ipAddress, port, useTls })}/eSCL`;
    this.logger.log(`Starting eSCL scan job to ${baseUrl} user=${userId}`);

    // 1. Verify scanner is reachable
    await this.httpGet(`${baseUrl}/ScannerStatus`, agent).catch((err: Error) => {
      this.logger.error(`Scanner unreachable at ${baseUrl}: ${err.message}`, err.stack);
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

    // POST ScanJobs — retry once on transient 503 (scanner momentarily busy).
    const jobLocation = await this.submitScanJobWithRetry(
      `${baseUrl}/ScanJobs`,
      scanXml,
      agent,
      ipAddress,
      port,
    );

    // 3. Retrieve scanned document. EPSON L4360 cold-start warmup + scan at 300 DPI
    //    can push past 30 s on first request after idle, so 60 s gives headroom.
    const scheme = useTls ? 'https' : 'http';
    const docUrl = jobLocation.startsWith('http')
      ? `${jobLocation}/NextDocument`
      : `${scheme}://${ipAddress}:${port}${jobLocation}/NextDocument`;

    const imageBuffer = await this.pollForDocument(docUrl, 60, agent).catch((err: Error) => {
      this.logger.error(`Poll timeout for ${docUrl}: ${err.message}`, err.stack);
      throw new BadRequestException(
        'El escáner tardó demasiado en responder. Verificá que haya papel en el vidrio y volvé a intentar.',
      );
    });

    // 3b. Release the job on the scanner (eSCL DELETE) — best-effort.
    const jobUrlAbsolute = jobLocation.startsWith('http')
      ? jobLocation
      : `${scheme}://${ipAddress}:${port}${jobLocation}`;
    this.httpDelete(jobUrlAbsolute, agent).catch((err: Error) => {
      this.logger.warn(`Failed to DELETE scan job ${jobUrlAbsolute}: ${err.message}`);
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
      stream: undefined as unknown as Readable,
    };

    const uploaded = await this.storageService.uploadFile(fakeFile);
    await unlink(outputPath).catch(() => {});

    const created = await this.documentsService.createDocument(
      userId,
      {
        originalName: fileName,
        mimeType: 'image/webp',
        filePath: uploaded.url,
        personId,
      },
      'scanner-network',
    );

    this.logger.log(
      `Scan completed: documentId=${created.id} bytes=${imageBuffer.length} durationMs=${Date.now() - startedAt}`,
    );
    return { documentId: created.id, url: uploaded.url, originalName: fileName };
  }

  /* ── HTTP helpers (Node built-in) ── */

  private httpGet(url: string, agent?: https.Agent): Promise<string> {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? https : http;
      lib.get(url, { timeout: 8000, agent }, (res) => {
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

  /**
   * Submits an eSCL ScanJob, retrying once on transient 503 after a 4s pause.
   * The scanner often returns 503 immediately after a previous job completes,
   * even when ScannerStatus reports Idle, because it briefly resets state.
   */
  private async submitScanJobWithRetry(
    url: string,
    body: string,
    agent: https.Agent | undefined,
    ipAddress: string,
    port: number,
  ): Promise<string> {
    const attempt = async (): Promise<string> => this.httpPost(url, body, 'text/xml', agent);

    let jobLocation: string;
    try {
      jobLocation = await attempt();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      const is503 = msg.includes('HTTP 503');
      if (!is503) {
        this.logger.error(`Scan job rejected by ${ipAddress}:${port}: ${msg}`);
        throw new BadRequestException(
          'El escáner rechazó el trabajo de escaneo. Asegúrate de que sea compatible con AirScan (eSCL).',
        );
      }
      this.logger.warn(`Scan job got 503 from ${ipAddress}:${port} — retrying in 4s...`);
      await new Promise((r) => setTimeout(r, 4000));
      try {
        jobLocation = await attempt();
      } catch (retryErr) {
        const retryMsg = retryErr instanceof Error ? retryErr.message : String(retryErr);
        this.logger.error(`Scan job rejected on retry by ${ipAddress}:${port}: ${retryMsg}`);
        throw new BadRequestException(
          'El escáner está ocupado. Esperá unos segundos y volvé a intentar.',
        );
      }
    }

    if (!jobLocation) {
      this.logger.error(`Scanner returned no Location header: ${ipAddress}:${port}`);
      throw new BadRequestException('El escáner no devolvió una ubicación de trabajo.');
    }
    this.logger.debug(`Scan job created: location=${jobLocation}`);
    return jobLocation;
  }

  private httpDelete(url: string, agent?: https.Agent): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;
      const req = lib.request(
        {
          hostname: parsed.hostname,
          port: parsed.port,
          path: parsed.pathname,
          method: 'DELETE',
          timeout: 5000,
          agent,
        },
        (res) => {
          res.resume();
          if (res.statusCode && res.statusCode < 400) resolve();
          else reject(new Error(`HTTP ${res.statusCode}`));
        },
      );
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
  }

  private httpPost(
    url: string,
    body: string,
    contentType: string,
    agent?: https.Agent,
  ): Promise<string> {
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
          agent,
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

  private async pollForDocument(
    url: string,
    maxSeconds: number,
    agent?: https.Agent,
  ): Promise<Buffer> {
    const intervalMs = 1500;
    const start = Date.now();
    const deadline = start + maxSeconds * 1000;
    let attempt = 0;
    while (Date.now() < deadline) {
      attempt++;
      try {
        const buf = await this.httpGetBuffer(url, agent);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        this.logger.log(`Poll OK on attempt ${attempt} after ${elapsed}s: ${buf.length} bytes`);
        return buf;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        const elapsed = ((Date.now() - start) / 1000).toFixed(1);
        // 503 = scanner still preparing; expected during warmup. Log at debug.
        const isBusy = msg.includes('HTTP 503');
        const level = isBusy ? 'debug' : 'warn';
        this.logger[level](`Poll attempt ${attempt} @${elapsed}s: ${msg}`);
        await new Promise((r) => setTimeout(r, intervalMs));
      }
    }
    throw new Error('Poll timeout');
  }

  private httpGetBuffer(url: string, agent?: https.Agent): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? https : http;
      lib.get(url, { timeout: 8000, agent }, (res) => {
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
