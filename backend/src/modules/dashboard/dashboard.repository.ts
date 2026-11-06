import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

/** Consultas agregadas para el panel de administración. */
@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(lowStockThreshold: number, recentOrdersLimit: number) {
    const [totalProducts, lowStock, totalOrders, revenue, recentOrders] =
      await this.prisma.$transaction([
        this.prisma.product.count(),
        this.prisma.product.count({
          where: { stock: { lt: lowStockThreshold } },
        }),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { total: true },
          where: { status: { not: 'CANCELLED' } },
        }),
        this.prisma.order.findMany({
          take: recentOrdersLimit,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true, email: true } } },
        }),
      ]);
    return {
      totalProducts,
      lowStock,
      totalOrders,
      totalRevenue: revenue._sum.total ?? 0,
      recentOrders,
    };
  }
}
