import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DealSessionsService {
  constructor(private prisma: PrismaService) {}

  async getActive() {
    const session = await this.prisma.dealSession.findFirst({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
    });
    if (!session) return null;
    if (new Date(session.endsAt) <= new Date()) {
      await this.prisma.dealSession.update({ where: { id: session.id }, data: { active: false } });
      return null;
    }
    return session;
  }

  async create(endsAt: Date) {
    await this.prisma.dealSession.updateMany({ where: { active: true }, data: { active: false } });
    return this.prisma.dealSession.create({ data: { endsAt, active: true } });
  }

  async cancel() {
    await this.prisma.dealSession.updateMany({ where: { active: true }, data: { active: false } });
    return { ok: true };
  }
}
