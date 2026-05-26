import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { type Product } from '../models/product.model';
import { ProductService } from './product.service';

export interface SearchBrand {
  name: string;
  products: Product[];
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private productService = inject(ProductService);
  private router         = inject(Router);

  isOpen   = signal(false);
  loading  = signal(false);
  query    = signal('');
  brands   = signal<SearchBrand[]>([]);
  products = signal<Product[]>([]);

  private query$ = new Subject<string>();

  constructor() {
    this.query$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(q => {
        this.loading.set(true);
        this.brands.set([]);
        this.products.set([]);
        return this.productService.search(q, 1, 100);
      }),
    ).subscribe({
      next: (res) => {
        const q = this.query();
        const brandMap = new Map<string, Product[]>();
        const brandMatchedIds = new Set<number>();

        for (const p of res.items) {
          if (this.isRelevant(p.brand, q)) {
            if (!brandMap.has(p.brand)) brandMap.set(p.brand, []);
            brandMap.get(p.brand)!.push(p);
            brandMatchedIds.add(p.id);
          }
        }

        this.brands.set(
          Array.from(brandMap.entries()).map(([name, prods]) => ({ name, products: prods }))
        );
        this.products.set(
          res.items.filter(p => !brandMatchedIds.has(p.id) && this.isRelevant(p.name, q))
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  hasResults(): boolean {
    return this.brands().length > 0 || this.products().length > 0;
  }

  open(q: string): void {
    this.query.set(q);
    this.isOpen.set(true);
    this.loading.set(true);
    this.query$.next(q);
  }

  close(): void {
    this.isOpen.set(false);
    this.brands.set([]);
    this.products.set([]);
  }

  navigateTo(productId: number): void {
    this.close();
    void this.router.navigate(['/product', productId]);
  }

  // Matches `q` at the start of a word in `text`, avoiding mid-word hits.
  private isRelevant(text: string, q: string): boolean {
    if (!text) return false;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(^|[\\s\\-_\\.])${escaped}`, 'i');
    return re.test(text.trim());
  }
}
