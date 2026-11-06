import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ProductService } from '@core/services/product.service';
import { DealTeaser } from '../../components/deal-teaser/deal-teaser';
import { DealsSection } from '../../components/deals-section/deals-section';
import { FeaturedSection } from '../../components/featured-section/featured-section';
import { HomeHero } from '../../components/home-hero/home-hero';
import { PromoBanners } from '../../components/promo-banners/promo-banners';
import { RecentlyViewed } from '../../components/recently-viewed/recently-viewed';
import { DealsStore } from '../../data/deals.store';

const FEATURED_SHOWN = 4;

/** Página de inicio: compone las secciones del home. */
@Component({
  selector: 'app-inicio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [HomeHero, DealTeaser, DealsSection, PromoBanners, RecentlyViewed, FeaturedSection],
  providers: [DealsStore],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  protected readonly deals = inject(DealsStore);
  private readonly productService = inject(ProductService);

  private readonly featured = rxResource({ stream: () => this.productService.getFeatured(FEATURED_SHOWN) });
  protected readonly featuredProducts = computed(() => (this.featured.hasValue() ? this.featured.value().items : []));
  protected readonly hasMoreFeatured = computed(
    () => this.featured.hasValue() && this.featured.value().total > FEATURED_SHOWN,
  );
}
