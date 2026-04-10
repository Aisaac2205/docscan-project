import type ms from 'ms';

const isDev = (process.env.NODE_ENV || 'development') === 'development';

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
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
  throttle: {
    default: { ttl: 60_000, limit: isDev ? 300 : 100 },
    ai: { ttl: 60_000, limit: isDev ? 30 : 10 },
  },
};
