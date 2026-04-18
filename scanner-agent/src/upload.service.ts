import { readFileSync } from 'fs';
import { AgentConfig, ExtractionMode, UploadResult } from './types';

export class UploadService {
  constructor(private readonly config: AgentConfig) {}

  async uploadScannedPdf(pdfPath: string): Promise<UploadResult> {
    return this.uploadScannedPdfAs({
      pdfPath,
      userId: this.config.targetUserId,
      extractionMode: this.config.extractionMode,
    });
  }

  async uploadScannedPdfAs(payload: {
    pdfPath: string;
    userId: string;
    extractionMode: ExtractionMode;
    jobId?: string;
  }): Promise<UploadResult> {
    const form = new FormData();
    const pdfBuffer = readFileSync(payload.pdfPath);
    const fileBlob = new Blob([pdfBuffer], { type: 'application/pdf' });

    form.append('file', fileBlob, this.buildFileName());
    form.append('userId', payload.userId);
    form.append('extractionMode', payload.extractionMode);

    const response = await fetch(`${this.config.backendBaseUrl}/api/ocr/scan`, {
      method: 'POST',
      headers: {
        'x-scanner-agent-key': this.config.scannerAgentKey,
        ...(payload.jobId ? { 'x-job-id': payload.jobId } : {}),
      },
      body: form,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Upload failed (${response.status}): ${body}`);
    }

    return (await response.json()) as UploadResult;
  }

  async notifyFinalFailure(payload: {
    stage: 'scan' | 'upload';
    errorMessage: string;
    attempts: number;
    jobId?: string;
  }): Promise<void> {
    const response = await fetch(`${this.config.backendBaseUrl}/api/ocr/scan/error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-scanner-agent-key': this.config.scannerAgentKey,
      },
      body: JSON.stringify({
        ...payload,
        userId: this.config.targetUserId,
        extractionMode: this.config.extractionMode,
        createdAt: new Date().toISOString(),
        ...(payload.jobId ? { jobId: payload.jobId } : {}),
      }),
    }).catch(() => null);

    if (!response || !response.ok) {
      const status = response ? String(response.status) : 'no-response';
      console.warn(`[notifyFinalFailure] backend notification skipped (${status})`);
    }
  }

  private buildFileName(): string {
    return `scan-${Date.now()}.pdf`;
  }

  async sendHeartbeat(payload: {
    agentId: string;
    version: string;
    queueDepth: number;
    mode: string;
  }): Promise<void> {
    const response = await fetch(`${this.config.backendBaseUrl}/api/ocr/scan/heartbeat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-scanner-agent-key': this.config.scannerAgentKey,
      },
      body: JSON.stringify(payload),
    }).catch(() => null);

    if (!response || !response.ok) {
      const status = response ? String(response.status) : 'no-response';
      console.warn(`[heartbeat] skipped (${status})`);
    }
  }
}
