import { Injectable } from '@nestjs/common';
import type { Prisma, Reclamacion } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const INCLUDE_USER = {
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.ReclamacionInclude;

/** Acceso a datos del Libro de Reclamaciones. */
@Injectable()
export class ReclamacionesRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.ReclamacionUncheckedCreateInput): Promise<Reclamacion> {
    return this.prisma.reclamacion.create({ data });
  }

  findById(id: number): Promise<Reclamacion | null> {
    return this.prisma.reclamacion.findUnique({ where: { id } });
  }

  findAll() {
    return this.prisma.reclamacion.findMany({
      include: INCLUDE_USER,
      orderBy: { createdAt: 'desc' },
    });
  }

  findByUser(userId: number): Promise<Reclamacion[]> {
    return this.prisma.reclamacion.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  update(id: number, data: Prisma.ReclamacionUpdateInput) {
    return this.prisma.reclamacion.update({
      where: { id },
      data,
      include: INCLUDE_USER,
    });
  }
}
