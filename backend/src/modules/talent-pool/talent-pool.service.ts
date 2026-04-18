import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { OcrProviderRegistry } from '../ocr/providers/ocr-provider.registry';
import {
  TalentPoolCandidateRawScore,
  TalentPoolLabel,
  TalentPoolPriority,
  TalentPoolRankDto,
  TalentPoolRankResultDto,
  TalentPoolRankedCandidateDto,
  TalentPoolTone,
} from './dto/talent-pool.dto';
import { TalentPoolRankResponseSchema } from './schemas/talent-pool.schemas';

@Injectable()
export class TalentPoolService {
  constructor(private readonly registry: OcrProviderRegistry) {}

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

  async rank(dto: TalentPoolRankDto): Promise<TalentPoolRankResultDto> {
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

      return {
        puesto: dto.criterios.puesto,
        prioridadProceso: dto.criterios.prioridadProceso,
        tonoInforme: dto.criterios.tonoInforme,
        totalCandidatos: ordered.length,
        ranking: ordered,
        resumenGeneral: validation.data.resumen_general?.trim() || `Se evaluaron ${ordered.length} candidatos para ${dto.criterios.puesto}.`,
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
