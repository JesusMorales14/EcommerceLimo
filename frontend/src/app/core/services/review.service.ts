import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: { id: number; name: string };
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: Record<number, number>;
}

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private api = inject(ApiService);

  getByProduct(productId: number) {
    return this.api.get<Review[]>(`/reviews/product/${productId}`);
  }

  getStats(productId: number) {
    return this.api.get<ReviewStats>(`/reviews/product/${productId}/stats`);
  }

  create(productId: number, rating: number, comment: string) {
    return this.api.post<Review>(`/reviews/product/${productId}`, { rating, comment });
  }

  delete(reviewId: number) {
    return this.api.delete<void>(`/reviews/${reviewId}`);
  }
}
