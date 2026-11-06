import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CartService } from '@core/services/cart.service';
import { CurrencyPenPipe } from '@shared/pipes';
import { CheckoutStep } from '../../data/checkout.models';
import { CheckoutStore } from '../../data/checkout.store';
import { OrderSummary } from '../order-summary/order-summary';

/** Paso 3: revisión final del pedido antes de pagar. */
@Component({
  selector: 'app-confirm-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe, OrderSummary],
  templateUrl: './confirm-step.html',
  styleUrl: './confirm-step.scss',
})
export class ConfirmStep {
  protected readonly store = inject(CheckoutStore);
  protected readonly cart = inject(CartService);
  protected readonly Step = CheckoutStep;
}
