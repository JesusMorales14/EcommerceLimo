import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CurrencyPenPipe } from '@shared/pipes';
import { CheckoutStore } from '../../data/checkout.store';
import { PAYMENT_METHODS } from '../../data/payment-methods';
import { CardPaymentForm } from '../card-payment-form/card-payment-form';

/** Paso 2: selección del método de pago. */
@Component({
  selector: 'app-payment-step',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe, CardPaymentForm],
  templateUrl: './payment-step.html',
  styleUrl: './payment-step.scss',
})
export class PaymentStep {
  protected readonly store = inject(CheckoutStore);
  protected readonly methods = PAYMENT_METHODS;
}
