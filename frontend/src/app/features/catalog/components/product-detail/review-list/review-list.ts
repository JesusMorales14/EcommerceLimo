import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import type { Review } from '@core/services/review.service';
import { StarRating } from '@shared/components/star-rating/star-rating';

/** Listado de reseñas de clientes. */
@Component({
  selector: 'app-review-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, StarRating],
  templateUrl: './review-list.html',
  styleUrl: './review-list.scss',
})
export class ReviewList {
  readonly reviews = input.required<readonly Review[]>();
}
