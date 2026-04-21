import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  // 🔥 1. TRENDING REAL (por ventas)
  async getTopProducts() {
    const top = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' },
      },
      take: 10,
    });

    const productIds = top.map((t) => t.productId);

    return this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });
  }

  // 🧠 2. SIMILARES (MEJORADO)
  async similarProducts(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return [];

    const sameCategory = await this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        NOT: { id: productId },
      },
      take: 6,
    });

    // 🔥 fallback inteligente si no hay suficientes
    if (sameCategory.length < 3) {
      const fallback = await this.prisma.product.findMany({
        where: {
          NOT: { id: productId },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 6,
      });

      return fallback;
    }

    return sameCategory;
  }

  // 👤 3. RECOMENDACIONES POR USUARIO (MEJORADAS)
  async forUser(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });

    const productIds = orders.flatMap((o) => o.items.map((i) => i.productId));

    if (productIds.length === 0) {
      // 🔥 fallback: productos populares
      return this.getTopProducts();
    }

    return this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
    });
  }
}
