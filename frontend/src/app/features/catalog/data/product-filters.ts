import type { Product } from '@core/models/product.model';

export interface ProductFilterCriteria {
  readonly text: string;
  readonly brand: string;
  readonly category: string;
}

const includesText = (product: Product, text: string) =>
  [product.name, product.brand, product.description ?? ''].some((field) => field.toLowerCase().includes(text));

/** Aplica los filtros de texto, marca y categoría (criterios vacíos se ignoran). */
export function filterProducts(products: readonly Product[], criteria: ProductFilterCriteria): Product[] {
  const text = criteria.text.trim().toLowerCase();
  return products.filter(
    (product) =>
      (!text || includesText(product, text)) &&
      (!criteria.brand || product.brand === criteria.brand) &&
      (!criteria.category || product.category === criteria.category),
  );
}

/** Valores únicos ordenados de un campo (para poblar selects de filtros). */
export function uniqueSorted(products: readonly Product[], field: 'brand' | 'category'): string[] {
  return [...new Set(products.map((product) => product[field]))].sort((a, b) => a.localeCompare(b, 'es'));
}
