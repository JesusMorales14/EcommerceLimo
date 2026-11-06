import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { ProductSortKey } from '@shared/utils/product-sort';
import { PRODUCT_SORT_OPTIONS } from '@shared/utils/product-sort';

/** Barra de herramientas del listado: selector de orden. */
@Component({
  selector: 'app-catalog-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './catalog-toolbar.html',
  styleUrl: './catalog-toolbar.scss',
})
export class CatalogToolbar {
  /** Orden seleccionado (two-way binding: `[(sort)]`). */
  readonly sort = model<ProductSortKey>('relevance');
  /** Opciones disponibles (por defecto todas excepto alfabético). */
  readonly allowedOptions = input<readonly ProductSortKey[]>(['relevance', 'price-asc', 'price-desc']);

  protected readonly options = computed(() =>
    PRODUCT_SORT_OPTIONS.filter((option) => this.allowedOptions().includes(option.value)),
  );
}
