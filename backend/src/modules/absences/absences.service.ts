import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';
import { Prisma } from '@prisma/client';
import type { HealthStatus } from './dto/update-health-status.dto';

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
  constructor(private prisma: PrismaService) {}

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

    return {
      id: doc.id,
      originalName: doc.originalName,
      filePath: doc.filePath,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      personId: doc.person?.id ?? null,
      personName: doc.person?.fullName ?? null,
      healthStatus: (health.status as HealthStatus) ?? 'pending',
      registeredInPayroll: (health.registeredInPayroll as boolean) ?? false,
      notes: (health.notes as string) ?? null,
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
