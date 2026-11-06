import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { ProductCard } from '@shared/components/product-card/product-card';
import { formatDuration } from '@shared/utils/countdown';

/** Sección "Ofertas del Día" con cuenta regresiva hasta su fin. */
@Component({
  selector: 'app-deals-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard],
  templateUrl: './deals-section.html',
  styleUrl: './deals-section.scss',
})
export class DealsSection {
  readonly products = input.required<readonly Product[]>();
  readonly remainingMs = input.required<number>();

  protected readonly countdown = computed(() => formatDuration(this.remainingMs()));
}
