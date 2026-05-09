import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../config/database.config';

@Injectable()
export class PersonsRepository {
  constructor(private prisma: PrismaService) {}

  create(userId: string, data: Prisma.PersonUncheckedCreateInput) {
    return this.prisma.person.create({
      data: { ...data, userId },
    });
  }

  findById(id: string, userId: string) {
    return this.prisma.person.findFirst({
      where: { id, userId },
    });
  }

  findByUserId(userId: string, opts?: { status?: string; q?: string }) {
    const where: Prisma.PersonWhereInput = { userId };
    if (opts?.status) where.status = opts.status;
    if (opts?.q) {
      where.OR = [
        { fullName: { contains: opts.q, mode: 'insensitive' } },
        { cui: { contains: opts.q, mode: 'insensitive' } },
        { email: { contains: opts.q, mode: 'insensitive' } },
      ];
    }
    return this.prisma.person.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });
  }

  findByCui(userId: string, cui: string) {
    return this.prisma.person.findFirst({
      where: { userId, cui },
    });
  }

  findDocuments(personId: string) {
    return this.prisma.document.findMany({
      where: { personId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findEvaluations(personId: string) {
    return this.prisma.personEvaluation.findMany({
      where: { personId },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: string, data: Prisma.PersonUncheckedUpdateInput) {
    return this.prisma.person.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.person.delete({ where: { id } });
  }

  countByUserId(userId: string) {
    return this.prisma.person.count({ where: { userId } });
  }
}
