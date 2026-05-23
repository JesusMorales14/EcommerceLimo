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

  offerProducts      = signal<Product[]>([]);
  featuredProducts   = signal<Product[]>([]);
  dealActive         = signal(false);
  countdown          = signal('--:--:--');
  scheduledSession   = signal<{ startsAt: string; endsAt: string } | null>(null);
  teaserCountdown    = signal('--:--:--');

  private timerId:      ReturnType<typeof setInterval> | null = null;
  private pollerId:     ReturnType<typeof setInterval> | null = null;
  private teaserTimerId: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.productService.getFeatured(8)
      .subscribe(res => this.featuredProducts.set(res.items));

    this.checkDeal();
    this.pollerId = setInterval(() => this.checkDeal(), 30_000);
  }

  ngOnDestroy() {
    this.clearTimer();
    this.clearPoller();
    this.clearTeaserTimer();
  }

  private checkDeal() {
    if (this.dealActive()) return;
    this.dealSessionService.getActive().subscribe(session => {
      if (session) {
        this.scheduledSession.set(null);
        this.clearTeaserTimer();
        this.dealActive.set(true);
        this.productService.getOffers().subscribe(res => this.offerProducts.set(res.items.slice(0, 4)));
        this.startCountdown(new Date(session.endsAt));
        return;
      }
      // Sin sesión activa — verificar si hay una programada
      this.dealSessionService.getScheduled().subscribe(scheduled => {
        if (scheduled && !this.scheduledSession()) {
          this.scheduledSession.set(scheduled);
          this.startTeaserCountdown(new Date(scheduled.startsAt));
        } else if (!scheduled) {
          this.scheduledSession.set(null);
          this.clearTeaserTimer();
        }
      });
    });
  }

  private startTeaserCountdown(startsAt: Date) {
    this.clearTeaserTimer();
    const tick = () => {
      const diff = startsAt.getTime() - Date.now();
      if (diff <= 0) {
        this.clearTeaserTimer();
        this.teaserCountdown.set('00:00:00');
        return;
      }
      this.teaserCountdown.set(this.fmt(diff));
    };
    tick();
    this.teaserTimerId = setInterval(tick, 1000);
  }

  private fmt(ms: number): string {
    const h = Math.floor(ms / 3_600_000);
    const m = Math.floor((ms % 3_600_000) / 60_000);
    const s = Math.floor((ms % 60_000) / 1_000);
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  private clearTeaserTimer() {
    if (this.teaserTimerId !== null) { clearInterval(this.teaserTimerId); this.teaserTimerId = null; }
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
        this.pollerId = setInterval(() => this.checkDeal(), 30_000);
        return;
      }
      this.countdown.set(this.fmt(remaining));
    };
    this.clearPoller();
    tick();
    this.timerId = setInterval(tick, 1000);
  }

  private clearTimer() {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private clearPoller() {
    if (this.pollerId !== null) {
      clearInterval(this.pollerId);
      this.pollerId = null;
    }
  }
}
