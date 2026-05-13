import 'dotenv/config';
import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().disable('etag');

  // CORS must be registered before body-parsing middleware so that
  // preflight OPTIONS requests and oversized-body errors still get
  // the Access-Control-Allow-Origin header.
  app.enableCors({
    origin: appConfig.corsOrigins,
    credentials: true,
  });

  app.setGlobalPrefix(appConfig.apiPrefix);

  // Scanner capture sends base64 images; the larger limit covers the
  // worst case. Order matters: the route-specific parser must be
  // registered BEFORE the global one so Express matches it first.
  app.use(
    `/${appConfig.apiPrefix}/scanner`,
    express.json({ limit: appConfig.scannerBodyLimit }),
  );

  // Tighter limit for every other route as defense in depth.
  app.use(express.json({ limit: appConfig.defaultBodyLimit }));
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(appConfig.port);
  Logger.log(`Backend ejecutándose en http://localhost:${appConfig.port}`, 'Bootstrap');
}
bootstrap();
