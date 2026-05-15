import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PersonsRepository } from './persons.repository';
import { aggregateProfile } from './profile.aggregator';
import {
  CreatePersonDto,
  UpdatePersonDto,
  UpdateProfileOverridesDto,
} from './dto/person.dto';
import {
  PersonsCompletenessService,
  computeCompleteness,
  CompletenessSummary,
} from './persons.completeness';

export interface PersonWithCompleteness {
  id: string;
  userId: string;
  fullName: string;
  cui: string | null;
  email: string | null;
  phone: string | null;
  role: string;
  status: string;
  notes: string | null;
  profileOverrides: Prisma.JsonValue | null;
  createdAt: Date;
  updatedAt: Date;
  completeness?: CompletenessSummary;
}

export interface PersonsListResponse {
  items: PersonWithCompleteness[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface PersonsMetricsResponse {
  activeCount: number;
  incompleteCount: number;
}

@Injectable()
export class PersonsService {
  constructor(
    private readonly repo: PersonsRepository,
    private readonly completeness: PersonsCompletenessService,
  ) {}

  async create(userId: string, dto: CreatePersonDto) {
    if (dto.cui) {
      const existing = await this.repo.findByCui(userId, dto.cui);
      if (existing) {
        throw new ConflictException(
          `Ya existe una persona registrada con el CUI ${dto.cui}.`,
        );
      }
    }
    return this.repo.create(userId, {
      userId,
      fullName: dto.fullName,
      cui: dto.cui ?? null,
      email: dto.email ?? null,
      phone: dto.phone ?? null,
      role: dto.role ?? 'candidate',
      status: dto.status ?? 'active',
      notes: dto.notes ?? null,
    });
  }

  async listPage(
    userId: string,
    opts: {
      status?: string;
      q?: string;
      page: number;
      pageSize: number;
      includeCompleteness: boolean;
    },
  ): Promise<PersonsListResponse> {
    const { items, total } = await this.repo.findPage(userId, {
      status: opts.status,
      q: opts.q,
      page: opts.page,
      pageSize: opts.pageSize,
    });

    let enriched: PersonWithCompleteness[] = items;

    if (opts.includeCompleteness && items.length > 0) {
      const counts = await this.completeness.getCountsForPersons(
        userId,
        items.map((p) => p.id),
      );
      enriched = items.map((p) => ({
        ...p,
        completeness: computeCompleteness(
          p.role,
          counts.get(p.id) ?? {
            cv: 0,
            id_card: 0,
            fiscal_social: 0,
            background_penal: 0,
            background_policial: 0,
          },
        ),
      }));
    }

    return {
      items: enriched,
      total,
      page: opts.page,
      pageSize: opts.pageSize,
      hasMore: opts.page * opts.pageSize < total,
    };
  }

  async getMetrics(userId: string): Promise<PersonsMetricsResponse> {
    const [activeCount, allRoles, counts] = await Promise.all([
      this.repo.countActive(userId),
      this.repo.listIdsAndRoles(userId),
      this.completeness.getCountsForPersons(userId),
    ]);

    let incompleteCount = 0;
    for (const p of allRoles) {
      const c = counts.get(p.id) ?? {
        cv: 0,
        id_card: 0,
        fiscal_social: 0,
        background_penal: 0,
        background_policial: 0,
      };
      const { done, total } = computeCompleteness(p.role, c);
      if (done < total) incompleteCount += 1;
    }

    return { activeCount, incompleteCount };
  }

  async getCompletenessFor(userId: string, personId: string) {
    const person = await this.getById(userId, personId);
    return this.completeness.getForPerson(userId, person.id, person.role);
  }

  async getById(userId: string, id: string) {
    const person = await this.repo.findById(id, userId);
    if (!person) throw new NotFoundException('Persona no encontrada');
    return person;
  }

  async update(userId: string, id: string, dto: UpdatePersonDto) {
    await this.getById(userId, id);

    if (dto.cui) {
      const dupe = await this.repo.findByCui(userId, dto.cui);
      if (dupe && dupe.id !== id) {
        throw new ConflictException(
          `Otra persona ya tiene el CUI ${dto.cui}.`,
        );
      }
    }

    return this.repo.update(id, {
      fullName: dto.fullName,
      cui: dto.cui,
      email: dto.email,
      phone: dto.phone,
      role: dto.role,
      status: dto.status,
      notes: dto.notes,
    });
  }

  async updateOverrides(userId: string, id: string, dto: UpdateProfileOverridesDto) {
    await this.getById(userId, id);
    return this.repo.update(id, {
      profileOverrides: dto.overrides as Prisma.InputJsonValue,
    });
  }

  async remove(userId: string, id: string) {
    await this.getById(userId, id);
    return this.repo.delete(id);
  }

  async getProfile(userId: string, id: string) {
    const person = await this.getById(userId, id);
    const docs = await this.repo.findDocuments(id);
    const overrides = (person.profileOverrides as Record<string, unknown> | null) ?? {};

    const profile = aggregateProfile(
      docs.map((d) => ({
        id: d.id,
        originalName: d.originalName,
        documentType: d.documentType,
        extractedData: d.extractedData,
        createdAt: d.createdAt,
      })),
      overrides,
    );

    return { person, profile };
  }

  async listDocuments(userId: string, id: string) {
    await this.getById(userId, id);
    return this.repo.findDocuments(id);
  }

  async listEvaluations(userId: string, id: string) {
    await this.getById(userId, id);
    return this.repo.findEvaluations(id);
  }
}
