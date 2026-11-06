import { Injectable } from '@nestjs/common';
import type { Favorite, Product } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

/** Acceso a datos de favoritos. */
@Injectable()
export class FavoritesRepository {
  constructor(private readonly prisma: PrismaService) {}

  find(userId: number, productId: number): Promise<Favorite | null> {
    return this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  }

  add(userId: number, productId: number): Promise<Favorite> {
    return this.prisma.favorite.create({ data: { userId, productId } });
  }

  remove(id: number): Promise<Favorite> {
    return this.prisma.favorite.delete({ where: { id } });
  }

  async findProductsByUser(userId: number): Promise<Product[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: true },
    });
    return favorites.map((favorite) => favorite.product);
  }

  async findProductIdsByUser(userId: number): Promise<number[]> {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    return favorites.map((favorite) => favorite.productId);
  }
}
