import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { CheckoutNavigationService } from '@core/services/checkout-navigation.service';
import { CurrencyPenPipe } from '@shared/pipes';

/** Resumen de montos del carro con el acceso al checkout. */
@Component({
  selector: 'app-cart-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './cart-summary.html',
  styleUrl: './cart-summary.scss',
})
export class CartSummary {
  protected readonly cart = inject(CartService);
  protected readonly auth = inject(AuthService);
  private readonly checkoutNavigation = inject(CheckoutNavigationService);

  protected checkout(): void {
    this.checkoutNavigation.goToCheckout();
  }
}
