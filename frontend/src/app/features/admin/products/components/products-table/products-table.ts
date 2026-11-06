import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Product } from '@core/models/product.model';
import { CurrencyPenPipe } from '@shared/pipes';

const LOW_STOCK = 5;

/** Tabla de productos para escritorio con acciones de edición y borrado. */
@Component({
  selector: 'app-products-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './products-table.html',
  styleUrl: './products-table.scss',
})
export class ProductsTable {
  readonly products = input.required<readonly Product[]>();
  readonly edit = output<Product>();
  readonly remove = output<Product>();

  protected readonly lowStock = LOW_STOCK;
}
