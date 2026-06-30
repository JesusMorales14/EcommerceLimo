import type { OnInit} from '@angular/core';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { type Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart';
import { FavoritesService } from '../../core/services/favorites.service';
import { CategoryService } from '../../core/services/category.service';
import { CurrencyPenPipe } from '../../shared/pipes';

@Component({
  selector: 'app-product-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPenPipe],
  templateUrl: './product-list.html',
  styleUrl: './product-list.scss',
})
export class ProductListComponent implements OnInit {
  private productService  = inject(ProductService);
  private cartService     = inject(CartService);
  private categoryService = inject(CategoryService);
  private route           = inject(ActivatedRoute);
  private destroyRef      = inject(DestroyRef);
  favService              = inject(FavoritesService);

  titulo      = '';
  breadcrumb  = '';
  loading     = signal(true);

  baseProducts = signal<Product[]>([]);

  page   = signal(1);
  pages  = signal(1);
  total  = signal(0);
  sortBy = signal('relevance');

  private currentId    = '';
  private currentSubId = '';

  get catDesc(): string {
    return this.categoryService.findById(this.currentId)?.desc ?? '';
  }

  filteredProducts = computed(() => {
    const list = [...this.baseProducts()];
    switch (this.sortBy()) {
      case 'price-asc':  return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      default:           return list;
    }
  });

  ngOnInit() {
    this.route.params
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.currentId    = params['id'];
        this.currentSubId = params['subid'];
        this.page.set(1);
        this.load(this.currentId, this.currentSubId);
      });
  }

  addToCart(p: Product)              { this.cartService.addToCart(p); }
  toggleFav(p: Product, e: Event)    { e.stopPropagation(); this.favService.toggle(p); }
  discountedPrice(p: Product)        { return p.discount ? p.price * (1 - p.discount / 100) : p.price; }

  goToPage(p: number) {
    this.page.set(p);
    this.load(this.currentId, this.currentSubId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private load(id: string, subId?: string) {
    this.loading.set(true);
    const cat = this.categoryService.findById(id);

    if (cat) {
      if (subId) {
        const sub       = cat.subCategories.find(s => s.id === subId);
        this.titulo     = sub?.label ?? cat.label;
        this.breadcrumb = sub ? `Inicio / ${cat.label} / ${sub.label}` : `Inicio / ${cat.label}`;
      } else {
        this.titulo     = cat.label;
        this.breadcrumb = `Inicio / ${cat.label}`;
      }
    } else {
      this.titulo     = id;
      this.breadcrumb = `Inicio / ${id}`;
    }

    const isOffers = id === 'ofertas';

    if (isOffers) {
      this.productService.getOffers().subscribe({
        next: (res) => {
          this.baseProducts.set(res.items.filter(p => p.isOffer));
          this.total.set(res.total);
          this.pages.set(1);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    } else {
      this.productService.getAll(id, subId, this.page()).subscribe({
        next: (res) => {
          this.baseProducts.set(res.items);
          this.total.set(res.total);
          this.pages.set(res.pages);
          this.loading.set(false);
        },
        error: () => this.loading.set(false),
      });
    }
  }
}
