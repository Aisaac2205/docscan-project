import { existsSync, unlinkSync } from 'fs';
import { buildRuntimeInfo, buildTempPdfPath, loadConfig } from './config';
import { logError, logInfo, logWarn } from './logging';
import { Naps2Service } from './naps2.service';
import { QueueService } from './queue.service';
import { withRetries } from './retry.service';
import { UploadService } from './upload.service';
import { QueuedUpload } from './types';

const DIRECT_RETRY = { maxAttempts: 3, waitMs: 5000 };
const DEFAULT_HEARTBEAT_MS = 60_000;
const DEFAULT_FLUSH_INTERVAL_MS = 30_000;

function buildJobId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

async function scanAndUploadNow(): Promise<void> {
  const config = loadConfig();
  const runtime = buildRuntimeInfo();
  const pdfPath = buildTempPdfPath(config.scanTempDir);
  const jobId = buildJobId('live');

  const naps2Service = new Naps2Service(config);
  const uploadService = new UploadService(config);
  const queueService = new QueueService(config);

  try {
    logInfo('Starting scan with NAPS2', { jobId, agentId: runtime.agentId });

    const scanResult = await withRetries(
      async () => naps2Service.scanToPdf(pdfPath),
      DIRECT_RETRY,
      'naps2-scan',
    );

    if (scanResult.stdout.trim()) {
      logInfo('NAPS2 stdout', { jobId, stdout: scanResult.stdout.trim() });
    }
    if (scanResult.stderr.trim()) {
      logWarn('NAPS2 stderr', { jobId, stderr: scanResult.stderr.trim() });
    }

    logInfo('Scan completed, uploading PDF', { jobId, pdfPath });
    const uploadResult = await withRetries(
      async () =>
        uploadService.uploadScannedPdfAs({
          pdfPath,
          userId: config.targetUserId,
          extractionMode: config.extractionMode,
          jobId,
        }),
      DIRECT_RETRY,
      'backend-upload',
    );

    logInfo('Upload and OCR completed', {
      jobId,
      documentId: uploadResult.documentId,
      extractionMode: uploadResult.extractionMode,
      status: uploadResult.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logError('Scan flow failed, queueing PDF for retry', { jobId, error: message });

    if (existsSync(pdfPath)) {
      const queued = queueService.enqueue({
        jobId,
        pdfPath,
        userId: config.targetUserId,
        extractionMode: config.extractionMode,
      });

      logWarn('PDF queued for deferred upload', {
        queueId: queued.id,
        jobId: queued.jobId,
        pdfPath: queued.pdfPath,
      });
      process.exitCode = 2;
      return;
    }

    await uploadService.notifyFinalFailure({
      stage: 'scan',
      errorMessage: message,
      attempts: DIRECT_RETRY.maxAttempts,
      jobId,
    });
    process.exitCode = 1;
  } finally {
    if (existsSync(pdfPath)) {
      const isQueuedPath = queueService
        .listPending(new Date('2100-01-01T00:00:00.000Z'))
        .some((item) => item.pdfPath === pdfPath);

      if (!isQueuedPath) {
        try {
          unlinkSync(pdfPath);
          logInfo('Temporary file deleted', { jobId, pdfPath });
        } catch (cleanupError) {
          const cleanupMessage =
            cleanupError instanceof Error ? cleanupError.message : String(cleanupError);
          logError('Could not delete temporary file', { jobId, error: cleanupMessage, pdfPath });
        }
      }
    }
  }
}

async function processQueue(): Promise<number> {
  const config = loadConfig();
  const uploadService = new UploadService(config);
  const queueService = new QueueService(config);

  const dueItems = queueService.listPending(new Date());
  if (dueItems.length === 0) {
    logInfo('Queue empty or no due items', { queueDepth: queueService.getDepth() });
    return 0;
  }

  logInfo('Processing queued uploads', { due: dueItems.length, queueDepth: queueService.getDepth() });

  for (const item of dueItems) {
    await processQueuedItem(item, uploadService, queueService);
  }

  return dueItems.length;
}

async function processQueuedItem(
  item: QueuedUpload,
  uploadService: UploadService,
  queueService: QueueService,
): Promise<void> {
  try {
    if (!existsSync(item.pdfPath)) {
      queueService.removeIfMissingFile(item.id);
      return;
    }

    const result = await uploadService.uploadScannedPdfAs({
      pdfPath: item.pdfPath,
      userId: item.userId,
      extractionMode: item.extractionMode,
      jobId: item.jobId,
    });

    queueService.markSuccess(item.id);
    logInfo('Queued upload completed', {
      queueId: item.id,
      jobId: item.jobId,
      documentId: result.documentId,
      status: result.status,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    queueService.markFailure(item.id, message);
    logWarn('Queued upload failed', {
      queueId: item.id,
      jobId: item.jobId,
      error: message,
      nextRetryAt: queueService
        .listPending(new Date('2100-01-01T00:00:00.000Z'))
        .find((entry) => entry.id === item.id)?.nextRetryAt,
    });
  }
}

async function runDaemon(): Promise<void> {
  const config = loadConfig();
  const runtime = buildRuntimeInfo();
  const uploadService = new UploadService(config);
  const queueService = new QueueService(config);

  const heartbeatMs = Number(process.env.HEARTBEAT_INTERVAL_MS || DEFAULT_HEARTBEAT_MS);
  const flushMs = Number(process.env.FLUSH_INTERVAL_MS || DEFAULT_FLUSH_INTERVAL_MS);

  if (!Number.isFinite(heartbeatMs) || heartbeatMs < 5000) {
    throw new Error('HEARTBEAT_INTERVAL_MS must be a number >= 5000');
  }

  if (!Number.isFinite(flushMs) || flushMs < 5000) {
    throw new Error('FLUSH_INTERVAL_MS must be a number >= 5000');
  }

  logInfo('Daemon mode started', {
    agentId: runtime.agentId,
    version: runtime.version,
    heartbeatMs,
    flushMs,
  });

  setInterval(() => {
    void processQueue().catch((error) => {
      const message = error instanceof Error ? error.message : String(error);
      logError('Periodic queue flush failed', { error: message });
    });
  }, flushMs);

  setInterval(() => {
    void uploadService.sendHeartbeat({
      agentId: runtime.agentId,
      version: runtime.version,
      queueDepth: queueService.getDepth(),
      mode: 'daemon',
    });
  }, heartbeatMs);

  await processQueue();
  await uploadService.sendHeartbeat({
    agentId: runtime.agentId,
    version: runtime.version,
    queueDepth: queueService.getDepth(),
    mode: 'daemon-start',
  });
}

async function main(): Promise<void> {
  const mode = process.argv[2] ?? 'scan';

  if (mode === 'scan') {
    await scanAndUploadNow();
    return;
  }

  if (mode === 'flush-queue') {
    await processQueue();
    return;
  }

  if (mode === 'daemon') {
    await runDaemon();
    return;
  }

  logError(`Unknown mode: ${mode}. Use 'scan', 'flush-queue' or 'daemon'.`);
  process.exitCode = 1;
}

void main();
