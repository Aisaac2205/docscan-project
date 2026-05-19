import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { Prisma } from '@prisma/client';
import { PersonsRepository } from '../persons/persons.repository';
import { DIACRITICS_REGEX } from '../../common/types/diacritics';
import type { HealthStatus, UpdateHealthRecordDto } from './dto/update-health-status.dto';

export interface PersonSuggestion {
  id: string;
  fullName: string;
  cui: string | null;
  /** Score 0-100. 100 = match exacto normalizado. */
  score: number;
  /** Texto OCR que se comparó (para mostrar "OCR: Juan Perez" al lado del nombre del sistema). */
  ocrMatchedText: string | null;
}

export interface HealthRecord {
  id: string;
  originalName: string;
  filePath: string;
  status: string;
  createdAt: string;
  personId: string | null;
  personName: string | null;
  healthStatus: HealthStatus;
  registeredInPayroll: boolean;
  notes: string | null;
  /** Timestamp de la última transición a validated|registered. Null si nunca se validó. */
  validatedAt: string | null;
  // Campos extraídos del OCR (medical_cert schema)
  nombre_paciente: string | null;
  nombre_medico: string | null;
  numero_colegiado: string | null;
  diagnostico: string | null;
  fecha_emision: string | null;
  fecha_inicio_reposo: string | null;
  fecha_fin_reposo: string | null;
  dias_reposo: number | null;
  tiene_sello: boolean | null;
  tiene_firma: boolean | null;
  institucion_emisora: string | null;
}

@Injectable()
export class AbsencesService {
  constructor(
    private prisma: PrismaService,
    private personsRepository: PersonsRepository,
  ) {}

  /**
   * Sugerencias de empleados para vincular a una constancia sin personId.
   * Top 3 por similitud Levenshtein normalizada contra `nombre_paciente` del OCR.
   * Solo se exponen scores >= 40 para no sugerir ruido.
   */
  async getPersonSuggestions(id: string, userId: string): Promise<PersonSuggestion[]> {
    const doc = await this.prisma.document.findFirst({ where: { id, userId } });
    if (!doc) throw new NotFoundException('Registro no encontrado');
    if (doc.documentType !== 'medical_cert') {
      throw new ForbiddenException('El documento no es una constancia médica');
    }

    const data =
      doc.extractedData && typeof doc.extractedData === 'object'
        ? (doc.extractedData as Record<string, unknown>)
        : {};
    const ocrName = typeof data.nombre_paciente === 'string' ? data.nombre_paciente : null;
    if (!ocrName || !ocrName.trim()) return [];

    const persons = await this.personsRepository.findByUserId(userId);
    if (persons.length === 0) return [];

    const normalized = normalizeName(ocrName);
    const scored = persons
      .map((p) => ({
        person: p,
        score: similarityScore(normalized, normalizeName(p.fullName)),
      }))
      .filter((s) => s.score >= 40)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return scored.map(({ person, score }) => ({
      id: person.id,
      fullName: person.fullName,
      cui: person.cui,
      score,
      ocrMatchedText: ocrName,
    }));
  }

  async getHealthRecords(
    userId: string,
    filters?: { personId?: string; status?: HealthStatus | string },
  ): Promise<HealthRecord[]> {
    const where: Prisma.DocumentWhereInput = { userId, documentType: 'medical_cert' };
    if (filters?.personId) where.personId = filters.personId;

    const docs = await this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { person: { select: { id: true, fullName: true } } },
    });

    let records = docs.map((doc) => this.toHealthRecord(doc));
    if (filters?.status) records = records.filter((r) => r.healthStatus === filters.status);
    return records;
  }

  async updateHealthStatus(
    id: string,
    userId: string,
    status: HealthStatus,
    notes?: string,
  ): Promise<HealthRecord> {
    const doc = await this.prisma.document.findFirst({
      where: { id, userId },
    });

    if (!doc) throw new NotFoundException('Registro no encontrado');
    if (doc.documentType !== 'medical_cert') {
      throw new ForbiddenException('El documento no es una constancia médica');
    }

    // Enforcement: una constancia sin empleado asignado no puede avanzar el
    // workflow más allá de pending|rejected. Si OCR no matcheó persona, RRHH
    // debe asignarla manualmente antes de validar. Evita data corrupta entrando
    // al sistema ("no subir constancias a ciegas").
    if ((status === 'validated' || status === 'registered') && doc.personId === null) {
      throw new BadRequestException(
        'Asigná un empleado antes de validar o registrar la constancia.',
      );
    }

    const currentData =
      doc.extractedData && typeof doc.extractedData === 'object'
        ? (doc.extractedData as Record<string, unknown>)
        : {};

    const updatedData: Prisma.InputJsonValue = {
      ...currentData,
      _health: {
        status,
        registeredInPayroll: status === 'registered',
        notes: notes ?? null,
        updatedAt: new Date().toISOString(),
      },
    };

    const updated = await this.prisma.document.update({
      where: { id },
      data: { extractedData: updatedData },
      include: { person: { select: { id: true, fullName: true } } },
    });

    return this.toHealthRecord(updated);
  }

  async patchHealthRecord(
    id: string,
    userId: string,
    patch: UpdateHealthRecordDto,
  ): Promise<HealthRecord> {
    const doc = await this.prisma.document.findFirst({ where: { id, userId } });
    if (!doc) throw new NotFoundException('Registro no encontrado');
    if (doc.documentType !== 'medical_cert') {
      throw new ForbiddenException('El documento no es una constancia médica');
    }

    const currentData =
      doc.extractedData && typeof doc.extractedData === 'object'
        ? (doc.extractedData as Record<string, unknown>)
        : {};
    const currentHealth =
      currentData._health && typeof currentData._health === 'object'
        ? (currentData._health as Record<string, unknown>)
        : {};

    // Sólo escribimos las keys que vinieron en el body (excluyendo notes que
    // va al blob _health). Los campos OCR top-level se sobreescriben.
    const { notes, ...ocrPatch } = patch;
    const nextData: Record<string, unknown> = { ...currentData };
    for (const [key, value] of Object.entries(ocrPatch)) {
      if (value !== undefined) nextData[key] = value;
    }

    if (notes !== undefined) {
      nextData._health = {
        ...currentHealth,
        notes: notes ?? null,
        updatedAt: new Date().toISOString(),
      };
    }

    const updated = await this.prisma.document.update({
      where: { id },
      data: { extractedData: nextData as Prisma.InputJsonValue },
      include: { person: { select: { id: true, fullName: true } } },
    });

    return this.toHealthRecord(updated);
  }

  private toHealthRecord(doc: {
    id: string;
    originalName: string;
    filePath: string;
    status: string;
    createdAt: Date;
    extractedData: Prisma.JsonValue | null;
    person?: { id: string; fullName: string } | null;
  }): HealthRecord {
    const data =
      doc.extractedData && typeof doc.extractedData === 'object'
        ? (doc.extractedData as Record<string, unknown>)
        : {};

    const health = (data._health ?? {}) as Record<string, unknown>;
    const healthStatus = (health.status as HealthStatus) ?? 'pending';
    const healthUpdatedAt =
      typeof health.updatedAt === 'string' ? (health.updatedAt as string) : null;
    const validatedAt =
      healthStatus === 'validated' || healthStatus === 'registered'
        ? healthUpdatedAt
        : null;

    return {
      id: doc.id,
      originalName: doc.originalName,
      filePath: doc.filePath,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      personId: doc.person?.id ?? null,
      personName: doc.person?.fullName ?? null,
      healthStatus,
      registeredInPayroll: (health.registeredInPayroll as boolean) ?? false,
      notes: (health.notes as string) ?? null,
      validatedAt,
      nombre_paciente: (data.nombre_paciente as string) ?? null,
      nombre_medico: (data.nombre_medico as string) ?? null,
      numero_colegiado: (data.numero_colegiado as string) ?? null,
      diagnostico: (data.diagnostico as string) ?? null,
      fecha_emision: (data.fecha_emision as string) ?? null,
      fecha_inicio_reposo: (data.fecha_inicio_reposo as string) ?? null,
      fecha_fin_reposo: (data.fecha_fin_reposo as string) ?? null,
      dias_reposo: (data.dias_reposo as number) ?? null,
      tiene_sello: (data.tiene_sello as boolean) ?? null,
      tiene_firma: (data.tiene_firma as boolean) ?? null,
      institucion_emisora: (data.institucion_emisora as string) ?? null,
    };
  }
}

/** Normaliza nombre para comparar: lowercase, sin tildes, sin múltiples espacios. */
function normalizeName(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(DIACRITICS_REGEX, '')
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Levenshtein clásico — iterativo, O(m*n) en tiempo, O(min(m,n)) en memoria. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  if (a.length < b.length) [a, b] = [b, a];

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length];
}

/**
 * Score 0-100 = 100 * (1 - distance / max-length).
 * Bonus: si todos los tokens del OCR aparecen en el nombre del sistema (orden
 * libre), elevamos al menos a 70. Esto cubre "Juan Pérez" vs "Pérez Juan Carlos".
 */
function similarityScore(ocr: string, candidate: string): number {
  if (!ocr || !candidate) return 0;
  const maxLen = Math.max(ocr.length, candidate.length);
  const base = Math.round(100 * (1 - levenshtein(ocr, candidate) / maxLen));

  const ocrTokens = ocr.split(' ').filter((t) => t.length > 1);
  const candidateTokens = new Set(candidate.split(' ').filter((t) => t.length > 1));
  const allTokensFound =
    ocrTokens.length > 0 && ocrTokens.every((t) => candidateTokens.has(t));

  return allTokensFound ? Math.max(base, 70) : base;
}
