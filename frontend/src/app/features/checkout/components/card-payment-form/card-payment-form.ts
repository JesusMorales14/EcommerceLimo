import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { formatCardNumber, formatExpiry } from '../../data/card.utils';
import { CheckoutStore } from '../../data/checkout.store';
import { CreditCardPreview } from '../credit-card-preview/credit-card-preview';

/** Formulario de tarjeta (simulado) con vista previa en vivo. */
@Component({
  selector: 'app-card-payment-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, CreditCardPreview],
  templateUrl: './card-payment-form.html',
  styleUrl: './card-payment-form.scss',
})
export class CardPaymentForm {
  protected readonly store = inject(CheckoutStore);
  protected readonly flipped = signal(false);

  protected onNumberInput(input: HTMLInputElement): void {
    input.value = formatCardNumber(input.value);
    this.store.updateCard({ number: input.value });
  }

  protected onExpiryInput(input: HTMLInputElement): void {
    input.value = formatExpiry(input.value);
    this.store.updateCard({ expiry: input.value });
  }
}
