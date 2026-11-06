import { Injectable } from '@nestjs/common';
import type { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

type Db = Prisma.TransactionClient | PrismaService;

/** Relaciones incluidas al devolver un pedido. */
export const ORDER_INCLUDE = {
  items: { include: { product: true } },
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.OrderInclude;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: typeof ORDER_INCLUDE;
}>;

/** Acceso a datos de pedidos. */
@Injectable()
export class OrdersRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(
    data: Prisma.OrderUncheckedCreateInput,
    db: Db = this.prisma,
  ): Promise<OrderWithDetails> {
    return db.order.create({ data, include: ORDER_INCLUDE });
  }

  findById(id: number, db: Db = this.prisma): Promise<OrderWithDetails | null> {
    return db.order.findUnique({ where: { id }, include: ORDER_INCLUDE });
  }

  findByUser(userId: number): Promise<OrderWithDetails[]> {
    return this.prisma.order.findMany({
      where: { userId },
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(): Promise<OrderWithDetails[]> {
    return this.prisma.order.findMany({
      include: ORDER_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  updateStatus(
    id: number,
    status: OrderStatus,
    db: Db = this.prisma,
  ): Promise<OrderWithDetails> {
    return db.order.update({
      where: { id },
      data: { status },
      include: ORDER_INCLUDE,
    });
  }
}
