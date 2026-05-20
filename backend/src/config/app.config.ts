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
  scanner: {
    enabled: process.env.SCANNER_ENABLED !== 'false',
    /**
     * mDNS auto-discovery for eSCL scanners on `_uscan._tcp` / `_uscans._tcp`.
     * Off by default: opt-in per deployment because it opens a UDP/5353 listener
     * (firewall prompt on Windows) and is meaningless in cloud setups where the
     * backend is not on the same LAN as the printers.
     */
    discoveryEnabled: process.env.SCANNER_DISCOVERY_ENABLED === 'true',
    /**
     * Force the mDNS browser to bind to a specific local interface (IPv4).
     * Use when multi-NIC (VPN active, Docker bridge, WSL) makes the browser
     * pick the wrong interface and silently see no devices. Leave empty to
     * listen on all interfaces.
     */
    mdnsInterface: process.env.MDNS_INTERFACE || '',
  },
};
