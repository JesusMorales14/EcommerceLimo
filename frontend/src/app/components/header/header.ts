import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';
import { ThemeService } from '../../core/services/theme.service';
import { CategoryService } from '../../core/services/category.service';
import { SearchService } from '../../core/services/search.service';
import { CurrencyPenPipe } from '../../shared/pipes/currency-pen.pipe';

@Component({
  selector: 'app-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule, CurrencyPenPipe],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  cartService     = inject(CartService);
  authService     = inject(AuthService);
  favService      = inject(FavoritesService);
  themeService    = inject(ThemeService);
  categoryService = inject(CategoryService);
  searchService   = inject(SearchService);

  showAccountMenu   = signal(false);
  mobileSearchOpen  = signal(false);
  mobileMenuOpen    = signal(false);
  mobileMenuClosing = signal(false);
  searchQuery      = '';
  modalSearchInput = '';

  openCart()           { this.cartService.openCart(); }
  toggleAccountMenu()  { this.showAccountMenu.update(v => !v); }
  closeAccountMenu()   { this.showAccountMenu.set(false); }
  openMobileSearch()   { this.mobileSearchOpen.set(true); }
  closeMobileSearch()  { this.mobileSearchOpen.set(false); this.searchQuery = ''; }
  openMobileMenu(): void {
    this.mobileMenuClosing.set(false);
    this.mobileMenuOpen.set(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuClosing.set(true);
    setTimeout(() => {
      this.mobileMenuOpen.set(false);
      this.mobileMenuClosing.set(false);
    }, 300);
  }

  toggleTheme(event?: MouseEvent): void {
    const x = event?.clientX ?? (window.innerWidth - 32);
    const y = event?.clientY ?? 32;
    const maxR = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    );

    if (!('startViewTransition' in document)) {
      this.themeService.toggle();
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transition = (document as any).startViewTransition(() => {
      this.themeService.toggle();
    });

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
        { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      );
    });
  }

  search(): void {
    const q = this.searchQuery.trim();
    if (!q) return;
    this.searchService.open(q);
    this.modalSearchInput = q;
    this.searchQuery = '';
    this.mobileSearchOpen.set(false);
  }

  doModalSearch(): void {
    const q = this.modalSearchInput.trim();
    if (!q) return;
    this.searchService.open(q);
  }

  logout(): void {
    this.authService.logout();
    this.showAccountMenu.set(false);
  }
}
