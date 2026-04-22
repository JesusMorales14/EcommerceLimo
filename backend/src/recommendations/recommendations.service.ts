import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  // SCORE GLOBAL (ventas + rating + recencia)
  private calculateScore(product: any, sales: number, rating: number) {
    const daysOld =
      (Date.now() - new Date(product.createdAt).getTime()) /
      (1000 * 60 * 60 * 24);

    // recencia con decaimiento real (no lineal)
    const recencyScore = Math.exp(-daysOld / 10) * 10;

    if (product.stock === 0) {
      return 0; // no recomendar sin stock
    }
    // penalización si no tiene ventas
    if (sales === 0) {
      return recencyScore * 0.5;
    }

    // score balanceado real
    return sales * 5 + rating * 10 + recencyScore;
  }

  // 1. TRENDING REAL (con score)
  async getTopProducts() {
    // ventas
    const sales = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    // ratings
    const ratings = await this.prisma.review.groupBy({
      by: ['productId'],
      _avg: { rating: true },
    });

    const products = await this.prisma.product.findMany();

    // 🔥 convertir a mapas (ANTES del map)
    const salesMap = new Map(sales.map((s) => [s.productId, s._sum.quantity]));

    const ratingMap = new Map(ratings.map((r) => [r.productId, r._avg.rating]));

    // 🔥 luego usar map eficiente
    const enriched = products.map((product) => {
      const totalSales = salesMap.get(product.id) || 0;
      const avgRating = Number(ratingMap.get(product.id)) || 0;

      const score = this.calculateScore(product, totalSales, avgRating);

      return {
        ...product,
        score,
        totalSales,
        avgRating,
      };
    });

    return enriched.sort((a, b) => b.score - a.score).slice(0, 10);
  }

  //2. SIMILARES (con score)
  async similarProducts(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) return [];

    // 🔥 1. obtener TODOS los candidatos (menos el actual)
    const allProducts = await this.prisma.product.findMany({
      where: {
        NOT: { id: productId },
      },
    });

    // 🔥 2. métricas
    const sales = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    const ratings = await this.prisma.review.groupBy({
      by: ['productId'],
      _avg: { rating: true },
    });

    // 🔥 3. scoring + separación por categoría
    const sameCategory: any[] = [];
    const otherCategory: any[] = [];

    for (const p of allProducts) {
      const sale = sales.find((s) => s.productId === p.id);
      const rate = ratings.find((r) => r.productId === p.id);

      const totalSales = sale?._sum.quantity || 0;
      const avgRating = rate?._avg.rating || 0;

      let score = this.calculateScore(p, totalSales, avgRating);

      if (p.categoryId === product.categoryId) {
        score += 30; // BOOST fuerte
        sameCategory.push({ ...p, score });
      } else {
        otherCategory.push({ ...p, score });
      }
    }

    // 🔥 4. ordenar por score
    sameCategory.sort((a, b) => b.score - a.score);
    otherCategory.sort((a, b) => b.score - a.score);

    // 🔥 5. priorizar misma categoría
    let result = sameCategory.slice(0, 6);

    // 🔥 6. fallback SOLO si falta
    if (result.length < 6) {
      const needed = 6 - result.length;
      result = result.concat(otherCategory.slice(0, needed));
    }

    return result;
  }

  // 3. RECOMENDACIONES POR USUARIO (nivel real)
  async forUser(userId: number) {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
    });

    const boughtIds = orders.flatMap((o) => o.items.map((i) => i.productId));

    // 🔥 usuario nuevo → trending
    if (boughtIds.length === 0) {
      return this.getTopProducts();
    }

    // 🔥 categorías compradas
    const boughtProducts = await this.prisma.product.findMany({
      where: { id: { in: boughtIds } },
    });

    const categories = [...new Set(boughtProducts.map((p) => p.categoryId))];

    // 🔥 candidatos principales
    let candidates = await this.prisma.product.findMany({
      where: {
        categoryId: { in: categories },
        NOT: { id: { in: boughtIds } },
      },
    });

    // 🔥 🚨 FALLBACK CLAVE (esto te faltaba)
    if (candidates.length === 0) {
      candidates = await this.prisma.product.findMany({
        where: {
          NOT: { id: { in: boughtIds } },
        },
        take: 10,
      });
    }

    // 🔥 métricas
    const sales = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    const ratings = await this.prisma.review.groupBy({
      by: ['productId'],
      _avg: { rating: true },
    });

    const enriched = candidates.map((p) => {
      const sale = sales.find((s) => s.productId === p.id);
      const rate = ratings.find((r) => r.productId === p.id);

      const totalSales = sale?._sum.quantity || 0;
      const avgRating = rate?._avg.rating || 0;

      const score = this.calculateScore(p, totalSales, avgRating);

      return { ...p, score };
    });

    return enriched.sort((a, b) => b.score - a.score).slice(0, 6);
  }
}
