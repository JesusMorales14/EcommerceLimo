import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@core/services/cart.service';
import { FavoritesService } from '@core/services/favorites.service';
import { SearchService } from '@core/services/search.service';
import { ThemeService } from '@core/services/theme.service';
import { AccountMenu } from './components/account-menu/account-menu';
import { CategoryNav } from './components/category-nav/category-nav';
import { MobileMenu } from './components/mobile-menu/mobile-menu';
import { SearchResultsModal } from './components/search-results-modal/search-results-modal';

/** Duración de la animación de cierre del menú móvil (debe coincidir con el SCSS). */
const MOBILE_MENU_CLOSE_MS = 300;

/**
 * Cabecera principal: logo, buscador, acciones de usuario y navegación por categorías.
 * Actúa como contenedor; la UI específica vive en sus subcomponentes.
 */
@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    AccountMenu,
    CategoryNav,
    MobileMenu,
    SearchResultsModal,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  protected readonly cart = inject(CartService);
  protected readonly favorites = inject(FavoritesService);
  protected readonly theme = inject(ThemeService);
  protected readonly search = inject(SearchService);

  protected readonly searchQuery = signal('');
  protected readonly mobileMenuOpen = signal(false);
  protected readonly mobileMenuClosing = signal(false);

  protected openCart(): void {
    this.cart.openCart();
  }

  protected toggleTheme(event?: MouseEvent): void {
    this.theme.toggleWithTransition(event);
  }

  protected onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  /** Formularios sin FormsModule: mantiene @angular/forms fuera del bundle inicial. */
  protected submitSearch(event?: Event, query = this.searchQuery()): void {
    event?.preventDefault();
    const value = query.trim();
    if (!value) return;
    this.search.open(value);
    this.searchQuery.set('');
  }

  protected openMobileMenu(): void {
    this.mobileMenuClosing.set(false);
    this.mobileMenuOpen.set(true);
  }

  protected closeMobileMenu(): void {
    this.mobileMenuClosing.set(true);
    setTimeout(() => {
      this.mobileMenuOpen.set(false);
      this.mobileMenuClosing.set(false);
    }, MOBILE_MENU_CLOSE_MS);
  }
}
