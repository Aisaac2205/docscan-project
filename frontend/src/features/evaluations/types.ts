export type EvaluationProvider = 'gemini' | 'lmstudio';

export interface Evaluation {
  id: string;
  personId: string;
  provider: string;
  model: string | null;
  prompt: string;
  result: string;
  score: number | null;
  createdAt: string;
}

export interface CreateEvaluationInput {
  provider: EvaluationProvider;
  model?: string;
  customPrompt?: string;
}
