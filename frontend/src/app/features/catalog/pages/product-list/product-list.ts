import { ChangeDetectionStrategy, Component, computed, effect, inject, input, linkedSignal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CategoryService } from '@core/services/category.service';
import type { ProductPage } from '@core/services/product.service';
import { ProductService } from '@core/services/product.service';
import { SeoService } from '@core/seo/seo.service';
import type { BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { Pagination } from '@shared/components/pagination/pagination';
import { ProductCard } from '@shared/components/product-card/product-card';
import type { ProductSortKey } from '@shared/utils/product-sort';
import { sortProducts } from '@shared/utils/product-sort';
import { CatalogToolbar } from '../../components/catalog-toolbar/catalog-toolbar';

const OFFERS_CATEGORY_ID = 'ofertas';
const STAGGER_STEP_MS = 55;
const STAGGER_GROUP = 12;

/** Listado de productos de una categoría / subcategoría. */
@Component({
  selector: 'app-product-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, CatalogToolbar, ProductCard, Pagination],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent {
  /** Parámetros de ruta `:id` y `:subid`. */
  readonly id = input.required<string>();
  readonly subid = input<string>();

  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly seo = inject(SeoService);

  /** Página actual: vuelve a 1 cada vez que cambia la categoría. */
  protected readonly page = linkedSignal({ source: () => `${this.id()}/${this.subid() ?? ''}`, computation: () => 1 });
  protected readonly sortBy = linkedSignal<string, ProductSortKey>({ source: this.id, computation: () => 'relevance' });

  protected readonly productsResource = rxResource<ProductPage, { id: string; subid?: string; page: number }>({
    params: () => ({ id: this.id(), subid: this.subid(), page: this.page() }),
    stream: ({ params }) =>
      params.id === OFFERS_CATEGORY_ID
        ? this.productService.getOffers()
        : this.productService.getAll(params.id, params.subid, params.page),
  });

  protected readonly category = computed(() => this.categoryService.findById(this.id()));
  protected readonly subCategory = computed(() =>
    this.category()?.subCategories.find((sub) => sub.id === this.subid()),
  );
  protected readonly title = computed(() => this.subCategory()?.label ?? this.category()?.label ?? this.id());
  protected readonly description = computed(() => this.category()?.desc ?? '');
  /** Página de resultados actual (vacía mientras carga o si hubo error). */
  private readonly result = computed(() =>
    this.productsResource.hasValue() ? this.productsResource.value() : undefined,
  );
  protected readonly total = computed(() => this.result()?.total ?? 0);
  protected readonly totalPages = computed(() =>
    this.id() === OFFERS_CATEGORY_ID ? 1 : (this.result()?.pages ?? 1),
  );
  protected readonly products = computed(() => sortProducts(this.result()?.items ?? [], this.sortBy()));

  protected readonly breadcrumb = computed<BreadcrumbItem[]>(() => {
    const category = this.category();
    const items: BreadcrumbItem[] = [{ label: 'Inicio', link: '/' }];
    if (!category) return [...items, { label: this.id() }];
    items.push({ label: category.label, link: ['/category', category.id] });
    const sub = this.subCategory();
    return sub ? [...items, { label: sub.label }] : items;
  });

  constructor() {
    effect(() =>
      this.seo.update({
        title: this.title(),
        description: this.description() || `Compra ${this.title()} online en EcommerceLimo.`,
      }),
    );
  }

  protected animationDelay(index: number): number {
    return (index % STAGGER_GROUP) * STAGGER_STEP_MS;
  }

  protected goToPage(page: number): void {
    this.page.set(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
