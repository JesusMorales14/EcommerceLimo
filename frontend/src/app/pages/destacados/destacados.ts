import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart';
import { FavoritesService } from '../../core/services/favorites.service';
import { CurrencyPenPipe } from '../../shared/pipes';

@Component({
  selector: 'app-destacados',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPenPipe],
  templateUrl: './destacados.html',
  styleUrl: './destacados.scss',
})
export class DestacadosPage implements OnInit {
  private productService = inject(ProductService);
  private cartService    = inject(CartService);
  favService             = inject(FavoritesService);

  loading = signal(true);
  private all = signal<Product[]>([]);

  searchText       = signal('');
  selectedBrand    = signal('');
  selectedCategory = signal('');
  sortBy           = signal('relevance');

  brands     = computed(() => [...new Set(this.all().map(p => p.brand))].sort());
  categories = computed(() => [...new Set(this.all().map(p => p.category))].sort());

  filteredProducts = computed(() => {
    let list = this.all();

    const text = this.searchText().toLowerCase().trim();
    if (text) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(text) ||
        p.brand.toLowerCase().includes(text) ||
        (p.description ?? '').toLowerCase().includes(text),
      );
    }

    const brand = this.selectedBrand();
    if (brand) list = list.filter(p => p.brand === brand);

    const cat = this.selectedCategory();
    if (cat) list = list.filter(p => p.category === cat);

    switch (this.sortBy()) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'name-asc':   return [...list].sort((a, b) => a.name.localeCompare(b.name));
      default:           return list;
    }
  });

  hasActiveFilters = computed(() =>
    !!this.searchText() || !!this.selectedBrand() || !!this.selectedCategory() || this.sortBy() !== 'relevance',
  );

  ngOnInit() {
    this.productService.getFeatured(200).subscribe({
      next: res => { this.all.set(res.items); this.loading.set(false); },
      error: ()  => this.loading.set(false),
    });
  }

  clearFilters() {
    this.searchText.set('');
    this.selectedBrand.set('');
    this.selectedCategory.set('');
    this.sortBy.set('relevance');
  }

  addToCart(p: Product)           { this.cartService.addToCart(p); }
  toggleFav(p: Product, e: Event) { e.stopPropagation(); this.favService.toggle(p); }
  discountedPrice(p: Product)     { return p.discount ? p.price * (1 - p.discount / 100) : p.price; }
}
