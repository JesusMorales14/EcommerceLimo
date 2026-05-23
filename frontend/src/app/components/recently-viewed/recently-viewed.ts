import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { CartService } from '../../core/services/cart';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-recently-viewed',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './recently-viewed.html',
  styleUrl: './recently-viewed.scss',
})
export class RecentlyViewed {
  rvService   = inject(RecentlyViewedService);
  cartService = inject(CartService);

  addToCart(p: Product, e: Event) {
    e.preventDefault();
    e.stopPropagation();
    this.cartService.addToCart(p);
  }
}
