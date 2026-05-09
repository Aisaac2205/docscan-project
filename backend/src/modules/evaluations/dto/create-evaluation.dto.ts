import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export type EvaluationProvider = 'gemini' | 'lmstudio';

export class CreateEvaluationDto {
  @IsEnum(['gemini', 'lmstudio'])
  provider: EvaluationProvider;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  customPrompt?: string;
}
