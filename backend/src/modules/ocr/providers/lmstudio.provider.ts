import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PdfReader } from 'pdfreader';
import { appConfig } from '../../../config';
import type { OcrProvider, GenerateOptions, ModelInfo, ProviderId } from './ocr-provider.interface';

@Injectable()
export class LMStudioProvider implements OcrProvider {
  readonly id: ProviderId = 'lmstudio';
  readonly displayName = 'Procesamiento Local (LM Studio)';

  private readonly logger = new Logger(LMStudioProvider.name);
  private readonly client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      baseURL: appConfig.lmstudio.baseUrl,
      apiKey: 'lm-studio',
    });
  }

  async isAvailable(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(appConfig.lmstudio.modelsUrl, { signal: controller.signal });
      clearTimeout(timeout);
      return res.ok;
    } catch {
      return false;
    }
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const res = await fetch(appConfig.lmstudio.modelsUrl);
      if (!res.ok) return [];
      const json = (await res.json()) as { data?: { id: string }[] };
      return (json.data ?? []).map((m) => ({ id: m.id, name: m.id }));
    } catch (err) {
      this.logger.warn('No se pudo listar modelos de LM Studio:', err);
      return [];
    }
  }

  async generateContent(opts: GenerateOptions): Promise<string> {
    const { systemInstruction, userPrompt, imageBase64, mimeType, jsonMode, model: modelOverride } = opts;

    const model = modelOverride || appConfig.lmstudio.model || (await this.getFirstModel());
    if (!model) throw new Error('LM Studio: no hay modelos disponibles');

    type ContentPart =
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } };

    const userContent: ContentPart[] = [{ type: 'text', text: userPrompt }];

    if (imageBase64 && mimeType) {
      if (mimeType === 'application/pdf') {
        // La API de LM Studio no soporta PDFs directamente — extraer texto y enviarlo como contexto
        const pdfText = await this.extractPdfText(imageBase64);
        if (pdfText) {
          userContent.push({ type: 'text', text: `\n\n--- CONTENIDO DEL DOCUMENTO ---\n${pdfText}\n--- FIN DEL DOCUMENTO ---` });
        }
      } else {
        // Imágenes: formato data URL estándar compatible con OpenAI vision
        userContent.push({
          type: 'image_url',
          image_url: { url: `data:${mimeType};base64,${imageBase64}` },
        });
      }
    }

    const response = await this.client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: userContent },
      ],
      temperature: 0.1,
    });

    const content = response.choices[0]?.message?.content ?? '';
    return jsonMode ? this.extractJson(content) : content;
  }

  private extractJson(raw: string): string {
    const trimmed = raw.trim();
    // Quitar ```json ... ``` o ``` ... ```
    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
    if (fenceMatch) return fenceMatch[1].trim();
    return trimmed;
  }

  private extractPdfText(base64: string): Promise<string> {
    return new Promise((resolve) => {
      const buffer = Buffer.from(base64, 'base64');
      const lines: string[] = [];

      new PdfReader().parseBuffer(buffer, (err, item) => {
        if (err) {
          this.logger.warn('Error al leer PDF:', err);
          resolve('');
        } else if (!item) {
          resolve(lines.join(' ').trim());
        } else if ((item as { text?: string }).text) {
          lines.push((item as { text: string }).text);
        }
      });
    });
  }

  private async getFirstModel(): Promise<string | null> {
    const models = await this.listModels();
    return models[0]?.id ?? null;
  }
}
