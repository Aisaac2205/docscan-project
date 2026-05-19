import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../config/database.config';
import { Prisma } from '@prisma/client';
import type {
  ListSortField,
  ListSortOrder,
} from '../dto/list-documents-query.dto';

export interface ExtractedData {
  proveedor?: string;
  fecha?: string;
  total?: number;
  nit?: string;
  [key: string]: unknown;
}

export interface ListDocumentsFilters {
  personId?: string;
  unassigned?: boolean;
  type?: string;
  status?: string;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  confidenceMax?: number;
  confidenceMin?: number;
}

export interface PaginatedListOptions extends ListDocumentsFilters {
  page: number;
  limit: number;
  sort: ListSortField;
  order: ListSortOrder;
}

@Injectable()
export class DocumentsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: {
    userId: string;
    originalName: string;
    mimeType: string;
    filePath: string;
    documentType?: string;
    personId?: string | null;
  }) {
    return this.prisma.document.create({
      data,
    });
  }

  async findById(id: string) {
    return this.prisma.document.findUnique({
      where: { id },
    });
  }

  async findByUserId(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listado legacy sin paginación. Se mantiene para callers internos
   * (ej: DashboardService) que necesitan el set completo del usuario sin
   * la sobrecarga de page/limit.
   */
  async findByUserIdFiltered(
    userId: string,
    filters: { personId?: string; unassigned?: boolean; type?: string; status?: string },
  ) {
    const where: Prisma.DocumentWhereInput = { userId };
    if (filters.unassigned) where.personId = null;
    else if (filters.personId) where.personId = filters.personId;
    if (filters.type) where.documentType = filters.type;
    if (filters.status) where.status = filters.status;
    return this.prisma.document.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Listado paginado con filtros completos. Devuelve también el total
   * para que el controller pueda armar la metadata sin un segundo query
   * desde afuera.
   */
  async findPaginated(userId: string, options: PaginatedListOptions) {
    const where = this.buildWhere(userId, options);
    const orderBy = this.buildOrderBy(options.sort, options.order);
    const skip = (options.page - 1) * options.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.document.findMany({
        where,
        orderBy,
        skip,
        take: options.limit,
        include: {
          person: { select: { id: true, fullName: true } },
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { data, total };
  }

  /**
   * Devuelve un slice mínimo de documentos en una ventana de fechas para
   * los cálculos de stats. Solo los campos necesarios para agregar.
   */
  async findStatsSlice(userId: string, dateFrom: Date, dateTo: Date) {
    return this.prisma.document.findMany({
      where: {
        userId,
        createdAt: { gte: dateFrom, lte: dateTo },
      },
      select: {
        createdAt: true,
        status: true,
        confidence: true,
      },
    });
  }

  async findByUserIdAndType(userId: string, documentType: string) {
    return this.prisma.document.findMany({
      where: { userId, documentType },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: {
    rawText?: string;
    confidence?: number;
    status?: string;
    originalName?: string;
    extractedData?: Prisma.InputJsonValue;
    documentType?: string;
    filePath?: string;
    personId?: string | null;
    processedAt?: Date | null;
    processingDurationMs?: number | null;
    validatedAt?: Date | null;
    validatedBy?: string | null;
  }) {
    return this.prisma.document.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.document.delete({
      where: { id },
    });
  }

  async findByIdAndUserId(id: string, userId: string) {
    return this.prisma.document.findFirst({
      where: { id, userId },
    });
  }

  // -------------------------------------------------------------------------
  // Internals
  // -------------------------------------------------------------------------

  private buildWhere(
    userId: string,
    filters: ListDocumentsFilters,
  ): Prisma.DocumentWhereInput {
    const where: Prisma.DocumentWhereInput = { userId };

    if (filters.unassigned) where.personId = null;
    else if (filters.personId) where.personId = filters.personId;

    if (filters.type) where.documentType = filters.type;
    if (filters.status) where.status = filters.status;

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {
        ...(filters.dateFrom ? { gte: filters.dateFrom } : {}),
        ...(filters.dateTo ? { lte: filters.dateTo } : {}),
      };
    }

    // Filtros de confianza. Cuando `confidenceMax` está presente, los docs
    // con `confidence = null` también caen dentro (caso "Revisión": no hay
    // medición, asumimos baja confianza).
    if (filters.confidenceMax !== undefined && filters.confidenceMin !== undefined) {
      where.confidence = { gte: filters.confidenceMin, lte: filters.confidenceMax };
    } else if (filters.confidenceMax !== undefined) {
      where.OR = [
        { confidence: { lte: filters.confidenceMax } },
        { confidence: null },
      ];
    } else if (filters.confidenceMin !== undefined) {
      where.confidence = { gte: filters.confidenceMin };
    }

    if (filters.search && filters.search.trim().length > 0) {
      const term = filters.search.trim();
      // ILIKE sobre originalName + cast textual del JSON. Sin índice GIN
      // todavía — si el volumen lo justifica, agregar GIN en migración.
      const searchClause: Prisma.DocumentWhereInput['AND'] = [
        {
          OR: [
            { originalName: { contains: term, mode: 'insensitive' } },
            { rawText: { contains: term, mode: 'insensitive' } },
          ],
        },
      ];
      where.AND = where.AND
        ? Array.isArray(where.AND)
          ? [...where.AND, ...searchClause]
          : [where.AND, ...searchClause]
        : searchClause;
    }

    return where;
  }

  private buildOrderBy(
    sort: ListSortField,
    order: ListSortOrder,
  ): Prisma.DocumentOrderByWithRelationInput {
    return { [sort]: order };
  }
}
