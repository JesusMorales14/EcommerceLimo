import { computed, inject, Injectable, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import type { Product } from '../models/product.model';
import { ProductService } from './product.service';
import { groupSearchResults } from './search-grouping';

export type { SearchBrand } from './search-grouping';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_LIMIT = 100;

/** Estado del buscador global (modal de resultados agrupados por marca). */
@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly query$ = new Subject<string>();

  readonly isOpen = signal(false);
  readonly loading = signal(false);
  readonly query = signal('');
  readonly brands = signal<ReturnType<typeof groupSearchResults>['brands']>([]);
  readonly products = signal<Product[]>([]);
  readonly hasResults = computed(() => this.brands().length > 0 || this.products().length > 0);

  constructor() {
    this.query$
      .pipe(
        debounceTime(SEARCH_DEBOUNCE_MS),
        distinctUntilChanged(),
        tap(() => this.resetResults(true)),
        switchMap((query) => this.productService.search(query, 1, SEARCH_LIMIT)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: (page) => {
          const grouped = groupSearchResults(page.items, this.query());
          this.brands.set(grouped.brands);
          this.products.set(grouped.products);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
  }

  open(query: string): void {
    this.query.set(query);
    this.isOpen.set(true);
    this.loading.set(true);
    this.query$.next(query);
  }

  close(): void {
    this.isOpen.set(false);
    this.resetResults(false);
  }

  navigateTo(productId: number): void {
    this.close();
    void this.router.navigate(['/product', productId]);
  }

  private resetResults(loading: boolean): void {
    this.loading.set(loading);
    this.brands.set([]);
    this.products.set([]);
  }
}
