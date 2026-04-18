import { Injectable } from '@nestjs/common';
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

    const response = await this.ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts }],
      config: {
        systemInstruction,
        ...(jsonMode && { responseMimeType: 'application/json' }),
      },
    });

    return response.text ?? '';
  }
}
