import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { PdfReader } from 'pdfreader';
import { appConfig } from '../../../config';
import type { OcrProvider, GenerateOptions, ModelInfo, ProviderId } from './ocr-provider.interface';

// Upper bound on response tokens when jsonMode is on. CVs and fiscal docs
// produce long JSONs; the OpenAI SDK default is conservative and truncates
// mid-object, which surfaces upstream as "JSON inválido / truncado".
const JSON_MODE_MAX_TOKENS = 8192;

// Hard ceiling per request. Small local models with low temperature can loop
// repeating chunks until max_tokens cuts them off — keep them honest with a
// wall-clock timeout so the UI doesn't hang waiting for a corrupted reply.
const REQUEST_TIMEOUT_MS = 90_000;

// Anti-repetition knobs tuned for JSON extraction with small/quantized models.
// - temperature 0.2: low enough for deterministic extraction, high enough to
//   escape the loops that pure-0.1 settings produce on small models.
// - frequency_penalty 0.3: penalizes recently-emitted tokens → kills textual
//   repetition loops.
// - presence_penalty 0.1: light nudge toward new tokens, avoids the model
//   stalling on the same sub-object.
const JSON_MODE_SAMPLING = {
  temperature: 0.2,
  frequency_penalty: 0.3,
  presence_penalty: 0.1,
} as const;

// Fallback sampling when jsonMode is OFF (chat/query flow). Lower temperature
// is fine because the responses are short and conversational.
const TEXT_MODE_SAMPLING = {
  temperature: 0.1,
} as const;

// LM Studio's OpenAI-compatible API only accepts `json_schema` or `text`
// for response_format (NOT the standard `json_object`). We pass a permissive
// schema — "any JSON object, extra fields allowed" — which gives the same
// guarantee as json_object (model is forced to emit a valid object) without
// constraining per-ExtractionMode shape. Per-mode validation already happens
// downstream via zod in OcrService.
// TODO: replace with mode-specific JSON Schemas (zod-to-json-schema) once
// GenerateOptions can carry the ExtractionMode. Strict mode would prevent
// edge cases like the model using the person's name as the root key.
const JSON_MODE_RESPONSE_FORMAT = {
  type: 'json_schema' as const,
  json_schema: {
    name: 'extraction_result',
    strict: false,
    schema: {
      type: 'object',
      additionalProperties: true,
    },
  },
};

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

    // jsonMode parity with Gemini's responseMimeType:
    // - response_format forces the model to emit a valid JSON object instead
    //   of prose, drifting into the system prompt, or wrapping in markdown.
    // - max_tokens prevents mid-object truncation that produces unparseable
    //   payloads downstream.
    // - frequency/presence penalties + temperature 0.2 prevent loop repetition
    //   that surfaces as a runaway generation hitting max_tokens with junk.
    // - AbortController cancels stuck requests at REQUEST_TIMEOUT_MS so the
    //   UI doesn't hang waiting for a corrupted reply.
    const abortController = new AbortController();
    const timeoutHandle = setTimeout(() => abortController.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await this.client.chat.completions.create(
        {
          model,
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: userContent },
          ],
          ...(jsonMode
            ? {
                ...JSON_MODE_SAMPLING,
                response_format: JSON_MODE_RESPONSE_FORMAT,
                max_tokens: JSON_MODE_MAX_TOKENS,
              }
            : TEXT_MODE_SAMPLING),
        },
        { signal: abortController.signal },
      );
    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'AbortError') {
        throw new Error(
          `LM Studio: la generación superó ${REQUEST_TIMEOUT_MS / 1000}s — ` +
          `probablemente el modelo entró en loop. Probá con un modelo más ` +
          `capaz o reducí el tamaño del documento.`,
        );
      }
      throw err;
    } finally {
      clearTimeout(timeoutHandle);
    }

    const content = response.choices[0]?.message?.content ?? '';
    const finishReason = response.choices[0]?.finish_reason;

    if (jsonMode && finishReason === 'length') {
      // Output hit max_tokens before closing — log loudly so debugging is fast.
      this.logger.warn(
        `[LMStudio] Output truncado por max_tokens (modelo=${model}, max=${JSON_MODE_MAX_TOKENS}). ` +
        `El JSON posiblemente esté incompleto. Considerá subir JSON_MODE_MAX_TOKENS o usar un modelo más capaz.`,
      );
    }

    return jsonMode ? this.extractJson(content, model) : content;
  }

  /**
   * Extrae el primer bloque JSON balanceado del texto del modelo.
   *
   * Estrategia, en orden:
   *   1. Strip de fences ```json ... ``` o ``` ... ```
   *   2. Si el resultado ya empieza con `{`, devolverlo tal cual
   *   3. Si no, escanear el texto y devolver el primer objeto balanceado
   *      (ignorando llaves dentro de strings y respetando escapes)
   *
   * El parsing final lo hace `OcrService.parseProviderJson`; acá solo
   * limpiamos el envoltorio prosa/markdown que devuelven algunos modelos
   * incluso con response_format=json_object.
   */
  private extractJson(raw: string, modelId: string): string {
    const trimmed = raw.trim();

    const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
    const withoutFences = fenceMatch ? fenceMatch[1].trim() : trimmed;

    if (withoutFences.startsWith('{')) return withoutFences;

    const balanced = this.extractFirstBalancedObject(withoutFences);
    if (balanced) return balanced;

    // Caer al texto original: el service va a intentar parsear y fallar con
    // un mensaje claro, pero al menos dejamos contexto en el log.
    this.logger.warn(
      `[LMStudio] El output no parece JSON (modelo=${modelId}, len=${raw.length}). ` +
      `Preview: ${raw.slice(0, 600)}`,
    );
    return withoutFences;
  }

  /**
   * Devuelve el primer objeto JSON balanceado dentro de `text`, o `null` si
   * no hay un objeto completo. Respeta strings y escapes para no contar
   * llaves que están dentro de literales.
   */
  private extractFirstBalancedObject(text: string): string | null {
    const start = text.indexOf('{');
    if (start < 0) return null;

    let inString = false;
    let escaped = false;
    let depth = 0;

    for (let i = start; i < text.length; i += 1) {
      const ch = text[i];

      if (escaped) {
        escaped = false;
        continue;
      }
      if (ch === '\\') {
        escaped = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;

      if (ch === '{') depth += 1;
      else if (ch === '}') {
        depth -= 1;
        if (depth === 0) return text.slice(start, i + 1);
      }
    }

    return null;
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
