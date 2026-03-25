import 'dotenv/config';
import * as express from 'express';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.getHttpAdapter().getInstance().disable('etag');

  // CORS must be registered before body-parsing middleware so that
  // preflight OPTIONS requests and oversized-body errors still get
  // the Access-Control-Allow-Origin header.
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  });

  // Scanner capture sends base64 images; 20 MB covers the largest cases.
  // Keep a tighter limit for every other route via the default NestJS body parser.
  app.use('/api/scanner', express.json({ limit: '20mb' }));
  app.use(express.json({ limit: '256kb' }));
  
  app.setGlobalPrefix('api');
  
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(appConfig.port);
  console.log(`🚀 Backend ejecutándose en http://localhost:${appConfig.port}`);
}
bootstrap();
