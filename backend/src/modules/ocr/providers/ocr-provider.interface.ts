export type ProviderId = 'gemini' | 'lmstudio';

export interface ModelInfo {
  id: string;
  name: string;
}

export interface ProviderInfo {
  id: ProviderId;
  displayName: string;
  available: boolean;
  models: ModelInfo[];
}

export interface GenerateOptions {
  systemInstruction: string;
  userPrompt: string;
  imageBase64?: string;
  mimeType?: string;
  /** Request structured JSON output when true */
  jsonMode?: boolean;
  /** Override the model for this specific call */
  model?: string;
}

export interface OcrProvider {
  readonly id: ProviderId;
  readonly displayName: string;
  isAvailable(): Promise<boolean>;
  listModels(): Promise<ModelInfo[]>;
  generateContent(opts: GenerateOptions): Promise<string>;
}
