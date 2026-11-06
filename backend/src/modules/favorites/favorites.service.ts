import { Injectable } from '@nestjs/common';
import type { Product } from '@prisma/client';
import { FavoritesRepository } from './favorites.repository';

export interface ToggleFavoriteResult {
  favorited: boolean;
  productId: number;
}

/** Casos de uso de la lista de favoritos de un usuario. */
@Injectable()
export class FavoritesService {
  constructor(private readonly favorites: FavoritesRepository) {}

  async toggle(
    userId: number,
    productId: number,
  ): Promise<ToggleFavoriteResult> {
    const existing = await this.favorites.find(userId, productId);
    if (existing) {
      await this.favorites.remove(existing.id);
      return { favorited: false, productId };
    }
    await this.favorites.add(userId, productId);
    return { favorited: true, productId };
  }

  async remove(
    userId: number,
    productId: number,
  ): Promise<ToggleFavoriteResult> {
    const existing = await this.favorites.find(userId, productId);
    if (existing) await this.favorites.remove(existing.id);
    return { favorited: false, productId };
  }

  getProducts(userId: number): Promise<Product[]> {
    return this.favorites.findProductsByUser(userId);
  }

  getProductIds(userId: number): Promise<number[]> {
    return this.favorites.findProductIdsByUser(userId);
  }
}
