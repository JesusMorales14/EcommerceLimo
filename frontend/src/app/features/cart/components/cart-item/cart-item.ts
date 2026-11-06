import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import type { CartItem } from '@core/models/cart.model';
import { CartService } from '@core/services/cart.service';
import { CurrencyPenPipe } from '@shared/pipes';

/** Tarjeta de un producto en la página del carro. */
@Component({
  selector: 'app-cart-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './cart-item.html',
  styleUrl: './cart-item.scss',
})
export class CartItemCard {
  readonly item = input.required<CartItem>();
  protected readonly cart = inject(CartService);

  protected changeQuantity(delta: number): void {
    const { product, quantity, selectedColor } = this.item();
    this.cart.updateQty(product.id, quantity + delta, selectedColor);
  }

  protected remove(): void {
    const { product, selectedColor } = this.item();
    this.cart.removeFromCart(product.id, selectedColor);
  }
}
