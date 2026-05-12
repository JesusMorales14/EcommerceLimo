import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class SearchPage implements OnInit {
  private productService = inject(ProductService);
  private cartService    = inject(CartService);
  favService             = inject(FavoritesService);
  private route          = inject(ActivatedRoute);

  query    = signal('');
  products = signal<Product[]>([]);
  total    = signal(0);
  page     = signal(1);
  pages    = signal(1);
  loading  = signal(false);
  sortBy   = signal('relevance');

  filteredProducts = computed(() => {
    const list = [...this.products()];
    switch (this.sortBy()) {
      case 'price-asc':  return list.sort((a, b) => a.price - b.price);
      case 'price-desc': return list.sort((a, b) => b.price - a.price);
      default: return list;
    }
  });

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const q = params['q'] ?? '';
      this.query.set(q);
      this.page.set(1);
      if (q) this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.productService.search(this.query(), this.page()).subscribe({
      next: (res) => {
        this.products.set(res.items);
        this.total.set(res.total);
        this.pages.set(res.pages);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  goToPage(p: number) {
    this.page.set(p);
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  discountedPrice(p: Product) {
    return p.discount ? p.price * (1 - p.discount / 100) : p.price;
  }

  addToCart(p: Product) { this.cartService.addToCart(p); }
  toggleFav(p: Product, e: Event) { e.stopPropagation(); this.favService.toggle(p); }
}
