import { SITE_CONFIG } from '@core/config/site.config';
import type { Product } from '@core/models/product.model';
import type { ReviewStats } from '@core/services/review.service';
import type { JsonLd, PageSeo } from '@core/seo/seo.model';
import { discountedPrice } from '@shared/utils/pricing';

const DESCRIPTION_MAX_LENGTH = 155;

const truncate = (text: string, max: number) =>
  text.length <= max ? text : `${text.slice(0, max - 1).trimEnd()}…`;

/** Metadatos SEO de la página de un producto. */
export function buildProductSeo(product: Product): PageSeo {
  return {
    title: `${product.name} - ${product.brand}`,
    description: truncate(product.description || product.name, DESCRIPTION_MAX_LENGTH),
    image: product.images[0],
    type: 'product',
    path: `/product/${product.id}`,
  };
}

/** Datos estructurados schema.org/Product (rich results de Google). */
export function buildProductJsonLd(product: Product, stats: ReviewStats): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    sku: String(product.id),
    brand: { '@type': 'Brand', name: product.brand },
    category: product.category,
    offers: {
      '@type': 'Offer',
      priceCurrency: SITE_CONFIG.currency,
      price: discountedPrice(product).toFixed(2),
      availability:
        product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
    },
    ...(stats.total > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: stats.average,
        reviewCount: stats.total,
      },
    }),
  };
}
