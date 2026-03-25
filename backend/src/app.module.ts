import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AuthModule } from './modules/auth/auth.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { ScannerModule } from './modules/scanner/scanner.module';
import { HealthModule } from './modules/health/health.module';
import { StorageModule } from './modules/storage/storage.module';
import { PrismaModule } from './config/prisma.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { appConfig } from './config/app.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: appConfig.throttle.default.ttl,
        limit: appConfig.throttle.default.limit,
      },
      {
        name: 'ai',
        ttl: appConfig.throttle.ai.ttl,
        limit: appConfig.throttle.ai.limit,
      },
    ]),
    PrismaModule,
    AuthModule,
    DocumentsModule,
    OcrModule,
    ScannerModule,
    HealthModule,
    StorageModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
