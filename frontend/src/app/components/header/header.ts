import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ThemeService } from '../../core/services/theme.service';
import { CategoryService } from '../../core/services/category.service';
import { ProductService } from '../../core/services/product.service';
import { Product } from '../../core/models/product.model';

interface SearchBrand {
  name: string;
  products: Product[];
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  cartService           = inject(CartService);
  authService           = inject(AuthService);
  favService            = inject(FavoritesService);
  themeService          = inject(ThemeService);
  categoryService       = inject(CategoryService);
  private productService = inject(ProductService);
  private router        = inject(Router);

  showAccountMenu  = signal(false);
  mobileSearchOpen = signal(false);
  mobileMenuOpen   = signal(false);
  searchQuery      = '';

  searchModalOpen    = signal(false);
  searchLoading      = signal(false);
  searchModalQuery   = signal('');
  searchBrands       = signal<SearchBrand[]>([]);
  searchProducts     = signal<Product[]>([]);
  modalSearchInput   = '';

  openCart()           { this.cartService.openCart(); }
  toggleAccountMenu()  { this.showAccountMenu.update(v => !v); }
  closeAccountMenu()   { this.showAccountMenu.set(false); }
  openMobileSearch()   { this.mobileSearchOpen.set(true); }
  closeMobileSearch()  { this.mobileSearchOpen.set(false); this.searchQuery = ''; }
  openMobileMenu()     { this.mobileMenuOpen.set(true); }
  closeMobileMenu()    { this.mobileMenuOpen.set(false); }
  toggleTheme()        { this.themeService.toggle(); }

  search() {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.openSearchModal(q);
    this.searchQuery = '';
    this.mobileSearchOpen.set(false);
  }

  openSearchModal(q: string) {
    this.searchModalQuery.set(q);
    this.modalSearchInput = q;
    this.searchModalOpen.set(true);
    this.searchLoading.set(true);
    this.searchBrands.set([]);

    this.productService.search(q, 1, 100).subscribe({
      next: (res) => {
        // Section 1 – Brands: products whose BRAND matches the query.
        // Grouped by brand name so each brand appears as one block.
        const brandMap = new Map<string, Product[]>();
        const brandMatchedIds = new Set<number>();

        for (const p of res.items) {
          if (this.isRelevant(p.brand, q)) {
            if (!brandMap.has(p.brand)) brandMap.set(p.brand, []);
            brandMap.get(p.brand)!.push(p);
            brandMatchedIds.add(p.id);
          }
        }

        // Section 2 – Products: items whose NAME matches but whose brand
        // was not already shown in the Brands section (no duplication).
        const nameMatches = res.items.filter(
          p => !brandMatchedIds.has(p.id) && this.isRelevant(p.name, q)
        );

        this.searchBrands.set(
          Array.from(brandMap.entries()).map(([name, products]) => ({ name, products }))
        );
        this.searchProducts.set(nameMatches);
        this.searchLoading.set(false);
      },
      error: () => this.searchLoading.set(false),
    });
  }

  // True when `q` appears in `text` as a whole word or at the start of a word.
  // Uses a lookahead/lookbehind on word separators so "LG" matches "LG Smart TV"
  // and "LG" brand exactly, but NOT "algo" or words where LG is a mid-substring.
  private isRelevant(text: string, q: string): boolean {
    if (!text) return false;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match at start of string, after a space/dash/dot, or the full string equals q
    const re = new RegExp(`(^|[\\s\\-_\\.])${escaped}`, 'i');
    return re.test(text.trim());
  }

  hasResults() {
    return this.searchBrands().length > 0 || this.searchProducts().length > 0;
  }

  closeSearchModal() {
    this.searchModalOpen.set(false);
    this.searchBrands.set([]);
    this.searchProducts.set([]);
  }

  doModalSearch() {
    const q = this.modalSearchInput.trim();
    if (!q) return;
    this.openSearchModal(q);
  }

  navigateToProduct(id: number) {
    this.closeSearchModal();
    void this.router.navigate(['/product', id]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(price);
  }

  logout() {
    this.authService.logout();
    this.showAccountMenu.set(false);
  }
}
