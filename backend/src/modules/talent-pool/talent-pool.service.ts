import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/database.config';
import { OcrProviderRegistry } from '../ocr/providers/ocr-provider.registry';
import {
  TalentPoolCandidateRawScore,
  TalentPoolCriteriaDto,
  TalentPoolHistoryItemDto,
  TalentPoolLabel,
  TalentPoolPriority,
  TalentPoolRankDto,
  TalentPoolRankResultDto,
  TalentPoolRankedCandidateDto,
  TalentPoolRunMetaDto,
  TalentPoolTone,
} from './dto/talent-pool.dto';
import { TalentPoolRankResponseSchema } from './schemas/talent-pool.schemas';

const TALENT_POOL_RETENTION_MIN_RECENT = 20;
const TALENT_POOL_RETENTION_TTL_DAYS = 90;

@Injectable()
export class TalentPoolService {
  constructor(
    private readonly registry: OcrProviderRegistry,
    private readonly prisma: PrismaService,
  ) {}

  private parseRunCriterios(snapshot: unknown): TalentPoolCriteriaDto {
    const typed = snapshot as Partial<TalentPoolCriteriaDto>;
    return {
      puesto: typeof typed?.puesto === 'string' ? typed.puesto : '',
      objetivoRol: typeof typed?.objetivoRol === 'string' ? typed.objetivoRol : '',
      imprescindible: Array.isArray(typed?.imprescindible) ? typed.imprescindible.filter((item): item is string => typeof item === 'string') : [],
      deseable: Array.isArray(typed?.deseable) ? typed.deseable.filter((item): item is string => typeof item === 'string') : [],
      experienciaMinima: typeof typed?.experienciaMinima === 'string' ? typed.experienciaMinima : '',
      idiomaRequerido: typeof typed?.idiomaRequerido === 'string' ? typed.idiomaRequerido : '',
      ubicacionModalidad: typeof typed?.ubicacionModalidad === 'string' ? typed.ubicacionModalidad : '',
      noQueremos: Array.isArray(typed?.noQueremos) ? typed.noQueremos.filter((item): item is string => typeof item === 'string') : [],
      prioridadProceso: typed?.prioridadProceso === TalentPoolPriority.RAPIDEZ
      || typed?.prioridadProceso === TalentPoolPriority.CALIDAD
      || typed?.prioridadProceso === TalentPoolPriority.EQUILIBRIO
        ? typed.prioridadProceso
        : TalentPoolPriority.EQUILIBRIO,
      tonoInforme: typed?.tonoInforme === TalentPoolTone.BREVE
      || typed?.tonoInforme === TalentPoolTone.DETALLADO
      || typed?.tonoInforme === TalentPoolTone.ESTANDAR
        ? typed.tonoInforme
        : TalentPoolTone.ESTANDAR,
    };
  }

  private parseRunRanking(snapshot: unknown): TalentPoolRankedCandidateDto[] {
    if (!Array.isArray(snapshot)) return [];

    return snapshot
      .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
      .map((item, index) => {
        const rawScore = typeof item.score === 'number' ? item.score : 0;
        const score = this.normalizeScore(rawScore);
        return {
          nombre: typeof item.nombre === 'string' ? item.nombre.trim() : `Candidato ${index + 1}`,
          score,
          etiqueta: this.labelFromScore(score),
          explicacion: typeof item.explicacion === 'string' ? item.explicacion.trim() : '',
          alertas: Array.isArray(item.alertas)
            ? item.alertas.filter((alerta): alerta is string => typeof alerta === 'string').map((alerta) => alerta.trim()).filter(Boolean)
            : [],
          orden: typeof item.orden === 'number' ? Math.max(1, Math.round(item.orden)) : index + 1,
        };
      })
      .sort((a, b) => a.orden - b.orden)
      .map((item, index) => ({ ...item, orden: index + 1 }));
  }

  private buildRunMeta(run: {
    id: string;
    provider: string;
    model: string | null;
    isPinned: boolean;
    createdAt: Date;
  }): TalentPoolRunMetaDto {
    return {
      id: run.id,
      provider: run.provider,
      model: run.model,
      isPinned: run.isPinned,
      createdAt: run.createdAt.toISOString(),
    };
  }

  private async cleanupOldRuns(userId: string): Promise<void> {
    const ttlCutoff = new Date(Date.now() - TALENT_POOL_RETENTION_TTL_DAYS * 24 * 60 * 60 * 1000);

    const candidates = await this.prisma.talentPoolRun.findMany({
      where: {
        userId,
        isPinned: false,
        createdAt: { lt: ttlCutoff },
      },
      orderBy: { createdAt: 'desc' },
      select: { id: true },
    });

    if (candidates.length <= TALENT_POOL_RETENTION_MIN_RECENT) {
      return;
    }

    const idsToDelete = candidates.slice(TALENT_POOL_RETENTION_MIN_RECENT).map((row) => row.id);
    if (idsToDelete.length === 0) {
      return;
    }

    await this.prisma.talentPoolRun.deleteMany({
      where: {
        userId,
        isPinned: false,
        id: { in: idsToDelete },
      },
    });
  }

  async history(userId: string, limit = 20): Promise<TalentPoolHistoryItemDto[]> {
    const safeLimit = Math.max(1, Math.min(50, limit));
    const runs = await this.prisma.talentPoolRun.findMany({
      where: { userId },
      orderBy: [
        { isPinned: 'desc' },
        { createdAt: 'desc' },
      ],
      take: safeLimit,
      select: {
        id: true,
        criteriosSnapshot: true,
        rankingSnapshot: true,
        resumenGeneral: true,
        provider: true,
        model: true,
        isPinned: true,
        createdAt: true,
      },
    });

    return runs.map((run) => {
      const criterios = this.parseRunCriterios(run.criteriosSnapshot);
      const ranking = this.parseRunRanking(run.rankingSnapshot);
      return {
        id: run.id,
        puesto: criterios.puesto,
        prioridadProceso: criterios.prioridadProceso,
        tonoInforme: criterios.tonoInforme,
        totalCandidatos: ranking.length,
        rankingTop3: ranking.slice(0, 3),
        resumenGeneral: run.resumenGeneral,
        provider: run.provider,
        model: run.model,
        isPinned: run.isPinned,
        createdAt: run.createdAt.toISOString(),
      };
    });
  }

  async setPinned(userId: string, runId: string, isPinned: boolean): Promise<TalentPoolRunMetaDto> {
    const existing = await this.prisma.talentPoolRun.findUnique({
      where: { id: runId },
      select: { id: true, userId: true },
    });

    if (!existing) {
      throw new NotFoundException('No encontramos esa evaluación en el historial.');
    }

    if (existing.userId !== userId) {
      throw new ForbiddenException('No tenés permisos para modificar esta evaluación.');
    }

    const updated = await this.prisma.talentPoolRun.update({
      where: { id: runId },
      data: { isPinned },
      select: {
        id: true,
        provider: true,
        model: true,
        isPinned: true,
        createdAt: true,
      },
    });

    return this.buildRunMeta(updated);
  }

  private cleanList(items: string[]): string[] {
    return items
      .map((item) => item.trim())
      .filter((item) => item.length > 0)
      .slice(0, 20);
  }

  private clampText(text: string, max = 7000): string {
    return text.trim().slice(0, max);
  }

  private normalizeScore(raw: number): number {
    if (Number.isNaN(raw)) return 0;
    return Math.max(0, Math.min(100, Math.round(raw)));
  }

  private labelFromScore(score: number): TalentPoolLabel {
    if (score >= 85) return TalentPoolLabel.MUY_RECOMENDADO;
    if (score >= 70) return TalentPoolLabel.RECOMENDADO;
    if (score >= 50) return TalentPoolLabel.REVISAR;
    return TalentPoolLabel.NO_RECOMENDADO;
  }

  private fallbackExplanation(
    nombre: string,
    label: TalentPoolLabel,
    score: number,
    tono: TalentPoolTone,
  ): string {
    const base = `${nombre} obtuvo ${score}/100 y quedó como ${label.toLowerCase()}.`;
    if (tono === TalentPoolTone.BREVE) return base;
    if (tono === TalentPoolTone.DETALLADO) {
      return `${base} En esta versión conviene revisar su encaje con requisitos imprescindibles, claridad del CV y señales de ajuste al objetivo del rol.`;
    }
    return `${base} Recomendación: usar esta señal para priorizar entrevistas.`;
  }

  private stripMarkdownFences(text: string): string {
    const trimmed = text.trim();
    if (trimmed.startsWith('```')) {
      return trimmed
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
    }
    return trimmed;
  }

  private extractFirstJsonObject(text: string): string | null {
    const src = text.trim();
    const start = src.indexOf('{');
    if (start < 0) return null;

    let inString = false;
    let escaped = false;
    let depth = 0;

    for (let i = start; i < src.length; i += 1) {
      const ch = src[i];

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
      if (ch === '}') {
        depth -= 1;
        if (depth === 0) return src.slice(start, i + 1);
      }
    }

    return null;
  }

  private parseProviderJson(jsonText: string): Record<string, unknown> {
    const direct = this.stripMarkdownFences(jsonText);
    try {
      return JSON.parse(direct) as Record<string, unknown>;
    } catch {
      const extracted = this.extractFirstJsonObject(direct);
      if (extracted) {
        try {
          return JSON.parse(extracted) as Record<string, unknown>;
        } catch {
          // sigue abajo para error final más claro
        }
      }

      const preview = direct.slice(0, 300);
      const likelyTruncated = extracted === null;
      throw new InternalServerErrorException(
        likelyTruncated
          ? `La IA devolvió un JSON incompleto o truncado. Reintenta la evaluación. Preview: ${preview}`
          : `La IA devolvió JSON malformado. Reintenta la evaluación. Preview: ${preview}`,
      );
    }
  }

  private buildTalentPoolSystemInstruction(): string {
    return (
      'Sos un evaluador de candidatos para RRHH. ' +
      'Respondé ÚNICAMENTE JSON válido, sin markdown ni texto extra. ' +
      'No inventes experiencia ni estudios que no estén en el texto de cada candidato. ' +
      'Evaluá usando los criterios dados y devolvé un score entre 0 y 100 por candidato. ' +
      'Si hay dudas o faltantes, agregá alertas claras.'
    );
  }

  private buildTalentPoolPrompt(payload: TalentPoolRankDto): string {
    const criterios = {
      ...payload.criterios,
      imprescindible: this.cleanList(payload.criterios.imprescindible),
      deseable: this.cleanList(payload.criterios.deseable),
      noQueremos: this.cleanList(payload.criterios.noQueremos),
    };

    const candidatos = payload.candidatos.map((candidato) => ({
      nombre: candidato.nombre.trim(),
      resumenCv: this.clampText(candidato.resumenCv, 7000),
    }));

    return [
      'Evaluá estos candidatos para un proceso de selección de talento.',
      'Priorización del proceso: rapidez | equilibrio | calidad (ya viene definida en criterios.prioridadProceso).',
      'Tono del informe: breve | estandar | detallado (ya viene definido en criterios.tonoInforme).',
      'Devolvé EXACTAMENTE este JSON:',
      '{',
      '  "candidatos": [',
      '    {',
      '      "nombre": "string",',
      '      "score": 0,',
      '      "explicacion": "string",',
      '      "alertas": ["string"]',
      '    }',
      '  ],',
      '  "resumen_general": "string"',
      '}',
      'Reglas:',
      '- score en rango 0-100',
      '- explicacion clara para RRHH en español',
      '- alertas opcionales, cortas y accionables',
      '- incluir todos los candidatos recibidos',
      '',
      `criterios=${JSON.stringify(criterios)}`,
      `candidatos=${JSON.stringify(candidatos)}`,
    ].join('\n');
  }

  private validateTalentPoolLimits(dto: TalentPoolRankDto): void {
    if (dto.candidatos.length > 25) {
      throw new BadRequestException('Podés evaluar hasta 25 candidatos por solicitud.');
    }

    const tooLarge = dto.candidatos.find((c) => c.resumenCv.trim().length > 7000);
    if (tooLarge) {
      throw new BadRequestException(`El resumen/CV de "${tooLarge.nombre}" supera el máximo de 7000 caracteres.`);
    }

    const emptyCandidate = dto.candidatos.find((c) => !c.nombre.trim() || !c.resumenCv.trim());
    if (emptyCandidate) {
      throw new BadRequestException('Todos los candidatos deben tener nombre y resumen/CV.');
    }
  }

  private sortByPriority(candidates: TalentPoolRankedCandidateDto[], priority: TalentPoolPriority): TalentPoolRankedCandidateDto[] {
    const sorted = [...candidates];
    switch (priority) {
      case TalentPoolPriority.RAPIDEZ:
        return sorted.sort((a, b) => b.score - a.score || a.alertas.length - b.alertas.length);
      case TalentPoolPriority.CALIDAD:
        return sorted.sort((a, b) => b.score - a.score || b.explicacion.length - a.explicacion.length);
      case TalentPoolPriority.EQUILIBRIO:
      default:
        return sorted.sort((a, b) => b.score - a.score);
    }
  }

  async rank(userId: string, dto: TalentPoolRankDto): Promise<TalentPoolRankResultDto> {
    this.validateTalentPoolLimits(dto);

    const provider = this.registry.get(dto.provider);

    try {
      const raw = await provider.generateContent({
        systemInstruction: this.buildTalentPoolSystemInstruction(),
        userPrompt: this.buildTalentPoolPrompt(dto),
        jsonMode: true,
        model: dto.model,
      });

      if (!raw) throw new InternalServerErrorException(`${provider.displayName} no devolvió contenido.`);

      const parsed = this.parseProviderJson(raw);
      const validation = TalentPoolRankResponseSchema.safeParse(parsed);
      if (!validation.success) {
        throw new InternalServerErrorException('La IA devolvió un formato inválido para ranking de candidatos.');
      }

      const byName = new Map<string, TalentPoolCandidateRawScore>();
      for (const item of validation.data.candidatos) {
        byName.set(item.nombre.trim().toLowerCase(), {
          nombre: item.nombre.trim(),
          score: item.score,
          explicacion: item.explicacion.trim(),
          alertas: item.alertas?.map((a) => a.trim()).filter((a) => a.length > 0) ?? [],
        });
      }

      const merged = dto.candidatos.map<TalentPoolRankedCandidateDto>((candidate) => {
        const found = byName.get(candidate.nombre.trim().toLowerCase());
        const score = this.normalizeScore(found?.score ?? 0);
        const etiqueta = this.labelFromScore(score);
        const explicacion = found?.explicacion?.trim()
          ? found.explicacion.trim()
          : this.fallbackExplanation(candidate.nombre.trim(), etiqueta, score, dto.criterios.tonoInforme);

        return {
          nombre: candidate.nombre.trim(),
          score,
          etiqueta,
          explicacion,
          alertas: found?.alertas ?? [],
          orden: 0,
        };
      });

      const ordered = this.sortByPriority(merged, dto.criterios.prioridadProceso).map((item, index) => ({
        ...item,
        orden: index + 1,
      }));

      const result: Omit<TalentPoolRankResultDto, 'run'> = {
        puesto: dto.criterios.puesto,
        prioridadProceso: dto.criterios.prioridadProceso,
        tonoInforme: dto.criterios.tonoInforme,
        totalCandidatos: ordered.length,
        ranking: ordered,
        resumenGeneral: validation.data.resumen_general?.trim() || `Se evaluaron ${ordered.length} candidatos para ${dto.criterios.puesto}.`,
      };

      const savedRun = await this.prisma.talentPoolRun.create({
        data: {
          userId,
          provider: provider.id,
          model: dto.model?.trim() || null,
          criteriosSnapshot: dto.criterios as unknown as Prisma.InputJsonValue,
          candidatosSnapshot: dto.candidatos as unknown as Prisma.InputJsonValue,
          rankingSnapshot: result.ranking as unknown as Prisma.InputJsonValue,
          resumenGeneral: result.resumenGeneral,
        },
        select: {
          id: true,
          provider: true,
          model: true,
          isPinned: true,
          createdAt: true,
        },
      });

      await this.cleanupOldRuns(userId);

      return {
        ...result,
        run: this.buildRunMeta(savedRun),
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
        throw error;
      }
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      throw new InternalServerErrorException(`No se pudo completar la evaluación de candidatos: ${msg}`);
    }
  }
}
