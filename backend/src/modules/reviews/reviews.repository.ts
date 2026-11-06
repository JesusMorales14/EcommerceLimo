import { Injectable } from '@nestjs/common';
import type { Prisma, Review } from '@prisma/client';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';

const REVIEW_INCLUDE = {
  user: { select: { id: true, name: true } },
} satisfies Prisma.ReviewInclude;

export type ReviewWithAuthor = Prisma.ReviewGetPayload<{
  include: typeof REVIEW_INCLUDE;
}>;

/** Acceso a datos de reseñas. */
@Injectable()
export class ReviewsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByProduct(productId: number): Promise<ReviewWithAuthor[]> {
    return this.prisma.review.findMany({
      where: { productId },
      include: REVIEW_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  findById(id: number): Promise<Review | null> {
    return this.prisma.review.findUnique({ where: { id } });
  }

  findByUserAndProduct(
    userId: number,
    productId: number,
  ): Promise<Review | null> {
    return this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
  }

  productExists(productId: number): Promise<boolean> {
    return this.prisma.product
      .count({ where: { id: productId } })
      .then((count) => count > 0);
  }

  create(data: Prisma.ReviewUncheckedCreateInput): Promise<ReviewWithAuthor> {
    return this.prisma.review.create({ data, include: REVIEW_INCLUDE });
  }

  delete(id: number): Promise<Review> {
    return this.prisma.review.delete({ where: { id } });
  }

  /** Cantidad de reseñas por puntuación (agregado en la base de datos). */
  countByRating(
    productId: number,
  ): Promise<{ rating: number; count: number }[]> {
    return this.prisma.review
      .groupBy({ by: ['rating'], where: { productId }, _count: { _all: true } })
      .then((groups) =>
        groups.map((group) => ({
          rating: group.rating,
          count: group._count._all,
        })),
      );
  }
}
