import type { HttpErrorResponse } from '@angular/common/http';
import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Subscription } from 'rxjs';
import type { Product } from '@core/models/product.model';
import { ProductService } from '@core/services/product.service';
import { RecentlyViewedService } from '@core/services/recently-viewed.service';
import type { Review, ReviewStats } from '@core/services/review.service';
import { ReviewService } from '@core/services/review.service';
import { extractErrorMessage } from '@shared/utils/http-error';

const EMPTY_STATS: ReviewStats = { average: 0, total: 0, distribution: {} };

/** Estado de la página de detalle: producto, reseñas y estadísticas. */
@Injectable()
export class ProductDetailStore {
  private readonly products = inject(ProductService);
  private readonly reviewsApi = inject(ReviewService);
  private readonly recentlyViewed = inject(RecentlyViewedService);
  private readonly destroyRef = inject(DestroyRef);
  private requests: Subscription[] = [];

  readonly product = signal<Product | null>(null);
  readonly loading = signal(true);
  readonly reviews = signal<Review[]>([]);
  readonly stats = signal<ReviewStats>(EMPTY_STATS);
  readonly loadingReviews = signal(false);
  readonly submittingReview = signal(false);
  readonly reviewError = signal('');

  readonly selectedColorIndex = signal(0);
  readonly selectedSize = signal('');

  readonly reviewCount = computed(() => this.stats().total);
  readonly selectedColorName = computed(() => this.product()?.colors?.[this.selectedColorIndex()]);

  /** Imágenes del color seleccionado o, en su defecto, las imágenes base. */
  readonly activeImages = computed<readonly string[]>(() => {
    const product = this.product();
    if (!product) return [];
    const color = this.selectedColorName();
    const colorImages = color ? product.colorImages?.[color] : undefined;
    return colorImages?.length ? colorImages : product.images;
  });

  /** Carga el producto y sus reseñas. Cancela cargas anteriores en curso. */
  load(productId: number): void {
    this.requests.forEach((s) => s.unsubscribe());
    this.loading.set(true);
    this.product.set(null);
    this.reviews.set([]);
    this.stats.set(EMPTY_STATS);

    this.requests = [
      this.products
        .getById(productId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (product) => {
            this.product.set(product);
            this.selectedColorIndex.set(0);
            this.selectedSize.set(product.sizes?.[0] ?? '');
            this.loading.set(false);
            this.recentlyViewed.add(product);
            this.loadReviews(productId);
          },
          error: () => this.loading.set(false),
        }),
    ];
  }

  submitReview(rating: number, comment: string, onSuccess: () => void): void {
    const product = this.product();
    if (!product) return;
    if (!comment.trim()) {
      this.reviewError.set('Escribe un comentario.');
      return;
    }
    this.submittingReview.set(true);
    this.reviewError.set('');
    this.reviewsApi
      .create(product.id, rating, comment.trim())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (review) => {
          this.reviews.update((list) => [review, ...list]);
          this.stats.update((s) => this.withNewRating(s, review.rating));
          this.submittingReview.set(false);
          onSuccess();
        },
        error: (err: HttpErrorResponse) => {
          this.reviewError.set(extractErrorMessage(err, 'Error al publicar la reseña.'));
          this.submittingReview.set(false);
        },
      });
  }

  /** Porcentaje (0-100) de reseñas con la puntuación indicada. */
  distributionPercent(star: number): number {
    const { total, distribution } = this.stats();
    return total ? Math.round(((distribution[star] ?? 0) / total) * 100) : 0;
  }

  private loadReviews(productId: number): void {
    this.loadingReviews.set(true);
    this.requests.push(
      this.reviewsApi
        .getByProduct(productId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (reviews) => {
            this.reviews.set(reviews);
            this.loadingReviews.set(false);
          },
          error: () => this.loadingReviews.set(false),
        }),
      this.reviewsApi
        .getStats(productId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((stats) => this.stats.set(stats)),
    );
  }

  /** Recalcula promedio y distribución localmente tras publicar una reseña. */
  private withNewRating(stats: ReviewStats, rating: number): ReviewStats {
    const total = stats.total + 1;
    const average = Math.round(((stats.average * stats.total + rating) / total) * 10) / 10;
    const distribution = { ...stats.distribution, [rating]: (stats.distribution[rating] ?? 0) + 1 };
    return { total, average, distribution };
  }
}
