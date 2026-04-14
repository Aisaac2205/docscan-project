import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { GeminiProvider } from './gemini.provider';
import { LMStudioProvider } from './lmstudio.provider';
import type { OcrProvider, ProviderId, ProviderInfo } from './ocr-provider.interface';
import { appConfig } from '../../../config';

@Injectable()
export class OcrProviderRegistry implements OnModuleInit {
  private readonly logger = new Logger(OcrProviderRegistry.name);
  private readonly providers = new Map<ProviderId, OcrProvider>();

  constructor(
    private readonly gemini: GeminiProvider,
    private readonly lmstudio: LMStudioProvider,
  ) {
    this.providers.set('gemini', gemini);
    this.providers.set('lmstudio', lmstudio);
  }

  async onModuleInit() {
    const defaultId = appConfig.ocr.defaultProvider;
    const available = await this.gemini.isAvailable();
    this.logger.log(
      `Default OCR provider: ${defaultId} | Gemini key present: ${available}`,
    );
  }

  /** Devuelve el provider solicitado. Si no existe, cae al default configurado en .env. */
  get(id?: ProviderId): OcrProvider {
    const target = id ?? (appConfig.ocr.defaultProvider as ProviderId);
    const provider = this.providers.get(target);
    if (!provider) {
      throw new Error(`Provider OCR desconocido: ${target}`);
    }
    return provider;
  }

  /** Lista todos los providers con su disponibilidad y modelos en tiempo real. */
  async listAvailable(): Promise<ProviderInfo[]> {
    const results = await Promise.all(
      Array.from(this.providers.values()).map(async (p) => {
        const available = await p.isAvailable();
        const models = available ? await p.listModels() : [];
        return { id: p.id, displayName: p.displayName, available, models };
      }),
    );
    return results;
  }
}
