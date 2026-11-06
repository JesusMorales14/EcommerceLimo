import type { Product } from '@core/models/product.model';
import { discountedPrice } from './pricing';

export type ProductSortKey = 'relevance' | 'price-asc' | 'price-desc' | 'name-asc';

export interface ProductSortOption {
  readonly value: ProductSortKey;
  readonly label: string;
}

export const PRODUCT_SORT_OPTIONS: readonly ProductSortOption[] = [
  { value: 'relevance', label: 'Más relevantes' },
  { value: 'price-asc', label: 'Menor precio' },
  { value: 'price-desc', label: 'Mayor precio' },
  { value: 'name-asc', label: 'A → Z' },
];

const COMPARATORS: Record<Exclude<ProductSortKey, 'relevance'>, (a: Product, b: Product) => number> = {
  'price-asc': (a, b) => discountedPrice(a) - discountedPrice(b),
  'price-desc': (a, b) => discountedPrice(b) - discountedPrice(a),
  'name-asc': (a, b) => a.name.localeCompare(b.name, 'es'),
};

/** Ordena una copia del listado (estrategia por clave; 'relevance' mantiene el orden original). */
export function sortProducts(products: readonly Product[], key: ProductSortKey): Product[] {
  return key === 'relevance' ? [...products] : [...products].sort(COMPARATORS[key]);
}
