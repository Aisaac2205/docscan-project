import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { AgentConfig, QueuedUpload } from './types';

interface QueueFileContent {
  items: QueuedUpload[];
}

export class QueueService {
  private readonly queueFilePath: string;

  constructor(private readonly config: AgentConfig) {
    this.queueFilePath = config.queueFilePath;
    this.ensureQueueFile();
  }

  enqueue(item: Omit<QueuedUpload, 'id' | 'createdAt' | 'attempts' | 'lastError' | 'nextRetryAt'>): QueuedUpload {
    const queue = this.readQueue();
    const nowIso = new Date().toISOString();
    const queued: QueuedUpload = {
      id: `q_${Date.now()}_${Math.round(Math.random() * 1_000_000)}`,
      jobId: item.jobId,
      pdfPath: item.pdfPath,
      userId: item.userId,
      extractionMode: item.extractionMode,
      attempts: 0,
      createdAt: nowIso,
      lastError: '',
      nextRetryAt: nowIso,
    };

    queue.items.push(queued);
    this.writeQueue(queue);
    return queued;
  }

  listPending(now: Date): QueuedUpload[] {
    const queue = this.readQueue();
    return queue.items.filter((item) => new Date(item.nextRetryAt).getTime() <= now.getTime());
  }

  getDepth(): number {
    return this.readQueue().items.length;
  }

  markSuccess(id: string): void {
    const queue = this.readQueue();
    const index = queue.items.findIndex((item) => item.id === id);
    if (index < 0) return;

    const [item] = queue.items.splice(index, 1);
    this.writeQueue(queue);

    if (item && existsSync(item.pdfPath)) {
      unlinkSync(item.pdfPath);
      console.log(`[queue] Deleted uploaded queued file: ${item.pdfPath}`);
    }
  }

  markFailure(id: string, errorMessage: string): void {
    const queue = this.readQueue();
    const item = queue.items.find((entry) => entry.id === id);
    if (!item) return;

    item.attempts += 1;
    item.lastError = errorMessage.slice(0, 2000);
    item.nextRetryAt = new Date(Date.now() + this.getBackoffMs(item.attempts)).toISOString();
    this.writeQueue(queue);
  }

  removeIfMissingFile(id: string): void {
    const queue = this.readQueue();
    const index = queue.items.findIndex((entry) => entry.id === id);
    if (index < 0) return;

    const item = queue.items[index];
    if (!item || existsSync(item.pdfPath)) return;

    queue.items.splice(index, 1);
    this.writeQueue(queue);
    console.warn(`[queue] Removed stale queued item ${id} because file was missing`);
  }

  private getBackoffMs(attempts: number): number {
    const growthFactor = Math.max(1, attempts);
    const cappedAttempts = Math.min(growthFactor, 6);
    return this.config.queueRetryBaseMs * cappedAttempts;
  }

  private ensureQueueFile(): void {
    mkdirSync(dirname(this.queueFilePath), { recursive: true });
    if (!existsSync(this.queueFilePath)) {
      this.writeQueue({ items: [] });
    }
  }

  private readQueue(): QueueFileContent {
    try {
      const raw = readFileSync(this.queueFilePath, 'utf-8');
      const parsed = JSON.parse(raw) as Partial<QueueFileContent>;
      if (!Array.isArray(parsed.items)) {
        return { items: [] };
      }
      return { items: parsed.items };
    } catch (error) {
      console.error('[queue] Could not read queue file, resetting queue', error);
      return { items: [] };
    }
  }

  private writeQueue(content: QueueFileContent): void {
    writeFileSync(this.queueFilePath, JSON.stringify(content, null, 2), 'utf-8');
  }
}
