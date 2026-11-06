import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ProductDetailStore } from '../../../data/product-detail.store';
import { ReviewForm } from '../review-form/review-form';
import { ReviewList } from '../review-list/review-list';
import { ReviewSummary } from '../review-summary/review-summary';

/** Sección de opiniones: resumen, formulario y listado. */
@Component({
  selector: 'app-product-reviews',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReviewSummary, ReviewForm, ReviewList],
  templateUrl: './product-reviews.html',
  styleUrl: './product-reviews.scss',
})
export class ProductReviews {
  protected readonly store = inject(ProductDetailStore);
}
