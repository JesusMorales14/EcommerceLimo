import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { cardBrandLabel, detectCardBrand, maskCardNumber } from '../../data/card.utils';
import type { CardData } from '../../data/checkout.models';

/** Vista previa 3D de la tarjeta (frente y reverso). Puramente decorativa. */
@Component({
  selector: 'app-credit-card-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './credit-card-preview.html',
  styleUrl: './credit-card-preview.scss',
})
export class CreditCardPreview {
  readonly card = input.required<CardData>();
  /** Muestra el reverso (cuando el usuario edita el CVV). */
  readonly flipped = input(false);

  protected readonly maskedNumber = computed(() => maskCardNumber(this.card().number));
  protected readonly brand = computed(() => cardBrandLabel(detectCardBrand(this.card().number)));
}
