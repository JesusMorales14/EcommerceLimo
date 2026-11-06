import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CartService } from '@core/services/cart.service';
import { FavoritesService } from '@core/services/favorites.service';
import { StarRating } from '@shared/components/star-rating/star-rating';
import { ProductDetailStore } from '../../../data/product-detail.store';
import { ProductDeliveryInfo } from '../product-delivery-info/product-delivery-info';
import { ProductOptions } from '../product-options/product-options';
import { ProductPrice } from '../product-price/product-price';

const LOW_STOCK_THRESHOLD = 5;

/** Columna de compra: datos, precio, variantes, cantidad y acciones. */
@Component({
  selector: 'app-product-purchase-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DecimalPipe, StarRating, ProductPrice, ProductOptions, ProductDeliveryInfo],
  templateUrl: './product-purchase-panel.html',
  styleUrl: './product-purchase-panel.scss',
})
export class ProductPurchasePanel {
  protected readonly store = inject(ProductDetailStore);
  protected readonly favorites = inject(FavoritesService);
  private readonly cart = inject(CartService);

  protected readonly quantity = signal(1);
  protected readonly lowStockThreshold = LOW_STOCK_THRESHOLD;
  protected readonly stock = computed(() => this.store.product()?.stock ?? 0);
  protected readonly isFavorite = computed(() => {
    const product = this.store.product();
    return !!product && this.favorites.favoriteIds().includes(product.id);
  });

  constructor() {
    // Reinicia la cantidad al cambiar de producto.
    effect(() => {
      this.store.product();
      this.quantity.set(1);
    });
  }

  protected increment(): void {
    this.quantity.update((q) => Math.min(this.stock(), q + 1));
  }

  protected decrement(): void {
    this.quantity.update((q) => Math.max(1, q - 1));
  }

  protected addToCart(): void {
    const product = this.store.product();
    if (!product || product.stock === 0) return;
    this.cart.addToCart(product, this.quantity(), this.store.selectedColorName(), this.store.activeImages()[0]);
  }

  protected toggleFavorite(): void {
    const product = this.store.product();
    if (product) this.favorites.toggle(product);
  }
}
