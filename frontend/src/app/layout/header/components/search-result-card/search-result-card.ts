import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Product } from '@core/models/product.model';
import { CurrencyPenPipe } from '@shared/pipes';

/** Tarjeta compacta de producto dentro del modal de búsqueda. */
@Component({
  selector: 'app-search-result-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPenPipe],
  templateUrl: './search-result-card.html',
  styleUrl: './search-result-card.scss',
})
export class SearchResultCard {
  readonly product = input.required<Product>();
  readonly showBrand = input(false);
  readonly selected = output<number>();
}
