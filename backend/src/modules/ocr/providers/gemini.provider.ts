import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { appConfig } from '../../../config';
import type { OcrProvider, GenerateOptions, ModelInfo, ProviderId } from './ocr-provider.interface';

@Injectable()
export class GeminiProvider implements OcrProvider {
  readonly id: ProviderId = 'gemini';
  readonly displayName = 'Google Gemini (Nube)';

  private readonly ai: GoogleGenAI;
  private readonly defaultModel: string;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    this.defaultModel = appConfig.gemini.model;
  }

  async isAvailable(): Promise<boolean> {
    return !!process.env.GEMINI_API_KEY;
  }

  async listModels(): Promise<ModelInfo[]> {
    return [{ id: this.defaultModel, name: this.defaultModel }];
  }

  async generateContent(opts: GenerateOptions): Promise<string> {
    const { systemInstruction, userPrompt, imageBase64, mimeType, jsonMode, model: modelOverride } = opts;
    const model = modelOverride || this.defaultModel;

    const parts: { text?: string; inlineData?: { data: string; mimeType: string } }[] = [
      { text: userPrompt },
    ];
    if (imageBase64 && mimeType) {
      parts.push({ inlineData: { data: imageBase64, mimeType } });
    }

    const MAX_RETRIES = 3;
    const BASE_DELAY_MS = 1000;

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await this.ai.models.generateContent({
          model,
          contents: [{ role: 'user', parts }],
          config: {
            systemInstruction,
            ...(jsonMode && { responseMimeType: 'application/json' }),
          },
        });
        return response.text ?? '';
      } catch (error: unknown) {
        const status = (error as { status?: number })?.status;
        const isRetryable = status === 429 || status === 503;
        const isLastAttempt = attempt === MAX_RETRIES;

        if (!isRetryable || isLastAttempt) {
          throw error;
        }

        // Exponential backoff with jitter: delay = base * 2^attempt + random(0-500ms)
        const delay = BASE_DELAY_MS * Math.pow(2, attempt) + Math.random() * 500;
        console.warn(`[Gemini] ${status} error, reintentando en ${Math.round(delay)}ms (intento ${attempt + 1}/${MAX_RETRIES})`);
        await new Promise((r) => setTimeout(r, delay));
      }
    }

    throw new InternalServerErrorException('Gemini: agotados todos los reintentos');
  }
}
