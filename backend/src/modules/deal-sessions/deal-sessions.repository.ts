import { Injectable } from '@nestjs/common';
import type { DealSession, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

type Db = Prisma.TransactionClient | PrismaService;

/** Acceso a datos de las sesiones de "Ofertas del Día". */
@Injectable()
export class DealSessionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findLatestStarted(now: Date): Promise<DealSession | null> {
    return this.prisma.dealSession.findFirst({
      where: { active: true, startsAt: { lte: now } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findNextScheduled(now: Date): Promise<DealSession | null> {
    return this.prisma.dealSession.findFirst({
      where: { active: true, startsAt: { gt: now }, endsAt: { gt: now } },
      orderBy: { startsAt: 'asc' },
    });
  }

  deactivate(id: number): Promise<DealSession> {
    return this.prisma.dealSession.update({
      where: { id },
      data: { active: false },
    });
  }

  deactivateAll(db: Db = this.prisma): Promise<Prisma.BatchPayload> {
    return db.dealSession.updateMany({
      where: { active: true },
      data: { active: false },
    });
  }

  create(
    data: Prisma.DealSessionCreateInput,
    db: Db = this.prisma,
  ): Promise<DealSession> {
    return db.dealSession.create({ data });
  }
}
