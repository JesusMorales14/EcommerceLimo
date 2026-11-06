import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ProductSortKey } from '@shared/utils/product-sort';
import { PRODUCT_SORT_OPTIONS } from '@shared/utils/product-sort';

/** Barra de filtros de productos destacados (texto, marca, categoría y orden). */
@Component({
  selector: 'app-featured-filters',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './featured-filters.html',
  styleUrl: './featured-filters.scss',
})
export class FeaturedFilters {
  readonly brands = input<readonly string[]>([]);
  readonly categories = input<readonly string[]>([]);
  readonly hasActiveFilters = input(false);

  readonly searchText = model('');
  readonly brand = model('');
  readonly category = model('');
  readonly sort = model<ProductSortKey>('relevance');
  readonly cleared = output<void>();

  protected readonly sortOptions = PRODUCT_SORT_OPTIONS;
}
