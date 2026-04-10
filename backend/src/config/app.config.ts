import type ms from 'ms';

const isDev = (process.env.NODE_ENV || 'development') === 'development';

export const appConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  jwt: {
    secret: process.env.JWT_SECRET || 'default-secret-key',
    expiresIn: (process.env.JWT_EXPIRATION || '24h') as ms.StringValue,
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: 10 * 1024 * 1024,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  throttle: {
    default: { ttl: 60_000, limit: isDev ? 300 : 100 },
    ai: { ttl: 60_000, limit: isDev ? 30 : 10 },
  },
};
