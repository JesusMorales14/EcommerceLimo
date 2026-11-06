import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18nPluralPipe } from '@angular/common';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '@core/services/product.service';
import type { BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { ProductCard } from '@shared/components/product-card/product-card';
import type { ProductSortKey } from '@shared/utils/product-sort';
import { sortProducts } from '@shared/utils/product-sort';
import { FeaturedFilters } from '../../components/featured-filters/featured-filters';
import { filterProducts, uniqueSorted } from '../../data/product-filters';

const FEATURED_LIMIT = 200;
const STAGGER_STEP_MS = 45;
const STAGGER_GROUP = 16;

/** Página de productos destacados con filtros en cliente. */
@Component({
  selector: 'app-destacados',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [I18nPluralPipe, Breadcrumb, ProductCard, FeaturedFilters],
  templateUrl: './destacados.html',
  styleUrl: './destacados.scss',
})
export class DestacadosPage {
  private readonly productService = inject(ProductService);

  protected readonly breadcrumb: BreadcrumbItem[] = [{ label: 'Inicio', link: '/' }, { label: 'Productos Destacados' }];
  protected readonly productPlural = { '=1': '# producto', other: '# productos' };

  private readonly featured = rxResource({ stream: () => this.productService.getFeatured(FEATURED_LIMIT) });
  private readonly all = computed(() => (this.featured.hasValue() ? this.featured.value().items : []));
  readonly loading = this.featured.isLoading;

  readonly searchText = signal('');
  readonly selectedBrand = signal('');
  readonly selectedCategory = signal('');
  readonly sortBy = signal<ProductSortKey>('relevance');

  readonly brands = computed(() => uniqueSorted(this.all(), 'brand'));
  readonly categories = computed(() => uniqueSorted(this.all(), 'category'));

  readonly filteredProducts = computed(() =>
    sortProducts(
      filterProducts(this.all(), {
        text: this.searchText(),
        brand: this.selectedBrand(),
        category: this.selectedCategory(),
      }),
      this.sortBy(),
    ),
  );

  readonly hasActiveFilters = computed(
    () => !!this.searchText() || !!this.selectedBrand() || !!this.selectedCategory() || this.sortBy() !== 'relevance',
  );

  clearFilters(): void {
    this.searchText.set('');
    this.selectedBrand.set('');
    this.selectedCategory.set('');
    this.sortBy.set('relevance');
  }

  protected animationDelay(index: number): number {
    return (index % STAGGER_GROUP) * STAGGER_STEP_MS;
  }
}
