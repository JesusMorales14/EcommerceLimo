import { ChangeDetectionStrategy, Component, inject, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Product } from '../../core/models/product.model';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart';
import { FavoritesService } from '../../core/services/favorites.service';
import { ReviewService, Review, ReviewStats } from '../../core/services/review.service';
import { AuthService } from '../../core/services/auth.service';
import { RecentlyViewedService } from '../../core/services/recently-viewed.service';
import { SITE_CONFIG } from '../../core/config/site.config';
import { CurrencyPenPipe } from '../../shared/pipes';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPenPipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent implements OnInit {
  private route                 = inject(ActivatedRoute);
  private productService        = inject(ProductService);
  private cartService           = inject(CartService);
  private reviewService         = inject(ReviewService);
  private recentlyViewedService = inject(RecentlyViewedService);
  authService                   = inject(AuthService);
  favService                    = inject(FavoritesService);

  readonly siteConfig = SITE_CONFIG;

  producto      = signal<Product | null>(null);
  loading       = signal(true);
  selectedImage = signal(0);
  activeTab     = signal(0);
  quantity      = signal(1);
  selectedSize  = signal('');
  selectedColor = signal(0);

  activeImages = computed(() => {
    const p = this.producto();
    if (!p) return [];
    const colorName = p.colors?.[this.selectedColor()];
    if (colorName && p.colorImages?.[colorName]?.length) {
      return p.colorImages[colorName];
    }
    return p.images;
  });

  reviews        = signal<Review[]>([]);
  reviewStats    = signal<ReviewStats | null>(null);
  loadingReviews = signal(false);
  newRating      = signal(5);
  newComment     = '';
  submitting     = signal(false);
  reviewError    = signal('');

  tabs = computed(() => {
    const total = this.reviewStats()?.total ?? 0;
    return ['Descripción', 'Especificaciones', `Opiniones (${total})`];
  });

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getById(id).subscribe({
      next: (p) => {
        this.producto.set(p);
        if (p.sizes?.length) this.selectedSize.set(p.sizes[0]);
        this.loading.set(false);
        this.loadReviews(id);
        this.recentlyViewedService.add(p);
      },
      error: () => this.loading.set(false)
    });
  }

  private loadReviews(productId: number) {
    this.loadingReviews.set(true);
    this.reviewService.getByProduct(productId).subscribe({
      next: (r) => { this.reviews.set(r); this.loadingReviews.set(false); },
      error: () => this.loadingReviews.set(false),
    });
    this.reviewService.getStats(productId).subscribe({
      next: (s) => this.reviewStats.set(s),
    });
  }

  submitReview() {
    const p = this.producto();
    if (!p) return;
    if (!this.newComment.trim()) {
      this.reviewError.set('Escribe un comentario.');
      return;
    }
    this.submitting.set(true);
    this.reviewError.set('');
    this.reviewService.create(p.id, this.newRating(), this.newComment).subscribe({
      next: (r) => {
        this.reviews.update(rs => [r, ...rs]);
        this.reviewStats.update(s => s ? { ...s, total: s.total + 1 } : s);
        this.newComment = '';
        this.newRating.set(5);
        this.submitting.set(false);
      },
      error: (err) => {
        this.reviewError.set(err.error?.message ?? 'Error al publicar la reseña.');
        this.submitting.set(false);
      },
    });
  }

  distPct(star: number) {
    const s = this.reviewStats();
    if (!s || !s.total) return 0;
    return Math.round(((s.distribution[star] ?? 0) / s.total) * 100);
  }

  starsStr(n: number)      { return '★'.repeat(Math.max(0, Math.round(n))); }
  emptyStarsStr(n: number) { return '☆'.repeat(Math.max(0, 5 - Math.round(n))); }

  addToCart() {
    const p = this.producto();
    if (!p || p.stock === 0) return;
    const colorName = p.colors?.[this.selectedColor()] ?? undefined;
    const imgs = this.activeImages();
    const imageUrl = imgs.length ? imgs[0] : undefined;
    this.cartService.addToCart(p, this.quantity(), colorName, imageUrl);
  }

  toggleFav() {
    const p = this.producto();
    if (p) this.favService.toggle(p);
  }

  incQty() {
    const max = this.producto()?.stock ?? 99;
    this.quantity.update(q => Math.min(max, q + 1));
  }
  decQty() { this.quantity.update(q => Math.max(1, q - 1)); }

  selectColor(index: number) {
    this.selectedColor.set(index);
    this.selectedImage.set(0);
  }

  get discountedPrice() {
    const p = this.producto();
    if (!p) return 0;
    return p.discount ? p.price * (1 - p.discount / 100) : p.price;
  }

  get installment() { return this.discountedPrice / 12; }
}
