import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth.service';
import { FavoritesService } from '../../core/services/favorites.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  cartService     = inject(CartService);
  authService     = inject(AuthService);
  favService      = inject(FavoritesService);
  private router  = inject(Router);

  showAccountMenu = signal(false);
  mobileMenuOpen  = signal(false);
  searchQuery     = '';

  openCart() { this.cartService.openCart(); }
  toggleAccountMenu() { this.showAccountMenu.update(v => !v); }
  closeAccountMenu()  { this.showAccountMenu.set(false); }
  toggleMobileMenu()  { this.mobileMenuOpen.update(v => !v); }
  closeMobileMenu()   { this.mobileMenuOpen.set(false); }

  search() {
    const q = this.searchQuery.trim();
    if (!q) return;
    void this.router.navigate(['/search'], { queryParams: { q } });
    this.searchQuery = '';
  }

  logout() {
    this.authService.logout();
    this.showAccountMenu.set(false);
    this.mobileMenuOpen.set(false);
  }
}
