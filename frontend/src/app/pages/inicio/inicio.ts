import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart';
import { CategoryService } from '../../core/services/category.service';
import { DealSessionService } from '../../core/services/deal-session.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit, OnDestroy {
  private productService    = inject(ProductService);
  private cartService       = inject(CartService);
  private dealSessionService = inject(DealSessionService);
  categoryService           = inject(CategoryService);

  offerProducts    = signal<Product[]>([]);
  featuredProducts = signal<Product[]>([]);
  dealActive       = signal(false);
  countdown        = signal('--:--:--');

  private timerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.productService.getAll('tecnologia', undefined, 1, 8)
      .subscribe(res => this.featuredProducts.set(res.items));

    this.dealSessionService.getActive().subscribe(session => {
      if (!session) return;
      this.dealActive.set(true);
      this.productService.getOffers().subscribe(res => this.offerProducts.set(res.items.slice(0, 4)));
      this.startCountdown(new Date(session.endsAt));
    });
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  addToCart(product: Product) {
    this.cartService.addToCart(product);
  }

  private startCountdown(endsAt: Date) {
    const tick = () => {
      const remaining = endsAt.getTime() - Date.now();
      if (remaining <= 0) {
        this.clearTimer();
        this.dealActive.set(false);
        this.countdown.set('00:00:00');
        return;
      }
      const h = Math.floor(remaining / 3_600_000);
      const m = Math.floor((remaining % 3_600_000) / 60_000);
      const s = Math.floor((remaining % 60_000) / 1_000);
      this.countdown.set(
        `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      );
    };
    tick();
    this.timerId = setInterval(tick, 1000);
  }

  private clearTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}
