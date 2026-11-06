import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { ProductCard } from '@shared/components/product-card/product-card';

/** Sección de productos destacados del inicio. */
@Component({
  selector: 'app-featured-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProductCard],
  templateUrl: './featured-section.html',
  styleUrl: './featured-section.scss',
})
export class FeaturedSection {
  readonly products = input.required<readonly Product[]>();
  /** Muestra el enlace "Ver todos" si hay más productos que los visibles. */
  readonly hasMore = input(false);
}
