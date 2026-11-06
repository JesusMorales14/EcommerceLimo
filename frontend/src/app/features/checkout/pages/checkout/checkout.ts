import type { OnInit } from '@angular/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { CartService } from '@core/services/cart.service';
import { CheckoutSteps } from '../../components/checkout-steps/checkout-steps';
import { ConfirmStep } from '../../components/confirm-step/confirm-step';
import { DeliveryStep } from '../../components/delivery-step/delivery-step';
import { OrderSuccessDialog } from '../../components/order-success-dialog/order-success-dialog';
import { PaymentStep } from '../../components/payment-step/payment-step';
import { CheckoutStep } from '../../data/checkout.models';
import { CheckoutStore } from '../../data/checkout.store';

/**
 * Página contenedora del checkout. Orquesta los pasos y provee el
 * `CheckoutStore` que comparten todos los subcomponentes.
 */
@Component({
  selector: 'app-checkout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CheckoutSteps, DeliveryStep, PaymentStep, ConfirmStep, OrderSuccessDialog],
  providers: [CheckoutStore],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class CheckoutPage implements OnInit {
  protected readonly store = inject(CheckoutStore);
  protected readonly Step = CheckoutStep;
  private readonly cart = inject(CartService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    if (this.cart.isEmpty()) {
      void this.router.navigate(['/cart']);
      return;
    }
    this.store.prefill(this.auth.user());
  }
}
