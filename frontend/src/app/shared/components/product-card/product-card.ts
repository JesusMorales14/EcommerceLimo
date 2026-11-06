import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { CartService } from '@core/services/cart.service';
import { FavoritesService } from '@core/services/favorites.service';
import { CurrencyPenPipe } from '@shared/pipes';
import { discountedPrice } from '@shared/utils/pricing';

/**
 * Tarjeta de producto reutilizable (catálogo, destacados, inicio, favoritos).
 * Componente "inteligente" ligero: delega carro y favoritos en sus servicios.
 */
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPenPipe],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss',
})
export class ProductCard {
  readonly product = input.required<Product>();
  /** Retraso de la animación de entrada (efecto escalonado en grillas). */
  readonly animationDelayMs = input(0);
  /** Muestra la descripción corta bajo el nombre. */
  readonly showDescription = input(true);

  private readonly cart = inject(CartService);
  private readonly favorites = inject(FavoritesService);

  protected readonly finalPrice = computed(() => discountedPrice(this.product()));
  protected readonly detailLink = computed(() => ['/product', this.product().id]);
  protected readonly isFavorite = computed(() => this.favorites.favoriteIds().includes(this.product().id));

  protected addToCart(): void {
    this.cart.addToCart(this.product());
  }

  protected toggleFavorite(): void {
    this.favorites.toggle(this.product());
  }
}
