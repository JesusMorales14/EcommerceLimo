import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  // ⭐ crear review
  async create(
    userId: number,
    productId: number,
    rating: number,
    comment?: string,
  ) {
    // 1. validar producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new BadRequestException('Producto no existe');
    }

    // 2. validar que el usuario compró el producto
    const hasBought = await this.prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
        },
      },
    });

    if (!hasBought) {
      throw new BadRequestException('Debes comprar el producto para opinar');
    }

    // 3. evitar duplicados (1 review por usuario/producto)
    const existing = await this.prisma.review.findFirst({
      where: {
        userId,
        productId,
      },
    });

    if (existing) {
      throw new BadRequestException('Ya hiciste review de este producto');
    }

    // 4. crear review
    return this.prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        productId,
      },
    });
  }

  // ⭐ obtener reviews de un producto
  async getByProduct(productId: number) {
    return this.prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // ⭐ promedio rating (clave para recomendaciones)
  async getAverageRating(productId: number) {
    const result = await this.prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    return {
      average: result._avg.rating || 0,
      count: result._count,
    };
  }
}
