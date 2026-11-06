import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const MAX_STARS = 5;

/**
 * Muestra una valoración como estrellas (★☆). El color y tamaño los define
 * el componente padre aplicando una clase sobre `<app-star-rating>`.
 */
@Component({
  selector: 'app-star-rating',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span role="img" [attr.aria-label]="label()">{{ stars() }}</span>`,
  styles: ':host { display: inline-block; }',
})
export class StarRating {
  /** Valoración entre 0 y 5 (se redondea al entero más cercano). */
  readonly value = input.required<number>();

  private readonly rounded = computed(() => Math.min(MAX_STARS, Math.max(0, Math.round(this.value()))));
  protected readonly stars = computed(() => '★'.repeat(this.rounded()) + '☆'.repeat(MAX_STARS - this.rounded()));
  protected readonly label = computed(() => `Valoración: ${this.rounded()} de ${MAX_STARS} estrellas`);
}
