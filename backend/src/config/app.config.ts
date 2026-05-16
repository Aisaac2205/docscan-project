import type ms from 'ms';

const isDev = (process.env.NODE_ENV || 'development') === 'development';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: 'api',
  scannerBodyLimit: '20mb',
  defaultBodyLimit: '256kb',
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: (process.env.JWT_EXPIRATION || '24h') as ms.StringValue,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000').split(','),
  gemini: {
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  lmstudio: {
    baseUrl: process.env.LMSTUDIO_BASE_URL || 'http://127.0.0.1:1234/v1',
    modelsUrl: process.env.LMSTUDIO_MODELS_URL || 'http://127.0.0.1:1234/v1/models',
    /** Modelo específico a usar. Si está vacío usa el primero disponible. */
    model: process.env.LMSTUDIO_MODEL || '',
  },
  ocr: {
    defaultProvider: process.env.OCR_PROVIDER || 'gemini',
  },
  throttle: {
    default: { ttl: 60_000, limit: isDev ? 300 : 100 },
    ai: { ttl: 60_000, limit: isDev ? 30 : 10 },
  },
  /**
   * Default eSCL scanner. If `name` AND `ip` are both set, the backend will
   * upsert a matching ScannerConfig for every user on each getConfigs() call.
   * Leave empty in production / multi-user setups.
   *
   * `enabled` is the master switch: when false, the env-driven sync is skipped
   * and the frontend stops polling pings. Lets you keep IPs in .env as
   * reference while the physical scanner is unavailable.
   */
  scanner: {
    enabled: process.env.SCANNER_ENABLED !== 'false',
    defaultName: process.env.ESCL_DEFAULT_SCANNER_NAME || '',
    defaultIp: process.env.ESCL_DEFAULT_SCANNER_IP || '',
    defaultPort: process.env.ESCL_DEFAULT_SCANNER_PORT
      ? parseInt(process.env.ESCL_DEFAULT_SCANNER_PORT, 10)
      : null,
    defaultUseTls: process.env.ESCL_DEFAULT_SCANNER_USE_TLS === 'true',
    defaultVerifyTls: process.env.ESCL_DEFAULT_SCANNER_VERIFY_TLS !== 'false',
  },
};
