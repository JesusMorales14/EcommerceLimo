import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Product } from '@core/models/product.model';
import { CurrencyPenPipe } from '@shared/pipes';

const LOW_STOCK = 5;

/** Tarjeta de producto para la vista móvil del administrador. */
@Component({
  selector: 'app-admin-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './admin-product-card.html',
  styleUrl: './admin-product-card.scss',
})
export class AdminProductCard {
  readonly product = input.required<Product>();
  readonly edit = output<Product>();
  readonly remove = output<Product>();

  protected readonly lowStock = LOW_STOCK;
}
