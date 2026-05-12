import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealSessionsService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    const now = new Date();
    const session = await this.prisma.dealSession.findFirst({
      where: { active: true, startsAt: { lte: now } },
      orderBy: { createdAt: 'desc' },
    });
    if (!session) return null;
    if (new Date(session.endsAt) <= now) {
      await this.prisma.dealSession.update({ where: { id: session.id }, data: { active: false } });
      return null;
    }
    return session;
  }

  async create(endsAt: Date, startsAt?: Date) {
    await this.prisma.dealSession.updateMany({ where: { active: true }, data: { active: false } });
    return this.prisma.dealSession.create({
      data: { endsAt, startsAt: startsAt ?? new Date(), active: true },
    });
  }

  async cancel() {
    await this.prisma.dealSession.updateMany({ where: { active: true }, data: { active: false } });
    return { ok: true };
  }
}
