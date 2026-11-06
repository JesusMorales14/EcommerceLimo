import { ChangeDetectionStrategy, Component, computed, effect, inject, input, numberAttribute } from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { SeoService } from '@core/seo/seo.service';
import type { BreadcrumbItem } from '@shared/components/breadcrumb/breadcrumb';
import { Breadcrumb } from '@shared/components/breadcrumb/breadcrumb';
import { ProductGallery } from '../../components/product-detail/product-gallery/product-gallery';
import { ProductPurchasePanel } from '../../components/product-detail/product-purchase-panel/product-purchase-panel';
import { ProductTabs } from '../../components/product-detail/product-tabs/product-tabs';
import { ProductDetailStore } from '../../data/product-detail.store';
import { buildProductJsonLd, buildProductSeo } from '../../data/product-seo';

/** Página de detalle de producto (contenedor). */
@Component({
  selector: 'app-product-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Breadcrumb, ProductGallery, ProductPurchasePanel, ProductTabs],
  providers: [ProductDetailStore, TitleCasePipe],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss',
})
export class ProductDetailComponent {
  /** Parámetro `:id` de la ruta (enlazado mediante `withComponentInputBinding`). */
  readonly id = input.required({ transform: numberAttribute });

  protected readonly store = inject(ProductDetailStore);
  private readonly seo = inject(SeoService);
  private readonly titleCase = inject(TitleCasePipe);

  protected readonly breadcrumb = computed<BreadcrumbItem[]>(() => {
    const product = this.store.product();
    if (!product) return [];
    return [
      { label: 'Inicio', link: '/' },
      { label: this.titleCase.transform(product.category), link: ['/category', product.category] },
      { label: product.name },
    ];
  });

  constructor() {
    effect(() => this.store.load(this.id()));
    effect(() => {
      const product = this.store.product();
      if (!product) return;
      this.seo.update(buildProductSeo(product));
      this.seo.setJsonLd(buildProductJsonLd(product, this.store.stats()));
    });
  }
}
