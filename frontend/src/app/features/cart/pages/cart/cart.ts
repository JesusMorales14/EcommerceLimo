import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nPluralPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { CartItemCard } from '../../components/cart-item/cart-item';
import { CartSummary } from '../../components/cart-summary/cart-summary';

/** Página del carro de compras. */
@Component({
  selector: 'app-cart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, I18nPluralPipe, CartItemCard, CartSummary],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  protected readonly cart = inject(CartService);
  protected readonly productPlural = { '=1': '# producto', other: '# productos' };
}
