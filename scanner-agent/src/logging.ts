export function logInfo(message: string, context?: Record<string, unknown>): void {
  const payload = {
    level: 'info',
    at: new Date().toISOString(),
    message,
    ...(context ? { context } : {}),
  };
  console.log(JSON.stringify(payload));
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  const payload = {
    level: 'warn',
    at: new Date().toISOString(),
    message,
    ...(context ? { context } : {}),
  };
  console.warn(JSON.stringify(payload));
}

export function logError(message: string, context?: Record<string, unknown>): void {
  const payload = {
    level: 'error',
    at: new Date().toISOString(),
    message,
    ...(context ? { context } : {}),
  };
  console.error(JSON.stringify(payload));
}
