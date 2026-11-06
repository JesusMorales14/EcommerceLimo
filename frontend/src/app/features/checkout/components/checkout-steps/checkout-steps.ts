import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CheckoutStep } from '../../data/checkout.models';

interface StepDefinition {
  readonly step: CheckoutStep;
  readonly label: string;
}

/** Indicador de progreso del checkout (Entrega → Pago → Confirmar). */
@Component({
  selector: 'app-checkout-steps',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout-steps.html',
  styleUrl: './checkout-steps.scss',
})
export class CheckoutSteps {
  readonly current = input.required<CheckoutStep>();

  protected readonly steps: readonly StepDefinition[] = [
    { step: CheckoutStep.Delivery, label: 'Entrega' },
    { step: CheckoutStep.Payment, label: 'Pago' },
    { step: CheckoutStep.Confirm, label: 'Confirmar' },
  ];
}
