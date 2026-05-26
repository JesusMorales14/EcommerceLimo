import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart';
import { AuthService } from '../../core/services/auth.service';
import { CurrencyPenPipe } from '../../shared/pipes';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPenPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  cartService = inject(CartService);
  authService = inject(AuthService);
  private router = inject(Router);

  get items() { return this.cartService.getItems()(); }

  checkout() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login'], { state: { redirect: '/checkout' } });
      return;
    }
    this.router.navigate(['/checkout']);
  }
}
