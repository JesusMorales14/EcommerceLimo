import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { CheckoutNavigationService } from '@core/services/checkout-navigation.service';
import { CurrencyPenPipe } from '@shared/pipes';
import { CartDrawerItem } from './components/cart-drawer-item/cart-drawer-item';

/** Panel lateral con el resumen del carro de compras. */
@Component({
  selector: 'app-cart-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPenPipe, CartDrawerItem],
  templateUrl: './cart-drawer.html',
  styleUrl: './cart-drawer.scss',
  host: { '(document:keydown.escape)': 'close()' },
})
export class CartDrawer {
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  private readonly checkoutNavigation = inject(CheckoutNavigationService);

  protected close(): void {
    this.cart.closeCart();
  }

  protected checkout(): void {
    this.close();
    this.checkoutNavigation.goToCheckout();
  }
}
