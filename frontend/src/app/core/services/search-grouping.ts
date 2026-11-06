import type { Product } from '../models/product.model';

export interface SearchBrand {
  name: string;
  products: Product[];
}

export interface GroupedSearchResults {
  brands: SearchBrand[];
  products: Product[];
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Coincide si `query` aparece al inicio de una palabra de `text` (evita aciertos a mitad de palabra). */
export function matchesWordStart(text: string | undefined, query: string): boolean {
  if (!text || !query) return false;
  return new RegExp(`(^|[\\s\\-_.])${escapeRegExp(query)}`, 'i').test(text.trim());
}

/**
 * Agrupa los resultados: primero por marca coincidente y, del resto,
 * los productos cuyo nombre coincide.
 */
export function groupSearchResults(items: readonly Product[], query: string): GroupedSearchResults {
  const byBrand = new Map<string, Product[]>();
  for (const product of items) {
    if (!matchesWordStart(product.brand, query)) continue;
    byBrand.set(product.brand, [...(byBrand.get(product.brand) ?? []), product]);
  }
  const brandMatched = new Set([...byBrand.values()].flat().map((p) => p.id));

  return {
    brands: [...byBrand.entries()].map(([name, products]) => ({ name, products })),
    products: items.filter((p) => !brandMatched.has(p.id) && matchesWordStart(p.name, query)),
  };
}
