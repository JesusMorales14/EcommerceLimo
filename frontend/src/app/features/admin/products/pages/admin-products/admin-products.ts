import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import type { Product } from '@core/models/product.model';
import { ConfirmService } from '@core/services/confirm.service';
import { ProductService } from '@core/services/product.service';
import { Pagination } from '@shared/components/pagination/pagination';
import { createClientPagination } from '@shared/utils/pagination';
import { AdminProductCard } from '../../components/admin-product-card/admin-product-card';
import { CategoryChips } from '../../components/category-chips/category-chips';
import { ProductFormPanel } from '../../components/product-form-panel/product-form-panel';
import { ProductsTable } from '../../components/products-table/products-table';

const PAGE_SIZE = 6;
const MAX_PRODUCTS = 500;

/** Estado del panel de edición: cerrado, creación o edición de un producto. */
type FormState = { open: false } | { open: true; product: Product | null };

/** Administración del catálogo de productos. */
@Component({
  selector: 'app-admin-products',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, AdminProductCard, CategoryChips, ProductFormPanel, ProductsTable, Pagination],
  templateUrl: './admin-products.html',
  styleUrl: './admin-products.scss',
})
export class AdminProductsPage {
  private readonly productService = inject(ProductService);
  private readonly confirmService = inject(ConfirmService);

  protected readonly productsResource = rxResource({
    stream: () => this.productService.getAll(undefined, undefined, 1, MAX_PRODUCTS),
  });
  private readonly products = computed(() =>
    this.productsResource.hasValue() ? this.productsResource.value().items : [],
  );

  readonly search = signal('');
  readonly selectedCategory = signal('');
  protected readonly formState = signal<FormState>({ open: false });

  protected readonly categories = computed(() => [...new Set(this.products().map((p) => p.category))].sort());
  readonly filteredProducts = computed(() => {
    const query = this.search().toLowerCase().trim();
    const category = this.selectedCategory();
    return this.products().filter(
      (p) =>
        (!category || p.category === category) &&
        (!query || p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query)),
    );
  });
  protected readonly pager = createClientPagination(this.filteredProducts, PAGE_SIZE);

  constructor() {
    // Al cambiar los filtros se vuelve a la primera página.
    effect(() => {
      this.search();
      this.selectedCategory();
      this.pager.reset();
    });
  }

  protected openCreate(): void {
    this.formState.set({ open: true, product: null });
  }

  protected openEdit(product: Product): void {
    this.formState.set({ open: true, product });
  }

  protected closeForm(): void {
    this.formState.set({ open: false });
  }

  protected onSaved(): void {
    this.closeForm();
    this.productsResource.reload();
  }

  protected remove(product: Product): void {
    if (!this.confirmService.confirm(`¿Eliminar "${product.name}"?`)) return;
    this.productService.delete(product.id).subscribe(() => this.productsResource.reload());
  }
}
