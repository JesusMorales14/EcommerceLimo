import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CartService } from '@core/services/cart.service';
import { CurrencyPenPipe } from '@shared/pipes';
import { CheckoutStore } from '../../data/checkout.store';
import { CouponForm } from '../coupon-form/coupon-form';

/** Resumen de montos con cupón y botón de confirmación del pedido. */
@Component({
  selector: 'app-order-summary',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe, CouponForm],
  templateUrl: './order-summary.html',
  styleUrl: './order-summary.scss',
})
export class OrderSummary {
  protected readonly store = inject(CheckoutStore);
  protected readonly cart = inject(CartService);
}
