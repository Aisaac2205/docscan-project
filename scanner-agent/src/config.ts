import * as path from 'path';
import { config as loadEnv } from 'dotenv';
import { AgentConfig, EXTRACTION_MODES, ExtractionMode } from './types';

loadEnv();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function parseExtractionMode(value: string): ExtractionMode {
  if ((EXTRACTION_MODES as readonly string[]).includes(value)) {
    return value as ExtractionMode;
  }

  throw new Error(
    `Invalid EXTRACTION_MODE '${value}'. Allowed values: ${EXTRACTION_MODES.join(', ')}`,
  );
}

export function buildTempPdfPath(scanTempDir: string): string {
  const fileName = `temp_doc_${Date.now()}.pdf`;
  return path.join(scanTempDir, fileName);
}

export function loadConfig(): AgentConfig {
  const extractionModeRaw = process.env.EXTRACTION_MODE?.trim() || 'general';
  const queueRetryBaseMsRaw = process.env.QUEUE_RETRY_BASE_MS?.trim();
  const parsedRetryBase = queueRetryBaseMsRaw ? Number(queueRetryBaseMsRaw) : 15000;

  if (!Number.isFinite(parsedRetryBase) || parsedRetryBase < 1000) {
    throw new Error('QUEUE_RETRY_BASE_MS must be a number >= 1000');
  }

  const scanTempDir = getRequiredEnv('SCAN_TEMP_DIR');

  return {
    naps2Path: getRequiredEnv('NAPS2_PATH'),
    scanTempDir,
    backendBaseUrl: getRequiredEnv('BACKEND_BASE_URL').replace(/\/$/, ''),
    scannerAgentKey: getRequiredEnv('SCANNER_AGENT_KEY'),
    extractionMode: parseExtractionMode(extractionModeRaw),
    targetUserId: getRequiredEnv('TARGET_USER_ID'),
    naps2Arguments: process.env.NAPS2_ARGUMENTS?.trim() || undefined,
    queueFilePath: process.env.QUEUE_FILE_PATH?.trim() || path.join(scanTempDir, 'upload-queue.json'),
    queueRetryBaseMs: parsedRetryBase,
  };
}

export function buildRuntimeInfo(): { agentId: string; version: string } {
  const agentId = process.env.SCANNER_AGENT_ID?.trim() || 'scanner-agent-local';
  const version = process.env.SCANNER_AGENT_VERSION?.trim() || '1.0.0';
  return { agentId, version };
}
