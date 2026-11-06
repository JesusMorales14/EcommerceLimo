import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { ProductDetailStore } from '../../../data/product-detail.store';

const DEFAULT_RATING = 5;

/** Formulario para publicar una reseña (solo usuarios autenticados). */
@Component({
  selector: 'app-review-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink],
  templateUrl: './review-form.html',
  styleUrl: './review-form.scss',
})
export class ReviewForm {
  protected readonly store = inject(ProductDetailStore);
  protected readonly auth = inject(AuthService);
  protected readonly ratingOptions = [1, 2, 3, 4, 5] as const;

  protected readonly rating = signal(DEFAULT_RATING);
  protected readonly comment = signal('');

  protected submit(): void {
    this.store.submitReview(this.rating(), this.comment(), () => {
      this.comment.set('');
      this.rating.set(DEFAULT_RATING);
    });
  }
}
