import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../config/database.config';

export interface DashboardStats {
  activePersons: number;
  unassignedDocuments: number;
  pendingHealthRecords: number;
  totalPersons: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'document_processed' | 'document_pending' | 'person_created' | 'evaluation_generated';
  title: string;
  detail: string;
  occurredAt: string;
  link?: string;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string): Promise<DashboardStats> {
    const [activePersons, unassignedDocuments, pendingHealth, totalPersons, recent] =
      await Promise.all([
        this.prisma.person.count({ where: { userId, status: 'active' } }),
        this.prisma.document.count({ where: { userId, personId: null } }),
        this.prisma.document.count({
          where: {
            userId,
            documentType: 'medical_cert',
            status: 'completed',
          },
        }).then(async (total) => {
          // Subset: those whose _health.status is pending or null
          const docs = await this.prisma.document.findMany({
            where: { userId, documentType: 'medical_cert', status: 'completed' },
            select: { extractedData: true },
          });
          return docs.filter((d) => {
            const data = (d.extractedData ?? {}) as Record<string, unknown>;
            const health = (data._health ?? {}) as Record<string, unknown>;
            const s = health.status;
            return !s || s === 'pending';
          }).length;
        }),
        this.prisma.person.count({ where: { userId } }),
        this.prisma.document.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 6,
          select: {
            id: true,
            originalName: true,
            documentType: true,
            status: true,
            createdAt: true,
            personId: true,
            person: { select: { id: true, fullName: true } },
          },
        }),
      ]);

    return {
      activePersons,
      unassignedDocuments,
      pendingHealthRecords: pendingHealth,
      totalPersons,
      recentActivity: recent.map((doc) => this.toActivity(doc)),
    };
  }

  private toActivity(doc: {
    id: string;
    originalName: string;
    documentType: string;
    status: string;
    createdAt: Date;
    personId: string | null;
    person?: { id: string; fullName: string } | null;
  }): ActivityItem {
    const occurredAt = doc.createdAt.toISOString();
    const link = doc.person ? `/persons/${doc.person.id}` : `/documents/${doc.id}`;
    const personSuffix = doc.person ? ` · ${doc.person.fullName}` : ' · Sin asignar';

    if (doc.status === 'completed') {
      return {
        id: doc.id,
        type: 'document_processed',
        title: doc.originalName,
        detail: `Documento procesado${personSuffix}`,
        occurredAt,
        link,
      };
    }
    return {
      id: doc.id,
      type: 'document_pending',
      title: doc.originalName,
      detail: `${doc.status}${personSuffix}`,
      occurredAt,
      link,
    };
  }
}
