import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async getByProduct(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(
    userId: number,
    productId: number,
    rating: number,
    comment: string,
  ) {
    if (rating < 1 || rating > 5)
      throw new BadRequestException('Rating debe estar entre 1 y 5');

    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new NotFoundException('Producto no encontrado');

    const existing = await this.prisma.review.findFirst({
      where: { userId, productId },
    });
    if (existing)
      throw new BadRequestException('Ya dejaste una reseña para este producto');

    return this.prisma.review.create({
      data: { userId, productId, rating, comment },
      include: { user: { select: { id: true, name: true } } },
    });
  }

  async remove(userId: number, reviewId: number, isAdmin: boolean) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (!isAdmin && review.userId !== userId)
      throw new BadRequestException('No autorizado');
    return this.prisma.review.delete({ where: { id: reviewId } });
  }

  async getStats(productId: number) {
    const reviews = await this.prisma.review.findMany({
      where: { productId },
      select: { rating: true },
    });
    if (!reviews.length) return { average: 0, total: 0, distribution: {} };
    const total = reviews.length;
    const average = reviews.reduce((s, r) => s + r.rating, 0) / total;
    const distribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };
    reviews.forEach((r) => distribution[r.rating]++);
    return { average: Math.round(average * 10) / 10, total, distribution };
  }
}
