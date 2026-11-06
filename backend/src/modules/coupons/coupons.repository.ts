import { Injectable } from '@nestjs/common';
import type { Coupon, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

type Db = Prisma.TransactionClient | PrismaService;

/** Acceso a datos de cupones. Los métodos aceptan un cliente transaccional opcional. */
@Injectable()
export class CouponsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByCode(code: string, db: Db = this.prisma): Promise<Coupon | null> {
    return db.coupon.findUnique({ where: { code: code.toUpperCase() } });
  }

  findById(id: number): Promise<Coupon | null> {
    return this.prisma.coupon.findUnique({ where: { id } });
  }

  findAll(): Promise<Coupon[]> {
    return this.prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  }

  create(data: Prisma.CouponCreateInput): Promise<Coupon> {
    return this.prisma.coupon.create({ data });
  }

  setActive(id: number, active: boolean): Promise<Coupon> {
    return this.prisma.coupon.update({ where: { id }, data: { active } });
  }

  delete(id: number): Promise<Coupon> {
    return this.prisma.coupon.delete({ where: { id } });
  }

  /**
   * Consume un uso del cupón de forma atómica: solo incrementa si sigue activo
   * y con usos disponibles (evita condiciones de carrera). Devuelve si se pudo canjear.
   */
  async redeem(id: number, db: Db): Promise<boolean> {
    const coupon = await db.coupon.findUnique({
      where: { id },
      select: { maxUses: true },
    });
    if (!coupon) return false;
    const { count } = await db.coupon.updateMany({
      where: { id, active: true, usedCount: { lt: coupon.maxUses } },
      data: { usedCount: { increment: 1 } },
    });
    return count === 1;
  }
}
