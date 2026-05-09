import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PersonsRepository } from './persons.repository';
import { aggregateProfile, PersonProfile } from './profile.aggregator';
import {
  CreatePersonDto,
  UpdatePersonDto,
  UpdateProfileOverridesDto,
} from './dto/person.dto';

@Injectable()
export class PersonsService {
  constructor(private readonly repo: PersonsRepository) {}

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

  async listAll(userId: string, opts?: { status?: string; q?: string }) {
    return this.repo.findByUserId(userId, opts);
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
