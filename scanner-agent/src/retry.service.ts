import { RetryConfig } from './types';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetries<T>(
  operation: () => Promise<T>,
  config: RetryConfig,
  operationName: string,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= config.maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const isLast = attempt === config.maxAttempts;
      console.error(`[${operationName}] attempt ${attempt}/${config.maxAttempts} failed`, error);
      if (!isLast) {
        await sleep(config.waitMs);
      }
    }
  }

  throw lastError;
}
