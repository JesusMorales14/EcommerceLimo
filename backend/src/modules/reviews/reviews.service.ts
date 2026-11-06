import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../../common/interfaces/authenticated-user.interface';
import { buildReviewStats, type ReviewStats } from './domain/review-stats';
import type { CreateReviewDto } from './dto/create-review.dto';
import { type ReviewWithAuthor, ReviewsRepository } from './reviews.repository';

/** Casos de uso de reseñas de productos. */
@Injectable()
export class ReviewsService {
  constructor(private readonly reviews: ReviewsRepository) {}

  getByProduct(productId: number): Promise<ReviewWithAuthor[]> {
    return this.reviews.findByProduct(productId);
  }

  async getStats(productId: number): Promise<ReviewStats> {
    return buildReviewStats(await this.reviews.countByRating(productId));
  }

  async create(
    userId: number,
    productId: number,
    dto: CreateReviewDto,
  ): Promise<ReviewWithAuthor> {
    if (!(await this.reviews.productExists(productId))) {
      throw new NotFoundException('Producto no encontrado');
    }
    if (await this.reviews.findByUserAndProduct(userId, productId)) {
      throw new ConflictException('Ya dejaste una reseña para este producto');
    }
    return this.reviews.create({
      userId,
      productId,
      rating: dto.rating,
      comment: dto.comment,
    });
  }

  /** Solo el autor o un administrador pueden eliminar una reseña. */
  async remove(user: AuthenticatedUser, reviewId: number): Promise<void> {
    const review = await this.reviews.findById(reviewId);
    if (!review) throw new NotFoundException('Reseña no encontrada');
    if (user.role !== Role.ADMIN && review.userId !== user.id) {
      throw new ForbiddenException('No puedes eliminar esta reseña');
    }
    await this.reviews.delete(reviewId);
  }
}
