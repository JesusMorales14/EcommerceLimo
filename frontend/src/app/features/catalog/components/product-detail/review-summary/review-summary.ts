import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { StarRating } from '@shared/components/star-rating/star-rating';
import { ProductDetailStore } from '../../../data/product-detail.store';

/** Promedio de valoraciones y distribución por estrellas. */
@Component({
  selector: 'app-review-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, StarRating],
  templateUrl: './review-summary.html',
  styleUrl: './review-summary.scss',
})
export class ReviewSummary {
  protected readonly store = inject(ProductDetailStore);
  protected readonly starLevels = [5, 4, 3, 2, 1] as const;
}
