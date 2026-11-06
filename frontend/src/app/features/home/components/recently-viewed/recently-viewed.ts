import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { CartService } from '@core/services/cart.service';
import { RecentlyViewedService } from '@core/services/recently-viewed.service';
import { CurrencyPenPipe } from '@shared/pipes';
import { discountedPrice } from '@shared/utils/pricing';

/** Carrusel horizontal con los últimos productos visitados. */
@Component({
  selector: 'app-recently-viewed',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPenPipe],
  templateUrl: './recently-viewed.html',
  styleUrl: './recently-viewed.scss',
})
export class RecentlyViewed {
  protected readonly history = inject(RecentlyViewedService);
  private readonly cart = inject(CartService);

  protected readonly priceOf = discountedPrice;

  protected addToCart(product: Product): void {
    this.cart.addToCart(product);
  }
}
