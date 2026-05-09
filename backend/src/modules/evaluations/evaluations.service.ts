import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { PersonsService } from '../persons/persons.service';
import { OcrProviderRegistry } from '../ocr/providers/ocr-provider.registry';
import type { ProviderId } from '../ocr/providers/ocr-provider.interface';
import { buildEvaluationPrompt, extractScore } from './prompt.builder';
import { CreateEvaluationDto } from './dto/create-evaluation.dto';

export interface EvaluationOutput {
  id: string;
  personId: string;
  provider: string;
  model: string | null;
  prompt: string;
  result: string;
  score: number | null;
  createdAt: string;
}

@Injectable()
export class EvaluationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly personsService: PersonsService,
    private readonly providers: OcrProviderRegistry,
  ) {}

  async list(userId: string, personId: string): Promise<EvaluationOutput[]> {
    // Validates ownership via personsService
    await this.personsService.getById(userId, personId);

    const records = await this.prisma.personEvaluation.findMany({
      where: { personId },
      orderBy: { createdAt: 'desc' },
    });

    return records.map((r) => ({
      id: r.id,
      personId: r.personId,
      provider: r.provider,
      model: r.model,
      prompt: r.prompt,
      result: r.result,
      score: r.score,
      createdAt: r.createdAt.toISOString(),
    }));
  }

  async create(
    userId: string,
    personId: string,
    dto: CreateEvaluationDto,
  ): Promise<EvaluationOutput> {
    const { person, profile } = await this.personsService.getProfile(userId, personId);

    const { systemInstruction, userPrompt } = buildEvaluationPrompt(
      profile,
      {
        fullName: person.fullName,
        cui: person.cui,
        role: person.role,
        status: person.status,
      },
      dto.customPrompt,
    );

    const provider = this.providers.get(dto.provider as ProviderId);
    const result = await provider.generateContent({
      systemInstruction,
      userPrompt,
      model: dto.model,
      jsonMode: false,
    });

    const score = extractScore(result);

    const saved = await this.prisma.personEvaluation.create({
      data: {
        personId,
        provider: dto.provider,
        model: dto.model ?? null,
        prompt: userPrompt,
        result,
        score,
      },
    });

    return {
      id: saved.id,
      personId: saved.personId,
      provider: saved.provider,
      model: saved.model,
      prompt: saved.prompt,
      result: saved.result,
      score: saved.score,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async remove(userId: string, personId: string, evaluationId: string): Promise<void> {
    await this.personsService.getById(userId, personId);
    await this.prisma.personEvaluation.deleteMany({
      where: { id: evaluationId, personId },
    });
  }
}
