import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import type { CartItem } from '@core/models/cart.model';
import { CartService } from '@core/services/cart.service';
import { CurrencyPenPipe } from '@shared/pipes';

/** Fila de un producto dentro del drawer del carro, con control de cantidad. */
@Component({
  selector: 'app-cart-drawer-item',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './cart-drawer-item.html',
  styleUrl: './cart-drawer-item.scss',
})
export class CartDrawerItem {
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
